import { SocketMessageType } from '@app/shared';
import { Process, Processor } from '@nestjs/bull';
import { NovelStatus } from '@prisma/client';
import type { Job } from 'bull';
import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import * as jschardet from 'jschardet';
import * as readline from 'readline';
import { PrismaService } from '../../prisma/prisma.service';
import { NovelGateway } from './novel.gateway';

/**
 * 小说异步处理器
 * 监听 'novel-processing' 队列，处理小说文件的解析和入库
 */
@Processor('novel-processing')
export class NovelProcessor {
  constructor(
    private prisma: PrismaService,
    private novelGateway: NovelGateway,
  ) {}

  /**
   * 处理小说解析任务
   * 1. 更新状态为 PROCESSING
   * 2. 检测文件编码 (GBK/UTF-8)
   * 3. 流式读取文件，正则匹配章节
   * 4. 批量写入数据库
   * 5. 更新状态为 COMPLETED/FAILED
   * 6. 删除源文件
   */
  @Process('process-novel')
  async handleTranscode(job: Job<{ novelId: number; filepath: string; clientId?: string }>) {
    const { novelId, filepath, clientId } = job.data;
    console.log(`Start processing novel ${novelId} from ${filepath}...`);

    try {
      // 更新状态为处理中
      await this.prisma.novel.update({
        where: { id: novelId },
        data: { status: NovelStatus.PROCESSING },
      });

      if (clientId) {
        this.novelGateway.sendToClient(clientId, SocketMessageType.NOVEL_Processing, '开始解析', {
          novelId,
        });
      }

      // 1. 检测文件编码 (读取前 4KB)
      const fd = fs.openSync(filepath, 'r');
      const buffer = Buffer.alloc(4096);
      fs.readSync(fd, buffer, 0, 4096, 0);
      fs.closeSync(fd);

      const detected = jschardet.detect(buffer);
      // 默认使用 UTF-8，如果检测到 GBK 系列编码则切换
      let encoding = 'UTF-8';
      if (detected && detected.encoding) {
        const enc = detected.encoding.toUpperCase();
        if (enc === 'GB2312' || enc === 'GBK' || enc === 'GB18030') {
          encoding = 'GBK';
        }
      }
      console.log(`Detected encoding: ${encoding} (${detected?.confidence})`);

      // 2. 流式读取 & 逐行解析
      const fileStream = fs.createReadStream(filepath);
      // 使用 iconv-lite 进行流式解码，防止乱码
      const decodedStream = fileStream.pipe(iconv.decodeStream(encoding));

      const rl = readline.createInterface({
        input: decodedStream,
        crlfDelay: Infinity,
      });

      let currentChapter: {
        title: string;
        content: string;
        order: number;
        wordCount: number;
      } | null = null;
      let order = 1;
      let bufferChapters: {
        title: string;
        content: string;
        order: number;
        wordCount: number;
      }[] = [];
      const BATCH_SIZE = 10; // Reduce batch size for faster real-time updates

      // 章节标题正则匹配
      // 放宽限制以支持 "正文 第1章"、"VIP卷 第1章" 等格式，不强制行首
      const chapterRegex = /(?:第\s*[0-9一二三四五六七八九十百千万]+\s*章)|(?:Chapter\s+\d+)/;

      for await (const line of rl) {
        // 增加行长度检查 (< 100)，防止正文中出现的 "第x章" 被误判为标题
        if (line.length < 100 && chapterRegex.test(line)) {
          // 如果已有当前章节，先保存到缓冲区
          if (currentChapter) {
            bufferChapters.push(currentChapter);
            // 缓冲区满，批量写入数据库
            if (bufferChapters.length >= BATCH_SIZE) {
              await this.saveChapters(bufferChapters, novelId, clientId);
              bufferChapters = [];
            }
          }
          // 开始新章节
          currentChapter = {
            title: line.trim().substring(0, 255), // 截断标题防止过长
            content: '',
            order: order++,
            wordCount: 0,
          };
        } else {
          // 追加内容到当前章节
          if (currentChapter) {
            // 添加换行符以保持格式
            currentChapter.content += line + '\n';
            currentChapter.wordCount += line.length;
          }
        }
      }

      // 处理剩余章节
      if (currentChapter) {
        bufferChapters.push(currentChapter);
      }
      if (bufferChapters.length > 0) {
        await this.saveChapters(bufferChapters, novelId, clientId);
      }

      // 3. 完成处理
      await this.prisma.novel.update({
        where: { id: novelId },
        data: { status: NovelStatus.COMPLETED },
      });
      if (clientId) {
        this.novelGateway.sendToClient(clientId, SocketMessageType.NOVEL_Completed, '解析完成', {
          novelId,
        });
      }
      console.log(`Novel ${novelId} processing completed.`);

      // 4. 删除源文件
      this.deleteFile(filepath);
    } catch (error) {
      console.error(`Error processing novel ${novelId}:`, error);
      // 发生错误，更新状态为失败
      await this.prisma.novel.update({
        where: { id: novelId },
        data: { status: NovelStatus.FAILED },
      });
      if (clientId) {
        this.novelGateway.sendToClient(clientId, SocketMessageType.NOVEL_Failed, '解析失败', {
          novelId,
          error: String(error),
        });
      }
      // 即使失败也删除文件
      this.deleteFile(filepath);
    }
  }

  // 批量保存章节到数据库
  private async saveChapters(chapters: any[], novelId: number, clientId?: string) {
    if (chapters.length === 0) return;
    try {
      // 批量创建
      await this.prisma.chapter.createMany({
        data: chapters.map((c) => ({
          ...c,
          novelId,
        })),
      });

      // 发送进度通知
      if (clientId) {
        // 查询刚刚保存的章节以获取 ID
        const savedChapters = await this.prisma.chapter.findMany({
          where: {
            novelId,
            order: {
              gte: chapters[0].order,
              lte: chapters[chapters.length - 1].order,
            },
          },
          select: { id: true, title: true, order: true, wordCount: true, novelId: true },
        });

        this.novelGateway.sendToClient(
          clientId,
          SocketMessageType.NOVEL_ChapterUpdate,
          '章节更新',
          savedChapters,
        );
      }
    } catch (e) {
      console.error('Failed to save chapters batch', e);
      throw e;
    }
  }

  // 删除本地文件
  private deleteFile(filepath: string) {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`Deleted file: ${filepath}`);
      }
    } catch (e) {
      console.error(`Failed to delete file ${filepath}`, e);
    }
  }
}

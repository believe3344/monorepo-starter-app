import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { NovelStatus } from '@prisma/client';
import type { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 小说业务服务
 * 处理小说上传、查询、章节获取等逻辑
 */
@Injectable()
export class NovelService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('novel-processing') private novelQueue: Queue,
  ) {}

  /**
   * 创建小说（上传后初始化）
   * 1. 在数据库创建记录
   * 2. 将文件解析任务加入队列
   * @param file 上传的文件对象
   * @param title 小说标题
   * @param uploaderId 上传者 ID
   */
  async createNovel(file: Express.Multer.File, title: string, uploaderId: number) {
    const novelTitle = title || file.originalname.replace(/\.txt$/, '');

    // 1. 创建小说记录
    const novel = await this.prisma.novel.create({
      data: {
        title: novelTitle,
        filepath: file.path,
        uploaderId,
        status: NovelStatus.PENDING,
      },
    });

    // 2. 添加到处理队列
    await this.novelQueue.add('process-novel', {
      novelId: novel.id,
      filepath: file.path,
    });

    return {
      id: novel.id,
      status: novel.status,
    };
  }

  /**
   * 获取用户上传的所有小说
   * @param userId 用户 ID
   */
  async findAll(userId: number) {
    return this.prisma.novel.findMany({
      where: { uploaderId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取单本小说详情
   * @param id 小说 ID
   */
  async findOne(id: number) {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
    });
    if (!novel) throw new NotFoundException(`Novel #${id} not found`);
    return novel;
  }

  /**
   * 获取小说章节列表（不包含内容）
   * @param novelId 小说 ID
   */
  async getChapters(novelId: number) {
    return this.prisma.chapter.findMany({
      where: { novelId },
      select: {
        id: true,
        title: true,
        order: true,
        wordCount: true,
        // 排除 content 字段以提升性能
      },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * 获取单章详细内容（包含上一章/下一章 ID）
   * @param chapterId 章节 ID
   */
  async getChapterContent(chapterId: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });
    if (!chapter) throw new NotFoundException(`Chapter #${chapterId} not found`);

    // 查找上一章和下一章的 ID，用于前端翻页
    const prev = await this.prisma.chapter.findFirst({
      where: { novelId: chapter.novelId, order: { lt: chapter.order } },
      orderBy: { order: 'desc' },
      select: { id: true },
    });
    const next = await this.prisma.chapter.findFirst({
      where: { novelId: chapter.novelId, order: { gt: chapter.order } },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    return {
      ...chapter,
      previousId: prev?.id || null,
      nextId: next?.id || null,
    };
  }
}

import { CreateNovelDto } from '@app/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NovelService } from './novel.service';

@Controller('novels')
export class NovelController {
  constructor(private readonly novelService: NovelService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const uploadPath = './uploads/novels';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req: any, file: any, cb: any) => {
          const randomName = uuidv4();
          // Fix utf-8 chars in filename
          const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
          cb(null, `${randomName}${extname(originalName)}`);
        },
      }),
      fileFilter: (req: any, file: any, cb: any) => {
        // Allow txt and maybe others in future
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        if (file.mimetype === 'text/plain' || originalName.endsWith('.txt')) {
          cb(null, true);
        } else {
          cb(new Error('Only .txt files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    }),
  )
  async uploadNovel(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateNovelDto,
    @Request() req: any,
    @Headers('x-client-id') clientId: string,
  ) {
    if (!file) {
      throw new Error('File is required');
    }
    return this.novelService.createNovel(file, body.title || '', req.user.userId, clientId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    return this.novelService.findAll(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.novelService.findOne(+id);
  }

  @Get(':id/chapters')
  @UseGuards(JwtAuthGuard)
  async getChapters(@Param('id') id: string) {
    return this.novelService.getChapters(+id);
  }

  @Get('chapters/:id')
  @UseGuards(JwtAuthGuard)
  async getChapterContent(@Param('id') id: string) {
    return this.novelService.getChapterContent(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.novelService.remove(+id, req.user.userId);
  }
}

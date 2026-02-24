import { IsOptional, IsString } from 'class-validator';

export enum NovelStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class CreateNovelDto {
  @IsString()
  @IsOptional()
  title?: string;
}

export interface NovelDto {
  id: number;
  title: string;
  author?: string;
  description?: string;
  filepath: string;
  status: NovelStatus;
  uploaderId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ChapterDto {
  id: number;
  title: string;
  order: number;
  wordCount: number;
  content?: string;
  previousId?: number;
  nextId?: number;
  novelId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface NovelListResponse {
  data: NovelDto[];
  total: number;
}

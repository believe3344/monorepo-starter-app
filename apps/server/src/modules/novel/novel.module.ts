import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NovelController } from './novel.controller';
import { NovelProcessor } from './novel.processor';
import { NovelService } from './novel.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'novel-processing',
    }),
  ],
  controllers: [NovelController],
  providers: [NovelService, NovelProcessor],
})
export class NovelModule {}

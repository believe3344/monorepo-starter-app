import { Module } from '@nestjs/common';
import { NovelController } from './novel.controller';
import { NovelService } from './novel.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { NovelProcessor } from './novel.processor';

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

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 全局模块，不需要在每个模块中 import
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

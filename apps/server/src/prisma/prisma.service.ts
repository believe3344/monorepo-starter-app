import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {
    const isProduction = configService.get<string>('NODE_ENV') === 'production';
    const logLevels: Prisma.LogLevel[] = isProduction
      ? ['warn', 'error']
      : ['query', 'info', 'warn', 'error'];

    super({ log: logLevels });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

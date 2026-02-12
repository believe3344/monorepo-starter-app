import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;
  private readonly logger = new Logger(RedisService.name);

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_DB) || 0,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn('Redis 连接失败超过 3 次，停止重试');
          return null; // 停止重试，不阻塞应用启动
        }
        return Math.min(times * 200, 2000);
      },
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Redis connected');
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Redis error: ${err.message}`);
    });
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }

  /** 获取值 */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  /** 设置值（带过期时间，单位秒） */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      this.logger.warn(`Redis set error: ${err}`);
    }
  }

  /** 删除键（支持模糊匹配） */
  async del(pattern: string): Promise<void> {
    try {
      if (pattern.includes('*')) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } else {
        await this.client.del(pattern);
      }
    } catch (err) {
      this.logger.warn(`Redis del error: ${err}`);
    }
  }

  /** 获取原始 Redis 客户端（高级用法） */
  getClient(): Redis {
    return this.client;
  }
}

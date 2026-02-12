import { RedisService } from '@/common/redis/redis.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    await this.redis.del('users:list*');

    const { password, ...result } = user;
    return result;
  }

  /**
   * 分页查询 —— 返回 list + 分页元信息
   */
  async findAll(pageNum = 1, pageSize = 10) {
    const cacheKey = `users:list:${pageNum}:${pageSize}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    // 计算总页数
    const pagecount = Math.ceil(total / pageSize);

    const result = {
      list,
      pageinfo: {
        pagecount,
        pagenum: pageNum,
        pagesize: pageSize,
      },
    };

    await this.redis.set(cacheKey, JSON.stringify(result), 60);

    return result;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    await this.redis.del('users:list*');

    const { password, ...result } = user;
    return result;
  }
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    await this.redis.del('users:list*');
    return { message: `用户 ID ${id} 已删除` };
  }
}

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { WsAdapter } from '@nestjs/platform-ws';

declare const module: any;

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable WebSocket Adapter
  app.useWebSocketAdapter(new WsAdapter(app));

  // 全局前缀：所有接口以 /api 开头
  app.setGlobalPrefix('api');

  // 启用版本控制 (如 /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 增强安全性
  app.use(helmet());

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaClientExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局验证管道：自动校验 DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 过滤掉 DTO 中未定义的属性
      transform: true, // 自动将请求参数转换为 DTO 类型
      forbidNonWhitelisted: true, // 请求包含未定义属性时直接报错
    }),
  );

  // 允许跨域（开发环境）
  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('Monorepo Starter API')
    .setDescription('Monorepo Starter App 后端接口文档')
    .setVersion('1.0')
    .addBearerAuth() // 支持 JWT Bearer Token 认证
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // 文档地址：/api-docs

  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📖 Swagger docs: http://localhost:${port}/api-docs`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();

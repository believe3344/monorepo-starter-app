import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { success } from '../utils/response';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 如果数据已经是 ApiResponse 结构（包含 code 和 success），则直接返回
        if (data && typeof data === 'object' && 'code' in data && 'success' in data) {
          return data;
        }
        // 否则统一封装
        return success(data);
      }),
    );
  }
}

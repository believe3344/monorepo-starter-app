import { ApiResponse } from '@app/shared';

/**
 * 构建成功响应
 */
export function success<T>(result: T, message = 'ok'): ApiResponse<T> {
  return {
    code: 200,
    message,
    result,
    success: true,
  };
}

/**
 * 构建带分页的成功响应
 */
export function successWithPage<T>(
  result: T,
  pageinfo: { pagecount: number; pagenum: number; pagesize: number },
  message = 'ok',
): ApiResponse<T> {
  return {
    code: 200,
    message,
    result,
    pageinfo,
    success: true,
  };
}

/**
 * 构建失败响应
 */
export function fail(message: string, code = 500): ApiResponse<null> {
  return {
    code,
    message,
    result: null,
    success: false,
  };
}

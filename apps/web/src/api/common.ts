import { ApiResponse, ILoginResponse, LoginDto } from '@app/shared';
import { fetch } from '@app/utils';
import qs from 'qs';

// 重新导出类型，以便其他文件（如 store）使用
export type { ILoginResponse, LoginDto };
export type { ApiResponse }; // 也可以导出 ApiResponse

// 用户名密码登录
export const loginWithPass = (data: LoginDto) => {
  // post<T> 的泛型 T 指定了成功时返回的数据 data 的类型
  return fetch.post<ApiResponse<ILoginResponse>>('/auth/login', qs.stringify(data));
};

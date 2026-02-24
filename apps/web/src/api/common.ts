import { ApiResponse, CreateUserDto, ILoginResponse, LoginDto } from '@app/shared';
import { fetch } from '@app/utils';

// 重新导出类型，以便其他文件（如 store）使用
export type { ApiResponse, CreateUserDto, ILoginResponse, LoginDto };

// 用户名密码登录
export const loginWithPass = (data: LoginDto) => {
  return fetch.post<ApiResponse<ILoginResponse>>('/auth/login', data);
};

// 用户注册
export const register = (data: CreateUserDto) => {
  return fetch.post<ApiResponse<ILoginResponse>>('/auth/register', data);
};

// 退出登录
export const logout = () => {
  return fetch.post<ApiResponse<null>>('/auth/logout');
};

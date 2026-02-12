/** 统一 API 响应格式 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  result: T;
  pageinfo?: {
    pagecount: number;
    pagenum: number;
    pagesize: number;
  };
  success: boolean;
}

/** 分页请求参数 */
export interface PaginationParams {
  pageNum: number;
  pageSize: number;
}

/** 用户信息（前后端共享） */
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/** 用户角色枚举 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

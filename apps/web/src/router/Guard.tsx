import { useUserStore } from '@/store';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * 路由守卫组件：需要登录才能访问
 * 如果用户未登录，则重定向到登录页，并记录当前位置以便登录后跳转回来
 * @param children 子组件
 */
export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const userInfo = useUserStore((state) => state.userInfo);
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * 游客守卫组件：已登录用户不能访问
 * 如果用户已登录，则重定向到首页
 * @param children 子组件
 */
export const GuestGuard = ({ children }: { children: ReactNode }) => {
  const userInfo = useUserStore((state) => state.userInfo);

  if (userInfo) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

import { darkTheme, lightTheme } from '@/theme/customTheme';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeProviderState {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 1. 从 localStorage 或系统偏好初始化主题
  const [theme, setTheme] = useState<Theme>(() => {
    // 确保在客户端执行
    if (typeof window === 'undefined') {
      return 'light';
    }
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme;
  });

  // 2. 当主题变化时，应用 CSS 变量和 class
  useEffect(() => {
    const root = window.document.documentElement;
    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

    // 移除旧的 class
    root.classList.remove('light', 'dark');
    // 添加新的 class
    root.classList.add(theme);

    // 注入 CSS 变量
    Object.entries(currentTheme.colors).forEach(([name, value]) => {
      root.style.setProperty(`--${name}`, value);
    });

    // 保存主题到 localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

// 3. 创建一个自定义 Hook 以方便使用
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

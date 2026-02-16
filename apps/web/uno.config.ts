import { BaseUnoConfig } from '@app/uno-config';
import { defineConfig } from 'unocss';
import { mergeConfig } from 'vite';
import { lightTheme } from './src/theme/customTheme.ts';

// 辅助函数也需要修改
function generateThemeColors(themeColors: typeof lightTheme.colors) {
  const colors: Record<string, string> = {};
  for (const key of Object.keys(themeColors)) {
    // 直接将 'primary' 映射到 'var(--primary)'
    colors[key] = `var(--${key})`;
  }
  return colors;
}

export default defineConfig(
  mergeConfig(BaseUnoConfig(), {
    theme: {
      colors: {
        ...generateThemeColors(lightTheme.colors),
      },
    },
    // 配置暗黑模式的触发器
    // 当 <html> 元素有 'dark' class 时，dark: 变体生效
    preflights: [
      {
        getCSS: () => `
                    :root {
                        color-scheme: light;
                    }
                    .dark {
                        color-scheme: dark;
                    }
                `,
      },
    ],
  }),
);

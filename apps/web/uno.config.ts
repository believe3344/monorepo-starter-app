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
      fontSize: {
        xs: ['12px', '1.5'],
        sm: ['13px', '1.5'],
        base: ['14px', '1.5'],
        lg: ['16px', '1.5'],
        xl: ['20px', '1.5'],
        '2xl': ['24px', '1.5'],
        '3xl': ['30px', '1.5'],
        '4xl': ['36px', '1.5'],
        '5xl': ['48px', '1'],
        '6xl': ['60px', '1'],
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

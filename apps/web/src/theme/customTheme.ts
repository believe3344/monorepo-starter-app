// 定义主题中颜色的结构
interface ThemeColors {
  primary: string;
  headerBg: string;
}

// 定义其他设计令牌
interface ThemeTokens {
  colors: ThemeColors;
}

// 高亮主题
export const lightTheme: ThemeTokens = {
  colors: {
    primary: '#1677ff',
    headerBg: '#091628',
  },
};

// 暗黑主题
export const darkTheme: ThemeTokens = {
  colors: {
    primary: '#fb3f58',
    headerBg: '#fff',
  },
};

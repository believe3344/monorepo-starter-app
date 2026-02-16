export const antdTheme = {
  token: {
    // 纸质风格核心色系 - 温暖米白
    colorPrimary: '#8B5A2B',
    colorBgBase: '#F7F3ED',
    colorBgContainer: '#FDFBF7',
    colorBgElevated: '#FFFFFF',

    // 文字颜色 - 柔和深棕
    colorText: '#3E2723',
    colorTextSecondary: '#5D4037',
    colorTextTertiary: '#795548',
    colorTextQuaternary: '#A1887F',

    // 边框与分割线 - 纸张边缘感
    colorBorder: '#D7CCC8',
    colorBorderSecondary: '#EFEBE9',
    colorSplit: '#E0D5C7',

    // 交互状态颜色
    colorSuccess: '#558B2F',
    colorWarning: '#F57C00',
    colorError: '#C62828',
    colorInfo: '#6D4C41',

    // 圆角 - 柔和弧度
    borderRadius: 6,
    borderRadiusSM: 4,
    borderRadiusLG: 8,

    // 阴影 - 纸质层次感
    boxShadow: '0 2px 8px rgba(62, 39, 35, 0.08)',
    boxShadowSecondary: '0 4px 16px rgba(62, 39, 35, 0.12)',

    // 字体
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif',
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeXL: 20,

    // 行高
    lineHeight: 1.7,

    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
  },
  components: {
    Layout: {
      // 布局背景 - 纸张质感
      headerBg: '#FDFBF7',
      headerPadding: '0 24px',
      bodyBg: '#F7F3ED',
      siderBg: '#FDFBF7',
    },
    Card: {
      // 卡片 - 模拟纸张卡片
      colorBgContainer: '#FFFFFF',
      colorBorderSecondary: '#EFEBE9',
      paddingLG: 20,
      borderRadiusLG: 8,
    },
    Button: {
      // 按钮 - 纸质触感
      colorBgContainer: '#FFFFFF',
      colorBorder: '#D7CCC8',
      primaryShadow: '0 2px 4px rgba(62, 39, 35, 0.1)',
      defaultBorderColor: '#D7CCC8',
      defaultBgColor: '#FFFFFF',
      defaultColor: '#5D4037',
    },
    Input: {
      // 输入框 - 纸质书写感
      colorBgContainer: '#FFFFFF',
      colorBorder: '#D7CCC8',
      activeBorderColor: '#8B5A2B',
      hoverBorderColor: '#A1887F',
    },
    Select: {
      // 选择器
      colorBgContainer: '#FFFFFF',
      colorBorder: '#D7CCC8',
      optionSelectedBg: '#F5F0E6',
    },
    Table: {
      // 表格 - 纸质文档风格
      colorBgContainer: '#FFFFFF',
      headerBg: '#F5F0E6',
      headerColor: '#3E2723',
      borderColor: '#E0D5C7',
      rowHoverBg: '#FAF7F2',
    },
    Menu: {
      // 菜单
      colorItemBg: 'transparent',
      colorItemBgSelected: '#F5F0E6',
      colorItemBgHover: '#FAF7F2',
      colorItemText: '#5D4037',
      colorItemTextSelected: '#8B5A2B',
      itemBorderRadius: 6,
    },
    Modal: {
      // 模态框
      contentBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      titleColor: '#3E2723',
    },
    Popover: {
      // 弹出层
      colorBgElevated: '#FFFFFF',
      titleMinWidth: 200,
    },
    Tooltip: {
      // 提示
      colorBgSpotlight: '#3E2723',
      colorTextLightSolid: '#FDFBF7',
    },
    Tag: {
      // 标签
      colorBgContainer: '#F5F0E6',
      colorText: '#5D4037',
    },
    Badge: {
      // 徽标
      colorBgContainer: '#C62828',
    },
    Pagination: {
      // 分页
      colorBgContainer: '#FFFFFF',
      colorBorder: '#D7CCC8',
      itemActiveBg: '#8B5A2B',
    },
    Tabs: {
      // 标签页
      inkBarColor: '#8B5A2B',
      itemActiveColor: '#8B5A2B',
      itemSelectedColor: '#8B5A2B',
      itemHoverColor: '#A1887F',
    },
    Steps: {
      // 步骤条
      colorPrimary: '#8B5A2B',
    },
    Progress: {
      // 进度条
      defaultColor: '#8B5A2B',
    },
    Spin: {
      // 加载
      colorBgSpotlight: '#FDFBF7',
    },
    Skeleton: {
      // 骨架屏
      colorBg: '#E0D5C7',
      gradientFromColor: '#EFEBE9',
      gradientToColor: '#F5F0E6',
    },
    Form: {
      labelColor: '#5D4037',
      labelRequiredMarkColor: '#C62828',
    },
    DatePicker: {
      colorBgContainer: '#FFFFFF',
      colorBorder: '#D7CCC8',
      cellActiveWithRangeBg: '#F5F0E6',
      cellRangeBorderColor: '#8B5A2B',
    },
    Calendar: {
      colorBgContainer: '#FFFFFF',
      dateCellRangeBorderColor: '#F5F0E6',
    },
    Upload: {
      colorBgContainer: '#F5F0E6',
    },
    Divider: {
      colorSplit: '#E0D5C7',
    },
    Message: {
      contentBg: '#FFFFFF',
    },
    Notification: {
      colorBgElevated: '#FFFFFF',
    },
  },
};

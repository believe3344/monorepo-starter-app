import type { Locale } from 'antd/lib/locale';

export const languages = [
  {
    value: 'zh-CN',
    antdImport: () => import('antd/locale/zh_CN'),
    dayjsImport: () => import('dayjs/locale/zh-cn'),
    label: '简体中文',
  },
  {
    value: 'en',
    antdImport: () => import('antd/locale/en_US'),
    dayjsImport: () => import('dayjs/locale/en'),
    label: 'English',
  },
  {
    value: 'ja',
    antdImport: () => import('antd/locale/ja_JP'),
    dayjsImport: () => import('dayjs/locale/ja'),
    label: '日本語',
  },
  {
    value: 'ko',
    antdImport: () => import('antd/locale/ko_KR'),
    dayjsImport: () => import('dayjs/locale/ko'),
    label: '한국어',
  },
  {
    value: 'de',
    antdImport: () => import('antd/locale/de_DE'),
    dayjsImport: () => import('dayjs/locale/de'),
    label: 'Deutsch',
  },
  {
    value: 'fr',
    antdImport: () => import('antd/locale/fr_FR'),
    dayjsImport: () => import('dayjs/locale/fr'),
    label: 'Français',
  },
  {
    value: 'th',
    antdImport: () => import('antd/locale/th_TH'),
    dayjsImport: () => import('dayjs/locale/th'),
    label: 'ภาษาไทย',
  },
  {
    value: 'es',
    antdImport: () => import('antd/locale/es_ES'),
    dayjsImport: () => import('dayjs/locale/es'),
    label: 'Español',
  },
  {
    value: 'pt',
    antdImport: () => import('antd/locale/pt_PT'),
    dayjsImport: () => import('dayjs/locale/pt'),
    label: 'Português',
  },
  {
    value: 'ru-RU',
    antdImport: () => import('antd/locale/ru_RU'),
    dayjsImport: () => import('dayjs/locale/ru'),
    label: 'Русский язык',
  },
] as const;

export type Lang = (typeof languages)[number]['value'];
export type Language = {
  value: string;
  antdImport: () => Promise<{ default: Locale }>;
  dayjsImport: () => Promise<{ default: { name: string } }>;
  label: string;
};

// 创建一个 Map 方便快速查找
export const languageMap = new Map<string, Language>(languages.map((lang) => [lang.value, lang]));

export default languages;

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { namespaces, resources } from './resources';

i18n
  // 使用 i18next-browser-languagedetector
  .use(LanguageDetector)
  // 将 i18n 实例传递给 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    // 传入我们聚合好的翻译资源
    resources,

    // 默认语言
    fallbackLng: 'zh-CN',
    // 将命名空间分隔符从 ':' (默认) 改为 '.'
    nsSeparator: '.',
    // 定义我们拥有的命名空间
    ns: namespaces,
    // 默认使用的命名空间
    defaultNS: 'common',

    interpolation: {
      escapeValue: false, // React 已经做了 XSS 防护
    },

    // LanguageDetector 的配置
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    react: {
      // 因为翻译已经内联，不再需要 Suspense
      useSuspense: false,
    },
  });

export default i18n;

import { languageMap } from '@/locales/lang-lists';
import { useGlobalStore } from '@/store';
import { antdTheme } from '@/theme/antdTheme';
import { fetch } from '@app/utils';
import { App as AntdApp, ConfigProvider } from 'antd';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { Locale } from 'antd/lib/locale';
import dayjs from 'dayjs';

type ConfigProviderProps = {
  children: ReactNode;
};

const MessageInjector = ({ children }: { children: ReactNode }) => {
  const { message } = AntdApp.useApp();
  useEffect(() => {
    fetch.setMessageInstance(message);
  }, [message]);
  return <>{children}</>;
};

const defaultLang = 'zh-CN';

export const AppConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const language = useGlobalStore((state) => state.language);
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState<Locale | undefined>(undefined);
  // 增加一个加载状态
  const [isLoading, setIsLoading] = useState(true);

  // 当语言变化时，动态加载 antd 和 dayjs 的 locale 文件
  const handleLanguageChange = useCallback(async (lang: string) => {
    const langConfig = languageMap.get(lang || defaultLang);
    try {
      const [antdLocale, dayjsLocale] = await Promise.all([
        langConfig?.antdImport(),
        langConfig?.dayjsImport(),
      ]);
      setLocale(antdLocale?.default);
      dayjs.locale(dayjsLocale?.default?.name);
    } catch (error) {
      console.error('Error loading language files:', error);
    } finally {
      // 加载完成后，设置加载状态为 false
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
    handleLanguageChange(language);
  }, [i18n, language, handleLanguageChange]);

  return !isLoading ? (
    <ConfigProvider locale={locale} theme={antdTheme}>
      <AntdApp>
        <MessageInjector>{children}</MessageInjector>
      </AntdApp>
    </ConfigProvider>
  ) : null;
};

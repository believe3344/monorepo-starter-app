import i18n from '@/locales';
import { createAppStore } from '@app/store';
import { createGlobalActions } from './actions';
import type { GlobalSlice } from './types';

export const useGlobalStore = createAppStore<GlobalSlice>((set, get, store) => {
  const { language } = i18n;
  return {
    language,
    ...createGlobalActions(set, get, store),
  };
});

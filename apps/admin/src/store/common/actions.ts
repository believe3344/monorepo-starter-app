import type { ActionsCreator } from '@app/store';
import type { GlobalActions, GlobalSlice } from './types';

export const createGlobalActions: ActionsCreator<GlobalSlice, GlobalActions> = (
  set,
  _get,
  _api,
) => ({
  // 设置语言
  setLanguage: (lang) => {
    set((state) => {
      state.language = lang;
    });
  },
});

import { create, type StateCreator, type StoreApi } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PersistOptions } from 'zustand/middleware/persist';

export type Set<T> = (fn: (draft: T) => void) => void;
export type Get<T> = () => T;
export type Api<T> = StoreApi<T>;

type StoreCreator<T> = StateCreator<T, [['zustand/immer', never]], [], T>;

export const createAppStore = <T extends object>(
  creator: StoreCreator<T>,
  persistConfig?: PersistOptions<T, Partial<T>>,
) => {
  if (persistConfig) {
    const middleware = devtools(persist(immer(creator), persistConfig));
    return create(middleware);
  }

  const middleware = devtools(immer(creator));
  return create(middleware);
};

export type ActionsCreator<T, M> = (set: Set<T>, get: Get<T>, api: Api<T>) => M;

// 仅限简单数据结构使用，复杂结构还是需要使用immer
export const setState = <T>(set: Set<T>, updates: Partial<T>) => {
  set((state) => {
    return { ...state, ...updates } as T;
  });
};

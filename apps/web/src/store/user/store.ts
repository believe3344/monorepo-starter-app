import { createAppStore } from '@app/store';
import { createUserActions } from './actions';
import type { UserSlice, UserState } from './types';

const initialState: UserState = {
  userInfo: null,
};

export const useUserStore = createAppStore<UserSlice>(
  (set, get, store) => ({
    ...initialState,
    ...createUserActions(set, get, store),
  }),
  {
    name: 'user-store',
    partialize: (state) => ({ userInfo: state.userInfo }),
  },
);

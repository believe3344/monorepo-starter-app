import type { ILoginResponse } from '@/api/common';
import { setState, type ActionsCreator } from '@app/store';
import type { UserActions, UserSlice } from './types';

export const createUserActions: ActionsCreator<UserSlice, UserActions> = (set, _get, _api) => ({
  setUserInfo: (data: ILoginResponse) => {
    setState(set, { userInfo: data });
  },
});

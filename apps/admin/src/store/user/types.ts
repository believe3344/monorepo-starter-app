import { ILoginResponse } from '@/api/common';

export type UserState = {
  userInfo: ILoginResponse | null;
};

export type UserActions = {
  setUserInfo: (data: ILoginResponse) => void;
};

export type UserSlice = UserState & UserActions;

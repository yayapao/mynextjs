import { createStore } from 'zustand/vanilla';

// 用户信息类型定义
export interface UserInfo {
  name: string;
}

export type GlobalStoreState = {
  user_info: UserInfo | null;
};

export type GlobalStoreActions = {
  setUserInfo: (user_info: UserInfo | null) => void;
};

export type GlobalStore = GlobalStoreState & GlobalStoreActions;

export const createGlobalStore = (
  initState: GlobalStoreState = {
    user_info: null,
  }
) => {
  return createStore<GlobalStore>((set) => ({
    ...initState,
    setUserInfo: (user_info: UserInfo | null) => {
      set({ user_info });
    },
  }));
};

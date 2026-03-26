'use client';

import {
  GlobalStore,
  GlobalStoreState,
  createGlobalStore,
} from './stores/global';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';

export type GlobalStoreApi = ReturnType<typeof createGlobalStore>;

export const GlobalContext = createContext<GlobalStoreApi | undefined>(
  undefined
);

export interface GlobalProviderProps {
  children: ReactNode;
  value?: Partial<GlobalStoreState>;
}

export default function GlobalProvider({
  children,
  value,
}: GlobalProviderProps) {
  // 使用 useState 的 lazy initialization 来创建 store（只执行一次）
  const [store] = useState(() =>
    createGlobalStore({
      user_info: value?.user_info ?? null,
    })
  );

  return (
    <GlobalContext.Provider value={store}>{children}</GlobalContext.Provider>
  );
}

export function useGlobal<T>(selector: (state: GlobalStore) => T): T {
  const store = useContext(GlobalContext);
  if (!store) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return useStore(store, selector);
}

// 便捷 hook：获取整个 store
export function useGlobalStore() {
  return useGlobal((state) => state);
}

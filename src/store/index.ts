/**
 * SleepTracker - Redux Store 配置
 * 使用 Redux Toolkit 配置全局状态管理
 */

import { configureStore, Middleware } from '@reduxjs/toolkit';
import sleepReducer from './sleepSlice';
import settingsReducer from './settingsSlice';

/**
 * 日志中间件 - 开发环境使用
 * 记录所有 action 分发和状态变化
 */
const loggerMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  if (__DEV__) {
    console.log('Dispatching action:', action);
    const result = next(action);
    console.log('New state:', storeAPI.getState());
    return result;
  }
  return next(action);
};

/**
 * 错误处理中间件
 * 捕获 reducer 中的错误，防止应用崩溃
 */
const errorMiddleware: Middleware = () => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('Error in reducer:', error);
    throw error;
  }
};

/**
 * 配置 Redux Store
 */
export const store = configureStore({
  reducer: {
    sleep: sleepReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 序列化检查配置
      serializableCheck: {
        // 忽略某些非序列化数据
        ignoredActions: ['sleep/setSelectedRecord'],
        ignoredPaths: ['sleep.selectedRecord'],
      },
      // 不可变性检查
      immutableCheck: true,
      // 动作类型检查
      actionCreatorCheck: true,
    }).concat(loggerMiddleware, errorMiddleware),
  devTools: __DEV__, // 仅在开发环境启用 Redux DevTools
  preloadedState: undefined, // 初始状态由 reducers 提供
});

/**
 * RootState 类型
 * 从 store 推断出完整的 state 类型
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch 类型
 * 从 store 推断出 dispatch 类型
 */
export type AppDispatch = typeof store.dispatch;

export default store;

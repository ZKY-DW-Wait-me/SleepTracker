/**
 * SleepTracker - useAppSelector Hook
 * 类型化的 Redux selector hook
 */

import { useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '../store';

/**
 * 类型化的 useSelector hook
 * 在整个应用中使用此 hook 代替普通的 useSelector
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector;

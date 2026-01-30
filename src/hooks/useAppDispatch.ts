/**
 * SleepTracker - useAppDispatch Hook
 * 类型化的 Redux dispatch hook
 */

import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';

/**
 * 使用类型化的 dispatch
 * @returns 类型化的 AppDispatch
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;

/**
 * SleepTracker - useSleepRecords Hook
 * 封装睡眠记录相关的业务逻辑
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  createSleepRecord,
  updateSleepRecord,
  deleteSleepRecord,
  fetchAllSleepRecords,
  fetchTodaySleepRecord,
  fetchRecentSleepRecords,
  fetchSleepRecordById,
  setSelectedRecord,
  clearError,
} from '../store/sleepSlice';
import {
  CreateSleepRecordParams,
  UpdateSleepRecordParams,
  PaginationParams,
  SleepRecord,
} from '../types';

/**
 * 睡眠记录 Hook
 * 提供睡眠记录的增删改查功能
 */
export const useSleepRecords = () => {
  const dispatch = useAppDispatch();
  const {
    records,
    selectedRecord,
    todayRecord,
    statistics,
    loadingState,
    error,
    totalCount,
  } = useAppSelector(state => state.sleep);

  const isLoading = useMemo(() => loadingState === 'loading', [loadingState]);
  const hasError = useMemo(() => error !== null, [error]);

  /**
   * 创建新记录
   */
  const addRecord = useCallback(
    async (params: CreateSleepRecordParams) => {
      const result = await dispatch(createSleepRecord(params));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 更新记录
   */
  const editRecord = useCallback(
    async (params: UpdateSleepRecordParams) => {
      const result = await dispatch(updateSleepRecord(params));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 删除记录
   */
  const removeRecord = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteSleepRecord(id));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 加载所有记录
   */
  const loadRecords = useCallback(
    async (options?: {
      pagination?: PaginationParams;
      orderBy?: 'bed_time' | 'wake_time' | 'created_at';
      orderDirection?: 'ASC' | 'DESC';
      startDate?: string;
      endDate?: string;
    }) => {
      const result = await dispatch(fetchAllSleepRecords(options));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 加载今日记录
   */
  const loadTodayRecord = useCallback(async () => {
    const result = await dispatch(fetchTodaySleepRecord());
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  /**
   * 加载最近记录
   */
  const loadRecentRecords = useCallback(
    async (limit: number = 7) => {
      const result = await dispatch(fetchRecentSleepRecords(limit));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 加载单条记录
   */
  const loadRecordById = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchSleepRecordById(id));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 设置选中记录
   */
  const selectRecord = useCallback(
    (record: SleepRecord | null) => {
      dispatch(setSelectedRecord(record));
    },
    [dispatch]
  );

  /**
   * 清空错误
   */
  const clearRecordError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // 状态
    records,
    selectedRecord,
    todayRecord,
    statistics,
    loadingState,
    error,
    totalCount,
    isLoading,
    hasError,
    // 操作
    addRecord,
    editRecord,
    removeRecord,
    loadRecords,
    loadTodayRecord,
    loadRecentRecords,
    loadRecordById,
    selectRecord,
    clearRecordError,
  };
};

export default useSleepRecords;

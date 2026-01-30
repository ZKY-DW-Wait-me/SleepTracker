/**
 * SleepTracker - useSettings Hook
 * 封装用户设置相关的业务逻辑
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  loadUserSettings,
  updateUserSettings,
  updateThemeMode,
  updateSleepGoal,
  updateReminder,
  addReminder,
  removeReminder,
  toggleSmartReminders,
  toggleSleepAnalysis,
  toggleCloudSync,
  togglePrivacyMode,
  updateLanguage,
  toggleTimeFormat,
  toggleTemperatureUnit,
  updateDataRetentionDays,
  updateUserProfile,
  clearSettingsError,
} from '../store/settingsSlice';
import {
  UserSettings,
  ThemeMode,
  SleepGoal,
  ReminderSetting,
  ReminderType,
} from '../types';

/**
 * 设置管理 Hook
 * 提供用户设置的加载、更新等功能
 */
export const useSettings = () => {
  const dispatch = useAppDispatch();
  const { settings, loadingState, error, isInitialized } = useAppSelector(
    state => state.settings
  );

  const isLoading = useMemo(() => loadingState === 'loading', [loadingState]);
  const hasError = useMemo(() => error !== null, [error]);

  /**
   * 加载用户设置
   */
  const loadSettings = useCallback(async () => {
    const result = await dispatch(loadUserSettings());
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  /**
   * 更新用户设置
   */
  const saveSettings = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      const result = await dispatch(updateUserSettings(newSettings));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 设置主题模式
   */
  const setTheme = useCallback(
    async (themeMode: ThemeMode) => {
      const result = await dispatch(updateThemeMode(themeMode));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 设置睡眠目标
   */
  const setSleepGoal = useCallback(
    async (goal: Partial<SleepGoal>) => {
      const result = await dispatch(updateSleepGoal(goal));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 更新提醒设置
   */
  const saveReminder = useCallback(
    async (type: ReminderType, updates: Partial<ReminderSetting>) => {
      const result = await dispatch(updateReminder({ type, updates }));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 添加提醒
   */
  const createReminder = useCallback(
    async (reminder: ReminderSetting) => {
      const result = await dispatch(addReminder(reminder));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 删除提醒
   */
  const deleteReminder = useCallback(
    async (type: ReminderType) => {
      const result = await dispatch(removeReminder(type));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 切换智能提醒
   */
  const toggleSmart = useCallback(async () => {
    const result = await dispatch(toggleSmartReminders());
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  /**
   * 切换睡眠分析
   */
  const toggleAnalysis = useCallback(async () => {
    const result = await dispatch(toggleSleepAnalysis());
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  /**
   * 切换云同步
   */
  const toggleCloud = useCallback(async () => {
    const result = await dispatch(toggleCloudSync());
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  /**
   * 切换隐私模式
   */
  const togglePrivacy = useCallback(async () => {
    const result = await dispatch(togglePrivacyMode());
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  /**
   * 设置语言
   */
  const setLanguage = useCallback(
    async (language: string) => {
      const result = await dispatch(updateLanguage(language));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 切换时间格式
   */
  const toggleFormat = useCallback(async () => {
    const result = await dispatch(toggleTimeFormat());
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  /**
   * 切换温度单位
   */
  const toggleTempUnit = useCallback(async () => {
    const result = await dispatch(toggleTemperatureUnit());
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  /**
   * 设置数据保留天数
   */
  const setDataRetention = useCallback(
    async (days: number) => {
      const result = await dispatch(updateDataRetentionDays(days));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 更新用户资料
   */
  const updateProfile = useCallback(
    async (profile: { username?: string; avatarUrl?: string }) => {
      const result = await dispatch(updateUserProfile(profile));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * 清空错误
   */
  const clearError = useCallback(() => {
    dispatch(clearSettingsError());
  }, [dispatch]);

  return {
    // 状态
    settings,
    loadingState,
    error,
    isInitialized,
    isLoading,
    hasError,
    // 操作
    loadSettings,
    saveSettings,
    setTheme,
    setSleepGoal,
    saveReminder,
    createReminder,
    deleteReminder,
    toggleSmart,
    toggleAnalysis,
    toggleCloud,
    togglePrivacy,
    setLanguage,
    toggleFormat,
    toggleTempUnit,
    setDataRetention,
    updateProfile,
    clearError,
  };
};

export default useSettings;

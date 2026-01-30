/**
 * SleepTracker - Settings Slice
 * 管理用户设置和偏好的状态
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  SettingsState,
  UserSettings,
  ThemeMode,
  ReminderSetting,
  SleepGoal,
  ReminderType,
} from '../types';
import {
  getUserSettings,
  updateUserSettings as updateUserSettingsDB,
} from '../services/database';

// ==================== 初始状态 ====================

const initialState: SettingsState = {
  settings: {
    themeMode: 'system',
    use24HourFormat: true,
    temperatureUnit: 'C',
    language: 'zh-CN',
    sleepGoal: {
      durationGoal: 480, // 8小时
      targetBedTime: '22:30',
      targetWakeTime: '06:30',
      targetQualityScore: 7,
      targetDaysPerWeek: 5,
    },
    reminders: [
      {
        type: 'bedtime',
        enabled: true,
        time: '22:00',
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        sound: 'default',
        vibration: true,
        advanceMinutes: 30,
      },
      {
        type: 'waketime',
        enabled: true,
        time: '06:30',
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        sound: 'default',
        vibration: true,
        advanceMinutes: 0,
      },
    ],
    smartRemindersEnabled: true,
    sleepAnalysisEnabled: true,
    cloudSyncEnabled: false,
    privacyModeEnabled: false,
    dataRetentionDays: 0,
  },
  loadingState: 'idle',
  error: null,
  isInitialized: false,
};

// ==================== Async Thunks ====================

/**
 * 加载用户设置
 * 从数据库读取用户设置
 */
export const loadUserSettings = createAsyncThunk(
  'settings/loadUserSettings',
  async (_, { rejectWithValue }) => {
    try {
      const result = await getUserSettings();
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to load user settings');
      }
      return result.data!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 更新用户设置
 * 保存设置到数据库
 */
export const updateUserSettings = createAsyncThunk(
  'settings/updateUserSettings',
  async (settings: Partial<UserSettings>, { rejectWithValue }) => {
    try {
      const result = await updateUserSettingsDB(settings);
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to update user settings');
      }
      return result.data!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 更新主题模式
 */
export const updateThemeMode = createAsyncThunk(
  'settings/updateThemeMode',
  async (themeMode: ThemeMode, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(updateUserSettings({ themeMode }));
      return themeMode;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 更新睡眠目标
 */
export const updateSleepGoal = createAsyncThunk(
  'settings/updateSleepGoal',
  async (sleepGoal: Partial<SleepGoal>, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(updateUserSettings({ sleepGoal }));
      return sleepGoal;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 更新提醒设置
 */
export const updateReminder = createAsyncThunk(
  'settings/updateReminder',
  async (
    { type, updates }: { type: ReminderType; updates: Partial<ReminderSetting> },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const state = getState() as { settings: SettingsState };
      const currentReminders = state.settings.settings.reminders;
      
      const updatedReminders = currentReminders.map(reminder =>
        reminder.type === type ? { ...reminder, ...updates } : reminder
      );

      await dispatch(updateUserSettings({ reminders: updatedReminders }));
      return updatedReminders;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 添加新的提醒
 */
export const addReminder = createAsyncThunk(
  'settings/addReminder',
  async (
    reminder: ReminderSetting,
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const state = getState() as { settings: SettingsState };
      const currentReminders = state.settings.settings.reminders;
      
      // 检查是否已存在同类型的提醒
      const existingIndex = currentReminders.findIndex(r => r.type === reminder.type);
      
      let updatedReminders: ReminderSetting[];
      if (existingIndex >= 0) {
        // 更新现有提醒
        updatedReminders = currentReminders.map(r =>
          r.type === reminder.type ? reminder : r
        );
      } else {
        // 添加新提醒
        updatedReminders = [...currentReminders, reminder];
      }

      await dispatch(updateUserSettings({ reminders: updatedReminders }));
      return updatedReminders;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 删除提醒
 */
export const removeReminder = createAsyncThunk(
  'settings/removeReminder',
  async (
    type: ReminderType,
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const state = getState() as { settings: SettingsState };
      const currentReminders = state.settings.settings.reminders;
      
      const updatedReminders = currentReminders.filter(r => r.type !== type);

      await dispatch(updateUserSettings({ reminders: updatedReminders }));
      return updatedReminders;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 切换智能提醒
 */
export const toggleSmartReminders = createAsyncThunk(
  'settings/toggleSmartReminders',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { settings: SettingsState };
      const newValue = !state.settings.settings.smartRemindersEnabled;
      
      await dispatch(updateUserSettings({ smartRemindersEnabled: newValue }));
      return newValue;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 切换睡眠分析
 */
export const toggleSleepAnalysis = createAsyncThunk(
  'settings/toggleSleepAnalysis',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { settings: SettingsState };
      const newValue = !state.settings.settings.sleepAnalysisEnabled;
      
      await dispatch(updateUserSettings({ sleepAnalysisEnabled: newValue }));
      return newValue;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 切换云同步
 */
export const toggleCloudSync = createAsyncThunk(
  'settings/toggleCloudSync',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { settings: SettingsState };
      const newValue = !state.settings.settings.cloudSyncEnabled;
      
      await dispatch(updateUserSettings({ cloudSyncEnabled: newValue }));
      return newValue;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 切换隐私模式
 */
export const togglePrivacyMode = createAsyncThunk(
  'settings/togglePrivacyMode',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { settings: SettingsState };
      const newValue = !state.settings.settings.privacyModeEnabled;
      
      await dispatch(updateUserSettings({ privacyModeEnabled: newValue }));
      return newValue;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 更新语言设置
 */
export const updateLanguage = createAsyncThunk(
  'settings/updateLanguage',
  async (language: string, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(updateUserSettings({ language }));
      return language;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 切换时间格式
 */
export const toggleTimeFormat = createAsyncThunk(
  'settings/toggleTimeFormat',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { settings: SettingsState };
      const newValue = !state.settings.settings.use24HourFormat;
      
      await dispatch(updateUserSettings({ use24HourFormat: newValue }));
      return newValue;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 切换温度单位
 */
export const toggleTemperatureUnit = createAsyncThunk(
  'settings/toggleTemperatureUnit',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { settings: SettingsState };
      const currentUnit = state.settings.settings.temperatureUnit;
      const newUnit = currentUnit === 'C' ? 'F' : 'C';
      
      await dispatch(updateUserSettings({ temperatureUnit: newUnit }));
      return newUnit;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 更新数据保留天数
 */
export const updateDataRetentionDays = createAsyncThunk(
  'settings/updateDataRetentionDays',
  async (days: number, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(updateUserSettings({ dataRetentionDays: days }));
      return days;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 更新用户信息
 */
export const updateUserProfile = createAsyncThunk(
  'settings/updateUserProfile',
  async (
    { username, avatarUrl }: { username?: string; avatarUrl?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updates: Partial<UserSettings> = {};
      if (username !== undefined) updates.username = username;
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
      
      await dispatch(updateUserSettings(updates));
      return updates;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// ==================== Slice 定义 ====================

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    /**
     * 清空错误信息
     */
    clearSettingsError: (state) => {
      state.error = null;
    },

    /**
     * 重置设置状态
     */
    resetSettingsState: () => initialState,

    /**
     * 设置初始化状态
     */
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },

    /**
     * 本地更新设置（乐观更新）
     */
    updateSettingsOptimistically: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    /**
     * 设置主题（不持久化到数据库）
     */
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.settings.themeMode = action.payload;
    },

    /**
     * 更新单个提醒设置（本地）
     */
    updateReminderLocal: (
      state,
      action: PayloadAction<{ type: ReminderType; updates: Partial<ReminderSetting> }>
    ) => {
      const { type, updates } = action.payload;
      const reminderIndex = state.settings.reminders.findIndex(r => r.type === type);
      
      if (reminderIndex >= 0) {
        state.settings.reminders[reminderIndex] = {
          ...state.settings.reminders[reminderIndex],
          ...updates,
        };
      }
    },

    /**
     * 添加提醒（本地）
     */
    addReminderLocal: (state, action: PayloadAction<ReminderSetting>) => {
      const existingIndex = state.settings.reminders.findIndex(
        r => r.type === action.payload.type
      );
      
      if (existingIndex >= 0) {
        state.settings.reminders[existingIndex] = action.payload;
      } else {
        state.settings.reminders.push(action.payload);
      }
    },

    /**
     * 删除提醒（本地）
     */
    removeReminderLocal: (state, action: PayloadAction<ReminderType>) => {
      state.settings.reminders = state.settings.reminders.filter(
        r => r.type !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    // ----- 加载用户设置 -----
    builder
      .addCase(loadUserSettings.pending, (state) => {
        state.loadingState = 'loading';
        state.error = null;
      })
      .addCase(loadUserSettings.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings = action.payload;
        state.isInitialized = true;
      })
      .addCase(loadUserSettings.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
        state.isInitialized = true; // 即使失败也标记为已初始化，使用默认设置
      });

    // ----- 更新用户设置 -----
    builder
      .addCase(updateUserSettings.pending, (state) => {
        state.loadingState = 'loading';
        state.error = null;
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(updateUserSettings.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 更新主题模式 -----
    builder
      .addCase(updateThemeMode.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(updateThemeMode.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.themeMode = action.payload;
      })
      .addCase(updateThemeMode.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 更新睡眠目标 -----
    builder
      .addCase(updateSleepGoal.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(updateSleepGoal.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.sleepGoal = { ...state.settings.sleepGoal, ...action.payload };
      })
      .addCase(updateSleepGoal.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 更新提醒 -----
    builder
      .addCase(updateReminder.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(updateReminder.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.reminders = action.payload;
      })
      .addCase(updateReminder.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 添加提醒 -----
    builder
      .addCase(addReminder.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(addReminder.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.reminders = action.payload;
      })
      .addCase(addReminder.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 删除提醒 -----
    builder
      .addCase(removeReminder.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(removeReminder.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.reminders = action.payload;
      })
      .addCase(removeReminder.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 切换智能提醒 -----
    builder
      .addCase(toggleSmartReminders.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(toggleSmartReminders.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.smartRemindersEnabled = action.payload;
      })
      .addCase(toggleSmartReminders.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 切换睡眠分析 -----
    builder
      .addCase(toggleSleepAnalysis.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(toggleSleepAnalysis.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.sleepAnalysisEnabled = action.payload;
      })
      .addCase(toggleSleepAnalysis.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 切换云同步 -----
    builder
      .addCase(toggleCloudSync.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(toggleCloudSync.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.cloudSyncEnabled = action.payload;
      })
      .addCase(toggleCloudSync.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 切换隐私模式 -----
    builder
      .addCase(togglePrivacyMode.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(togglePrivacyMode.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.privacyModeEnabled = action.payload;
      })
      .addCase(togglePrivacyMode.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 更新语言 -----
    builder
      .addCase(updateLanguage.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(updateLanguage.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.language = action.payload;
      })
      .addCase(updateLanguage.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 切换时间格式 -----
    builder
      .addCase(toggleTimeFormat.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(toggleTimeFormat.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.use24HourFormat = action.payload;
      })
      .addCase(toggleTimeFormat.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 切换温度单位 -----
    builder
      .addCase(toggleTemperatureUnit.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(toggleTemperatureUnit.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.temperatureUnit = action.payload;
      })
      .addCase(toggleTemperatureUnit.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 更新数据保留天数 -----
    builder
      .addCase(updateDataRetentionDays.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(updateDataRetentionDays.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.settings.dataRetentionDays = action.payload;
      })
      .addCase(updateDataRetentionDays.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 更新用户信息 -----
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        if (action.payload.username) {
          state.settings.username = action.payload.username;
        }
        if (action.payload.avatarUrl) {
          state.settings.avatarUrl = action.payload.avatarUrl;
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });
  },
});

// ==================== 导出 ====================

export const {
  clearSettingsError,
  resetSettingsState,
  setInitialized,
  updateSettingsOptimistically,
  setThemeMode,
  updateReminderLocal,
  addReminderLocal,
  removeReminderLocal,
} = settingsSlice.actions;

export default settingsSlice.reducer;

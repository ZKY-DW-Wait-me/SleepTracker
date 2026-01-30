/**
 * SleepTracker - Sleep Slice
 * 管理睡眠记录相关的状态和业务逻辑
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  SleepRecord,
  SleepState,
  CreateSleepRecordParams,
  UpdateSleepRecordParams,
  PaginationParams,
  PaginatedResult,
  SleepStatistics,
  DailySleepData,
  SleepTrends,
  SleepQuality,
} from '../types';
import {
  createSleepRecord as createSleepRecordDB,
  getSleepRecordById,
  getAllSleepRecords,
  getSleepRecordsByDateRange,
  getTodaySleepRecord as getTodaySleepRecordDB,
  updateSleepRecord as updateSleepRecordDB,
  deleteSleepRecord as deleteSleepRecordDB,
  batchDeleteSleepRecords,
  getRecentSleepRecords,
  getSleepStatistics,
} from '../services/database';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

// ==================== 初始状态 ====================

const initialState: SleepState = {
  records: [],
  selectedRecord: null,
  todayRecord: null,
  statistics: null,
  loadingState: 'idle',
  error: null,
  totalCount: 0,
  lastUpdated: null,
};

// ==================== Async Thunks ====================

/**
 * 创建新的睡眠记录
 */
export const createSleepRecord = createAsyncThunk(
  'sleep/createSleepRecord',
  async (params: CreateSleepRecordParams, { rejectWithValue }) => {
    try {
      const result = await createSleepRecordDB(params);
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to create sleep record');
      }
      return result.data!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 获取所有睡眠记录
 */
export const fetchAllSleepRecords = createAsyncThunk(
  'sleep/fetchAllSleepRecords',
  async (
    options: {
      pagination?: PaginationParams;
      orderBy?: 'bed_time' | 'wake_time' | 'created_at';
      orderDirection?: 'ASC' | 'DESC';
      startDate?: string;
      endDate?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const result = await getAllSleepRecords(options);
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to fetch sleep records');
      }
      return result.data!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 获取今日睡眠记录
 */
export const fetchTodaySleepRecord = createAsyncThunk(
  'sleep/fetchTodaySleepRecord',
  async (_, { rejectWithValue }) => {
    try {
      const result = await getTodaySleepRecordDB();
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to fetch today sleep record');
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 获取单个睡眠记录详情
 */
export const fetchSleepRecordById = createAsyncThunk(
  'sleep/fetchSleepRecordById',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await getSleepRecordById(id);
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to fetch sleep record');
      }
      return result.data!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 更新睡眠记录
 */
export const updateSleepRecord = createAsyncThunk(
  'sleep/updateSleepRecord',
  async (params: UpdateSleepRecordParams, { rejectWithValue }) => {
    try {
      const result = await updateSleepRecordDB(params);
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to update sleep record');
      }
      return result.data!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 删除睡眠记录
 */
export const deleteSleepRecord = createAsyncThunk(
  'sleep/deleteSleepRecord',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await deleteSleepRecordDB(id);
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to delete sleep record');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 批量删除睡眠记录
 */
export const batchDeleteRecords = createAsyncThunk(
  'sleep/batchDeleteRecords',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const result = await batchDeleteSleepRecords(ids);
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to batch delete records');
      }
      return ids;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 获取最近的睡眠记录
 */
export const fetchRecentSleepRecords = createAsyncThunk(
  'sleep/fetchRecentSleepRecords',
  async (limit: number = 7, { rejectWithValue }) => {
    try {
      const result = await getRecentSleepRecords(limit);
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to fetch recent records');
      }
      return result.data!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * 获取指定日期范围的睡眠记录
 */
export const fetchSleepRecordsByDateRange = createAsyncThunk(
  'sleep/fetchSleepRecordsByDateRange',
  async (
    { startDate, endDate }: { startDate: string; endDate: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await getSleepRecordsByDateRange(startDate, endDate);
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to fetch records by date range');
      }
      return result.data!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// ==================== 辅助函数 ====================

/**
 * 计算睡眠质量等级
 */
const calculateSleepQuality = (score: number): SleepQuality => {
  if (score >= 9) return 'excellent';
  if (score >= 7) return 'good';
  if (score >= 5) return 'fair';
  if (score >= 3) return 'poor';
  return 'terrible';
};

/**
 * 计算睡眠统计
 */
const calculateStatistics = (records: SleepRecord[]): SleepStatistics | null => {
  if (records.length === 0) return null;

  const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
  const totalQuality = records.reduce((sum, r) => sum + r.qualityScore, 0);
  
  const durations = records.map(r => r.duration);
  const qualityScores = records.map(r => r.qualityScore);
  
  const longestSleep = Math.max(...durations);
  const shortestSleep = Math.min(...durations);
  const bestQualityScore = Math.max(...qualityScores);
  const worstQualityScore = Math.min(...qualityScores);

  // 质量分布统计
  const qualityDistribution: Record<SleepQuality, number> = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
    terrible: 0,
  };
  
  records.forEach(r => {
    qualityDistribution[r.quality] = (qualityDistribution[r.quality] || 0) + 1;
  });

  // 计算平均入睡和起床时间
  const avgBedTime = calculateAverageTime(records.map(r => r.bedTime));
  const avgWakeTime = calculateAverageTime(records.map(r => r.wakeTime));

  // 计算规律性评分 (基于时间的标准差)
  const regularityScore = calculateRegularityScore(records);

  // 计算趋势
  const trends = calculateTrends(records);

  // 构建每日数据
  const dailyData = buildDailyData(records);

  // 计算平均睡眠效率
  const efficiencies = records
    .filter(r => r.sleepEfficiency !== undefined)
    .map(r => r.sleepEfficiency!);
  const averageSleepEfficiency = efficiencies.length > 0
    ? efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length
    : 0;

  return {
    period: 'week',
    startDate: records[records.length - 1]?.bedTime || new Date().toISOString(),
    endDate: records[0]?.bedTime || new Date().toISOString(),
    averageDuration: Math.round(totalDuration / records.length),
    totalDays: records.length,
    recordedDays: records.length,
    averageQualityScore: parseFloat((totalQuality / records.length).toFixed(1)),
    bestQualityScore,
    worstQualityScore,
    longestSleep,
    shortestSleep,
    averageBedTime: avgBedTime,
    averageWakeTime: avgWakeTime,
    regularityScore,
    averageSleepEfficiency: Math.round(averageSleepEfficiency),
    qualityDistribution,
    dailyData,
    trends,
  };
};

/**
 * 计算平均时间
 */
const calculateAverageTime = (times: string[]): string => {
  if (times.length === 0) return '00:00';

  let totalMinutes = 0;
  
  times.forEach(timeStr => {
    const date = parseISO(timeStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    totalMinutes += hours * 60 + minutes;
  });

  const avgMinutes = Math.round(totalMinutes / times.length);
  const avgHours = Math.floor(avgMinutes / 60) % 24;
  const remainingMinutes = avgMinutes % 60;

  return `${avgHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
};

/**
 * 计算规律性评分 (0-100)
 */
const calculateRegularityScore = (records: SleepRecord[]): number => {
  if (records.length < 3) return 100;

  const bedTimes = records.map(r => {
    const date = parseISO(r.bedTime);
    return date.getHours() * 60 + date.getMinutes();
  });

  const wakeTimes = records.map(r => {
    const date = parseISO(r.wakeTime);
    return date.getHours() * 60 + date.getMinutes();
  });

  const bedTimeStdDev = calculateStandardDeviation(bedTimes);
  const wakeTimeStdDev = calculateStandardDeviation(wakeTimes);

  // 标准差越小越规律，标准差30分钟以内为满分
  const bedScore = Math.max(0, 100 - (bedTimeStdDev / 30) * 100);
  const wakeScore = Math.max(0, 100 - (wakeTimeStdDev / 30) * 100);

  return Math.round((bedScore + wakeScore) / 2);
};

/**
 * 计算标准差
 */
const calculateStandardDeviation = (values: number[]): number => {
  if (values.length < 2) return 0;
  
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squareDiffs = values.map(v => Math.pow(v - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  
  return Math.sqrt(avgSquareDiff);
};

/**
 * 计算睡眠趋势
 */
const calculateTrends = (records: SleepRecord[]): SleepTrends => {
  if (records.length < 4) {
    return {
      durationTrend: 0,
      qualityTrend: 0,
      regularityTrend: 0,
      improvementPercentage: 0,
    };
  }

  const midPoint = Math.floor(records.length / 2);
  const firstHalf = records.slice(midPoint);
  const secondHalf = records.slice(0, midPoint);

  const firstAvgDuration = firstHalf.reduce((sum, r) => sum + r.duration, 0) / firstHalf.length;
  const secondAvgDuration = secondHalf.reduce((sum, r) => sum + r.duration, 0) / secondHalf.length;
  
  const firstAvgQuality = firstHalf.reduce((sum, r) => sum + r.qualityScore, 0) / firstHalf.length;
  const secondAvgQuality = secondHalf.reduce((sum, r) => sum + r.qualityScore, 0) / secondHalf.length;

  const durationTrend = parseFloat(((secondAvgDuration - firstAvgDuration) / firstAvgDuration * 100).toFixed(1));
  const qualityTrend = parseFloat(((secondAvgQuality - firstAvgQuality) / firstAvgQuality * 100).toFixed(1));
  
  const improvementPercentage = parseFloat(((durationTrend + qualityTrend) / 2).toFixed(1));

  return {
    durationTrend,
    qualityTrend,
    regularityTrend: 0,
    improvementPercentage,
  };
};

/**
 * 构建每日数据
 */
const buildDailyData = (records: SleepRecord[]): DailySleepData[] => {
  return records.map(record => ({
    date: format(parseISO(record.bedTime), 'yyyy-MM-dd'),
    record,
    goalAchieved: record.qualityScore >= 7 && record.duration >= 420, // 7分以上且7小时以上
  }));
};

// ==================== Slice 定义 ====================

const sleepSlice = createSlice({
  name: 'sleep',
  initialState,
  reducers: {
    /**
     * 设置选中的睡眠记录
     */
    setSelectedRecord: (state, action: PayloadAction<SleepRecord | null>) => {
      state.selectedRecord = action.payload;
    },

    /**
     * 清空错误信息
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * 重置状态
     */
    resetSleepState: () => initialState,

    /**
     * 本地添加记录 (乐观更新)
     */
    addRecordOptimistically: (state, action: PayloadAction<SleepRecord>) => {
      state.records.unshift(action.payload);
      state.totalCount += 1;
      state.lastUpdated = new Date().toISOString();
      
      // 如果是今天的记录，更新 todayRecord
      const recordDate = format(parseISO(action.payload.bedTime), 'yyyy-MM-dd');
      const today = format(new Date(), 'yyyy-MM-dd');
      if (recordDate === today) {
        state.todayRecord = action.payload;
      }
    },

    /**
     * 本地更新记录 (乐观更新)
     */
    updateRecordOptimistically: (state, action: PayloadAction<SleepRecord>) => {
      const index = state.records.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
        state.lastUpdated = new Date().toISOString();
        
        if (state.selectedRecord?.id === action.payload.id) {
          state.selectedRecord = action.payload;
        }
        
        const recordDate = format(parseISO(action.payload.bedTime), 'yyyy-MM-dd');
        const today = format(new Date(), 'yyyy-MM-dd');
        if (recordDate === today) {
          state.todayRecord = action.payload;
        }
      }
    },

    /**
     * 本地删除记录 (乐观更新)
     */
    deleteRecordOptimistically: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.records = state.records.filter(r => r.id !== id);
      state.totalCount = Math.max(0, state.totalCount - 1);
      state.lastUpdated = new Date().toISOString();
      
      if (state.selectedRecord?.id === id) {
        state.selectedRecord = null;
      }
      
      if (state.todayRecord?.id === id) {
        state.todayRecord = null;
      }
    },

    /**
     * 更新统计数据
     */
    updateStatistics: (state) => {
      state.statistics = calculateStatistics(state.records);
    },
  },
  extraReducers: (builder) => {
    // ----- 创建记录 -----
    builder
      .addCase(createSleepRecord.pending, (state) => {
        state.loadingState = 'loading';
        state.error = null;
      })
      .addCase(createSleepRecord.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.records.unshift(action.payload);
        state.totalCount += 1;
        state.lastUpdated = new Date().toISOString();
        
        const recordDate = format(parseISO(action.payload.bedTime), 'yyyy-MM-dd');
        const today = format(new Date(), 'yyyy-MM-dd');
        if (recordDate === today) {
          state.todayRecord = action.payload;
        }
        
        state.statistics = calculateStatistics(state.records);
      })
      .addCase(createSleepRecord.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 获取所有记录 -----
    builder
      .addCase(fetchAllSleepRecords.pending, (state) => {
        state.loadingState = 'loading';
        state.error = null;
      })
      .addCase(fetchAllSleepRecords.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.records = action.payload.data;
        state.totalCount = action.payload.total;
        state.lastUpdated = new Date().toISOString();
        state.statistics = calculateStatistics(state.records);
      })
      .addCase(fetchAllSleepRecords.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 获取今日记录 -----
    builder
      .addCase(fetchTodaySleepRecord.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(fetchTodaySleepRecord.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.todayRecord = action.payload;
      })
      .addCase(fetchTodaySleepRecord.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 获取单条记录 -----
    builder
      .addCase(fetchSleepRecordById.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(fetchSleepRecordById.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        state.selectedRecord = action.payload;
      })
      .addCase(fetchSleepRecordById.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 更新记录 -----
    builder
      .addCase(updateSleepRecord.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(updateSleepRecord.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        const index = state.records.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.selectedRecord?.id === action.payload.id) {
          state.selectedRecord = action.payload;
        }
        if (state.todayRecord?.id === action.payload.id) {
          state.todayRecord = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
        state.statistics = calculateStatistics(state.records);
      })
      .addCase(updateSleepRecord.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 删除记录 -----
    builder
      .addCase(deleteSleepRecord.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(deleteSleepRecord.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        const id = action.payload;
        state.records = state.records.filter(r => r.id !== id);
        state.totalCount = Math.max(0, state.totalCount - 1);
        
        if (state.selectedRecord?.id === id) {
          state.selectedRecord = null;
        }
        if (state.todayRecord?.id === id) {
          state.todayRecord = null;
        }
        
        state.lastUpdated = new Date().toISOString();
        state.statistics = calculateStatistics(state.records);
      })
      .addCase(deleteSleepRecord.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 批量删除 -----
    builder
      .addCase(batchDeleteRecords.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(batchDeleteRecords.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        const ids = action.payload;
        state.records = state.records.filter(r => !ids.includes(r.id));
        state.totalCount = Math.max(0, state.totalCount - ids.length);
        
        if (state.selectedRecord && ids.includes(state.selectedRecord.id)) {
          state.selectedRecord = null;
        }
        if (state.todayRecord && ids.includes(state.todayRecord.id)) {
          state.todayRecord = null;
        }
        
        state.lastUpdated = new Date().toISOString();
        state.statistics = calculateStatistics(state.records);
      })
      .addCase(batchDeleteRecords.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 获取最近记录 -----
    builder
      .addCase(fetchRecentSleepRecords.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(fetchRecentSleepRecords.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        // 合并数据，避免重复
        const newRecords = action.payload.filter(
          newRecord => !state.records.some(r => r.id === newRecord.id)
        );
        state.records = [...newRecords, ...state.records];
        state.statistics = calculateStatistics(state.records);
      })
      .addCase(fetchRecentSleepRecords.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });

    // ----- 获取日期范围记录 -----
    builder
      .addCase(fetchSleepRecordsByDateRange.pending, (state) => {
        state.loadingState = 'loading';
      })
      .addCase(fetchSleepRecordsByDateRange.fulfilled, (state, action) => {
        state.loadingState = 'succeeded';
        // 合并数据，避免重复
        const newRecords = action.payload.filter(
          newRecord => !state.records.some(r => r.id === newRecord.id)
        );
        state.records = [...state.records, ...newRecords];
        state.statistics = calculateStatistics(state.records);
      })
      .addCase(fetchSleepRecordsByDateRange.rejected, (state, action) => {
        state.loadingState = 'failed';
        state.error = action.payload as string;
      });
  },
});

// ==================== 导出 ====================

export const {
  setSelectedRecord,
  clearError,
  resetSleepState,
  addRecordOptimistically,
  updateRecordOptimistically,
  deleteRecordOptimistically,
  updateStatistics,
} = sleepSlice.actions;

export default sleepSlice.reducer;

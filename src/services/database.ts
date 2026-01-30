/**
 * SleepTracker - 数据库服务模块
 * 使用 SQLite 实现睡眠记录的持久化存储
 * 包含完整的 CRUD 操作、事务管理和错误处理
 */

import SQLite, { SQLiteDatabase, Transaction } from 'react-native-sqlite-storage';
import {
  SleepRecord,
  CreateSleepRecordParams,
  UpdateSleepRecordParams,
  DatabaseQueryResult,
  PaginatedResult,
  PaginationParams,
  UserSettings,
  SleepGoal,
  ReminderSetting,
  ThemeMode,
  StatisticsPeriod,
} from '../types';

// 启用 Promise 支持
SQLite.enablePromise(true);

// ==================== 常量定义 ====================

/** 数据库名称 */
const DATABASE_NAME = 'SleepTracker.db';

/** 数据库版本 */
const DATABASE_VERSION = '1.0';

/** 数据库显示名称 */
const DATABASE_DISPLAY_NAME = 'Sleep Tracker Database';

/** 数据库大小 (10MB) */
const DATABASE_SIZE = 10 * 1024 * 1024;

/** 睡眠记录表名 */
const TABLE_SLEEP_RECORDS = 'sleep_records';

/** 用户设置表名 */
const TABLE_USER_SETTINGS = 'user_settings';

/** 睡眠统计缓存表名 */
const TABLE_STATISTICS_CACHE = 'statistics_cache';

// ==================== 数据库实例 ====================

/** 数据库实例 */
let database: SQLiteDatabase | null = null;

// ==================== SQL 语句定义 ====================

/**
 * 创建睡眠记录表的 SQL
 */
const CREATE_SLEEP_RECORDS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS ${TABLE_SLEEP_RECORDS} (
    id TEXT PRIMARY KEY NOT NULL,
    bed_time TEXT NOT NULL,
    wake_time TEXT NOT NULL,
    sleep_time TEXT,
    wake_up_count INTEGER DEFAULT 0,
    quality_score INTEGER NOT NULL,
    quality TEXT NOT NULL,
    duration INTEGER NOT NULL,
    deep_sleep_duration INTEGER,
    light_sleep_duration INTEGER,
    rem_sleep_duration INTEGER,
    notes TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_synced INTEGER DEFAULT 0,
    sleep_efficiency REAL,
    sleep_latency INTEGER,
    UNIQUE(id)
  );
`;

/**
 * 创建睡眠记录索引的 SQL
 */
const CREATE_SLEEP_RECORDS_INDEXES_SQL = [
  `CREATE INDEX IF NOT EXISTS idx_sleep_records_bed_time ON ${TABLE_SLEEP_RECORDS}(bed_time);`,
  `CREATE INDEX IF NOT EXISTS idx_sleep_records_wake_time ON ${TABLE_SLEEP_RECORDS}(wake_time);`,
  `CREATE INDEX IF NOT EXISTS idx_sleep_records_quality ON ${TABLE_SLEEP_RECORDS}(quality);`,
  `CREATE INDEX IF NOT EXISTS idx_sleep_records_is_synced ON ${TABLE_SLEEP_RECORDS}(is_synced);`,
];

/**
 * 创建用户设置表的 SQL
 */
const CREATE_USER_SETTINGS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS ${TABLE_USER_SETTINGS} (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    theme_mode TEXT DEFAULT 'system',
    use_24_hour_format INTEGER DEFAULT 1,
    temperature_unit TEXT DEFAULT 'C',
    language TEXT DEFAULT 'zh-CN',
    sleep_goal TEXT NOT NULL,
    reminders TEXT DEFAULT '[]',
    smart_reminders_enabled INTEGER DEFAULT 1,
    sleep_analysis_enabled INTEGER DEFAULT 1,
    cloud_sync_enabled INTEGER DEFAULT 0,
    privacy_mode_enabled INTEGER DEFAULT 0,
    password_hash TEXT,
    data_retention_days INTEGER DEFAULT 0,
    last_sync_time TEXT,
    user_id TEXT,
    username TEXT,
    avatar_url TEXT,
    registered_at TEXT,
    updated_at TEXT NOT NULL
  );
`;

/**
 * 创建统计缓存表的 SQL
 */
const CREATE_STATISTICS_CACHE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS ${TABLE_STATISTICS_CACHE} (
    id TEXT PRIMARY KEY NOT NULL,
    period TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
`;

// ==================== 数据库连接管理 ====================

/**
 * 打开数据库连接
 * 如果数据库已存在连接，则返回现有连接
 * @returns 数据库连接实例
 */
export const openDatabase = async (): Promise<SQLiteDatabase> => {
  try {
    if (database) {
      return database;
    }

    database = await SQLite.openDatabase({
      name: DATABASE_NAME,
      location: 'default',
    });

    return database;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to open database: ${errorMessage}`);
  }
};

/**
 * 关闭数据库连接
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (database) {
      await database.close();
      database = null;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error closing database:', errorMessage);
  }
};

/**
 * 获取数据库实例
 * @returns 当前数据库实例
 */
export const getDatabase = (): SQLiteDatabase => {
  if (!database) {
    throw new Error('Database not initialized. Call openDatabase() first.');
  }
  return database;
};

// ==================== 数据库初始化 ====================

/**
 * 初始化数据库
 * 创建所有必要的表和索引
 * @returns 初始化结果
 */
export const initializeDatabase = async (): Promise<DatabaseQueryResult<void>> => {
  try {
    const db = await openDatabase();

    // 创建睡眠记录表
    await db.executeSql(CREATE_SLEEP_RECORDS_TABLE_SQL);

    // 创建索引
    for (const indexSql of CREATE_SLEEP_RECORDS_INDEXES_SQL) {
      await db.executeSql(indexSql);
    }

    // 创建用户设置表
    await db.executeSql(CREATE_USER_SETTINGS_TABLE_SQL);

    // 创建统计缓存表
    await db.executeSql(CREATE_STATISTICS_CACHE_TABLE_SQL);

    // 初始化默认设置
    await initializeDefaultSettings();

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 初始化默认用户设置
 */
const initializeDefaultSettings = async (): Promise<void> => {
  try {
    const db = getDatabase();

    // 检查是否已有设置
    const [result] = await db.executeSql(
      `SELECT COUNT(*) as count FROM ${TABLE_USER_SETTINGS} WHERE id = 1`
    );

    const count = result.rows.item(0).count;

    if (count === 0) {
      // 插入默认设置
      const defaultSettings: UserSettings = {
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
      };

      await db.executeSql(
        `INSERT INTO ${TABLE_USER_SETTINGS} (
          id, theme_mode, use_24_hour_format, temperature_unit, language,
          sleep_goal, reminders, smart_reminders_enabled, sleep_analysis_enabled,
          cloud_sync_enabled, privacy_mode_enabled, data_retention_days, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          1,
          defaultSettings.themeMode,
          defaultSettings.use24HourFormat ? 1 : 0,
          defaultSettings.temperatureUnit,
          defaultSettings.language,
          JSON.stringify(defaultSettings.sleepGoal),
          JSON.stringify(defaultSettings.reminders),
          defaultSettings.smartRemindersEnabled ? 1 : 0,
          defaultSettings.sleepAnalysisEnabled ? 1 : 0,
          defaultSettings.cloudSyncEnabled ? 1 : 0,
          defaultSettings.privacyModeEnabled ? 1 : 0,
          defaultSettings.dataRetentionDays,
          new Date().toISOString(),
        ]
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to initialize default settings: ${errorMessage}`);
  }
};

// ==================== 事务管理 ====================

/**
 * 执行事务
 * @param callback 事务回调函数
 */
export const executeTransaction = async (
  callback: (transaction: Transaction) => Promise<void>
): Promise<DatabaseQueryResult<void>> => {
  try {
    const db = getDatabase();
    await db.transaction(callback);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

// ==================== 睡眠记录 CRUD 操作 ====================

/**
 * 将数据库行转换为 SleepRecord 对象
 * @param row 数据库行数据
 * @returns SleepRecord 对象
 */
const rowToSleepRecord = (row: any): SleepRecord => {
  return {
    id: row.id,
    bedTime: row.bed_time,
    wakeTime: row.wake_time,
    sleepTime: row.sleep_time,
    wakeUpCount: row.wake_up_count,
    qualityScore: row.quality_score,
    quality: row.quality,
    duration: row.duration,
    deepSleepDuration: row.deep_sleep_duration,
    lightSleepDuration: row.light_sleep_duration,
    remSleepDuration: row.rem_sleep_duration,
    notes: row.notes || '',
    tags: JSON.parse(row.tags || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isSynced: row.is_synced === 1,
    sleepEfficiency: row.sleep_efficiency,
    sleepLatency: row.sleep_latency,
  };
};

/**
 * 根据质量评分确定质量等级
 * @param score 质量评分 (1-10)
 * @returns 质量等级
 */
const getQualityFromScore = (score: number): SleepRecord['quality'] => {
  if (score >= 9) return 'excellent';
  if (score >= 7) return 'good';
  if (score >= 5) return 'fair';
  if (score >= 3) return 'poor';
  return 'terrible';
};

/**
 * 创建新的睡眠记录
 * @param params 创建参数
 * @returns 创建结果，包含新记录
 */
export const createSleepRecord = async (
  params: CreateSleepRecordParams
): Promise<DatabaseQueryResult<SleepRecord>> => {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 计算睡眠时长（分钟）
    const bedTime = new Date(params.bedTime);
    const wakeTime = new Date(params.wakeTime);
    let duration = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60);
    
    // 处理跨天的情况（假设睡眠时间不超过24小时）
    if (duration < 0) {
      duration += 24 * 60;
    }

    // 确定质量等级
    const quality = getQualityFromScore(params.qualityScore);

    const record: SleepRecord = {
      id,
      bedTime: params.bedTime,
      wakeTime: params.wakeTime,
      sleepTime: params.sleepTime,
      wakeUpCount: params.wakeUpCount || 0,
      qualityScore: params.qualityScore,
      quality,
      duration: Math.round(duration),
      deepSleepDuration: params.deepSleepDuration,
      lightSleepDuration: params.lightSleepDuration,
      remSleepDuration: params.remSleepDuration,
      notes: params.notes || '',
      tags: params.tags || [],
      createdAt: now,
      updatedAt: now,
      isSynced: false,
      sleepLatency: params.sleepLatency,
      sleepEfficiency: params.sleepTime
        ? Math.round((duration / ((wakeTime.getTime() - new Date(params.sleepTime).getTime()) / (1000 * 60))) * 100)
        : undefined,
    };

    await db.executeSql(
      `INSERT INTO ${TABLE_SLEEP_RECORDS} (
        id, bed_time, wake_time, sleep_time, wake_up_count, quality_score,
        quality, duration, deep_sleep_duration, light_sleep_duration,
        rem_sleep_duration, notes, tags, created_at, updated_at, is_synced,
        sleep_efficiency, sleep_latency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.bedTime,
        record.wakeTime,
        record.sleepTime || null,
        record.wakeUpCount,
        record.qualityScore,
        record.quality,
        record.duration,
        record.deepSleepDuration || null,
        record.lightSleepDuration || null,
        record.remSleepDuration || null,
        record.notes,
        JSON.stringify(record.tags),
        record.createdAt,
        record.updatedAt,
        record.isSynced ? 1 : 0,
        record.sleepEfficiency || null,
        record.sleepLatency || null,
      ]
    );

    return { success: true, data: record };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 根据ID获取睡眠记录
 * @param id 记录ID
 * @returns 查询结果
 */
export const getSleepRecordById = async (
  id: string
): Promise<DatabaseQueryResult<SleepRecord>> => {
  try {
    const db = getDatabase();
    const [result] = await db.executeSql(
      `SELECT * FROM ${TABLE_SLEEP_RECORDS} WHERE id = ?`,
      [id]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Record not found' };
    }

    const record = rowToSleepRecord(result.rows.item(0));
    return { success: true, data: record };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 获取所有睡眠记录
 * @param options 查询选项
 * @returns 分页结果
 */
export const getAllSleepRecords = async (
  options: {
    pagination?: PaginationParams;
    orderBy?: 'bed_time' | 'wake_time' | 'created_at';
    orderDirection?: 'ASC' | 'DESC';
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<DatabaseQueryResult<PaginatedResult<SleepRecord>>> => {
  try {
    const db = getDatabase();
    const {
      pagination = { page: 1, pageSize: 50 },
      orderBy = 'bed_time',
      orderDirection = 'DESC',
      startDate,
      endDate,
    } = options;

    let whereClause = '';
    const whereParams: any[] = [];

    if (startDate) {
      whereClause += ' WHERE bed_time >= ?';
      whereParams.push(startDate);
    }

    if (endDate) {
      whereClause += whereClause ? ' AND bed_time <= ?' : ' WHERE bed_time <= ?';
      whereParams.push(endDate);
    }

    // 获取总数
    const [countResult] = await db.executeSql(
      `SELECT COUNT(*) as total FROM ${TABLE_SLEEP_RECORDS}${whereClause}`,
      whereParams
    );
    const total = countResult.rows.item(0).total;

    // 获取分页数据
    const offset = (pagination.page - 1) * pagination.pageSize;
    const [dataResult] = await db.executeSql(
      `SELECT * FROM ${TABLE_SLEEP_RECORDS}${whereClause}
       ORDER BY ${orderBy} ${orderDirection}
       LIMIT ? OFFSET ?`,
      [...whereParams, pagination.pageSize, offset]
    );

    const records: SleepRecord[] = [];
    for (let i = 0; i < dataResult.rows.length; i++) {
      records.push(rowToSleepRecord(dataResult.rows.item(i)));
    }

    const totalPages = Math.ceil(total / pagination.pageSize);

    return {
      success: true,
      data: {
        data: records,
        total,
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 获取指定日期范围的睡眠记录
 * @param startDate 开始日期 (ISO 8601)
 * @param endDate 结束日期 (ISO 8601)
 * @returns 查询结果
 */
export const getSleepRecordsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<DatabaseQueryResult<SleepRecord[]>> => {
  try {
    const db = getDatabase();
    const [result] = await db.executeSql(
      `SELECT * FROM ${TABLE_SLEEP_RECORDS} 
       WHERE bed_time >= ? AND bed_time <= ?
       ORDER BY bed_time ASC`,
      [startDate, endDate]
    );

    const records: SleepRecord[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      records.push(rowToSleepRecord(result.rows.item(i)));
    }

    return { success: true, data: records };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 获取今日睡眠记录
 * @returns 查询结果
 */
export const getTodaySleepRecord = async (): Promise<DatabaseQueryResult<SleepRecord | null>> => {
  try {
    const db = getDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString();

    const [result] = await db.executeSql(
      `SELECT * FROM ${TABLE_SLEEP_RECORDS} 
       WHERE bed_time >= ? AND bed_time < ?
       ORDER BY bed_time DESC
       LIMIT 1`,
      [todayStr, tomorrowStr]
    );

    if (result.rows.length === 0) {
      return { success: true, data: null };
    }

    return { success: true, data: rowToSleepRecord(result.rows.item(0)) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 更新睡眠记录
 * @param params 更新参数
 * @returns 更新结果
 */
export const updateSleepRecord = async (
  params: UpdateSleepRecordParams
): Promise<DatabaseQueryResult<SleepRecord>> => {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    // 获取现有记录
    const existingResult = await getSleepRecordById(params.id);
    if (!existingResult.success || !existingResult.data) {
      return { success: false, error: 'Record not found' };
    }

    const existing = existingResult.data;

    // 构建更新字段
    const updates: string[] = [];
    const values: any[] = [];

    if (params.bedTime !== undefined) {
      updates.push('bed_time = ?');
      values.push(params.bedTime);
    }

    if (params.wakeTime !== undefined) {
      updates.push('wake_time = ?');
      values.push(params.wakeTime);
    }

    if (params.sleepTime !== undefined) {
      updates.push('sleep_time = ?');
      values.push(params.sleepTime);
    }

    if (params.wakeUpCount !== undefined) {
      updates.push('wake_up_count = ?');
      values.push(params.wakeUpCount);
    }

    if (params.qualityScore !== undefined) {
      updates.push('quality_score = ?');
      updates.push('quality = ?');
      values.push(params.qualityScore);
      values.push(getQualityFromScore(params.qualityScore));
    }

    if (params.notes !== undefined) {
      updates.push('notes = ?');
      values.push(params.notes);
    }

    if (params.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(params.tags));
    }

    if (params.deepSleepDuration !== undefined) {
      updates.push('deep_sleep_duration = ?');
      values.push(params.deepSleepDuration);
    }

    if (params.lightSleepDuration !== undefined) {
      updates.push('light_sleep_duration = ?');
      values.push(params.lightSleepDuration);
    }

    if (params.remSleepDuration !== undefined) {
      updates.push('rem_sleep_duration = ?');
      values.push(params.remSleepDuration);
    }

    if (params.sleepLatency !== undefined) {
      updates.push('sleep_latency = ?');
      values.push(params.sleepLatency);
    }

    // 更新时间和同步状态
    updates.push('updated_at = ?');
    updates.push('is_synced = ?');
    values.push(now);
    values.push(0);

    // 添加 ID 到参数列表
    values.push(params.id);

    await db.executeSql(
      `UPDATE ${TABLE_SLEEP_RECORDS} SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // 获取更新后的记录
    return await getSleepRecordById(params.id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 删除睡眠记录
 * @param id 记录ID
 * @returns 删除结果
 */
export const deleteSleepRecord = async (
  id: string
): Promise<DatabaseQueryResult<void>> => {
  try {
    const db = getDatabase();
    const [result] = await db.executeSql(
      `DELETE FROM ${TABLE_SLEEP_RECORDS} WHERE id = ?`,
      [id]
    );

    if (result.rowsAffected === 0) {
      return { success: false, error: 'Record not found' };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 批量删除睡眠记录
 * @param ids 记录ID数组
 * @returns 删除结果
 */
export const batchDeleteSleepRecords = async (
  ids: string[]
): Promise<DatabaseQueryResult<number>> => {
  try {
    const db = getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    
    const [result] = await db.executeSql(
      `DELETE FROM ${TABLE_SLEEP_RECORDS} WHERE id IN (${placeholders})`,
      ids
    );

    return { success: true, data: result.rowsAffected };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 获取最近的睡眠记录
 * @param limit 数量限制
 * @returns 查询结果
 */
export const getRecentSleepRecords = async (
  limit: number = 7
): Promise<DatabaseQueryResult<SleepRecord[]>> => {
  try {
    const db = getDatabase();
    const [result] = await db.executeSql(
      `SELECT * FROM ${TABLE_SLEEP_RECORDS} 
       ORDER BY bed_time DESC
       LIMIT ?`,
      [limit]
    );

    const records: SleepRecord[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      records.push(rowToSleepRecord(result.rows.item(i)));
    }

    return { success: true, data: records };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

// ==================== 用户设置操作 ====================

/**
 * 将数据库行转换为 UserSettings 对象
 */
const rowToUserSettings = (row: any): UserSettings => {
  return {
    themeMode: row.theme_mode as ThemeMode,
    use24HourFormat: row.use_24_hour_format === 1,
    temperatureUnit: row.temperature_unit,
    language: row.language,
    sleepGoal: JSON.parse(row.sleep_goal) as SleepGoal,
    reminders: JSON.parse(row.reminders) as ReminderSetting[],
    smartRemindersEnabled: row.smart_reminders_enabled === 1,
    sleepAnalysisEnabled: row.sleep_analysis_enabled === 1,
    cloudSyncEnabled: row.cloud_sync_enabled === 1,
    privacyModeEnabled: row.privacy_mode_enabled === 1,
    passwordHash: row.password_hash,
    dataRetentionDays: row.data_retention_days,
    lastSyncTime: row.last_sync_time,
    userId: row.user_id,
    username: row.username,
    avatarUrl: row.avatar_url,
    registeredAt: row.registered_at,
  };
};

/**
 * 获取用户设置
 * @returns 查询结果
 */
export const getUserSettings = async (): Promise<DatabaseQueryResult<UserSettings>> => {
  try {
    const db = getDatabase();
    const [result] = await db.executeSql(
      `SELECT * FROM ${TABLE_USER_SETTINGS} WHERE id = 1`
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Settings not found' };
    }

    const settings = rowToUserSettings(result.rows.item(0));
    return { success: true, data: settings };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 更新用户设置
 * @param settings 部分设置对象
 * @returns 更新结果
 */
export const updateUserSettings = async (
  settings: Partial<UserSettings>
): Promise<DatabaseQueryResult<UserSettings>> => {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    // 获取现有设置
    const existingResult = await getUserSettings();
    if (!existingResult.success || !existingResult.data) {
      return { success: false, error: 'Settings not found' };
    }

    const existing = existingResult.data;
    const updates: string[] = [];
    const values: any[] = [];

    if (settings.themeMode !== undefined) {
      updates.push('theme_mode = ?');
      values.push(settings.themeMode);
    }

    if (settings.use24HourFormat !== undefined) {
      updates.push('use_24_hour_format = ?');
      values.push(settings.use24HourFormat ? 1 : 0);
    }

    if (settings.temperatureUnit !== undefined) {
      updates.push('temperature_unit = ?');
      values.push(settings.temperatureUnit);
    }

    if (settings.language !== undefined) {
      updates.push('language = ?');
      values.push(settings.language);
    }

    if (settings.sleepGoal !== undefined) {
      updates.push('sleep_goal = ?');
      values.push(JSON.stringify({ ...existing.sleepGoal, ...settings.sleepGoal }));
    }

    if (settings.reminders !== undefined) {
      updates.push('reminders = ?');
      values.push(JSON.stringify(settings.reminders));
    }

    if (settings.smartRemindersEnabled !== undefined) {
      updates.push('smart_reminders_enabled = ?');
      values.push(settings.smartRemindersEnabled ? 1 : 0);
    }

    if (settings.sleepAnalysisEnabled !== undefined) {
      updates.push('sleep_analysis_enabled = ?');
      values.push(settings.sleepAnalysisEnabled ? 1 : 0);
    }

    if (settings.cloudSyncEnabled !== undefined) {
      updates.push('cloud_sync_enabled = ?');
      values.push(settings.cloudSyncEnabled ? 1 : 0);
    }

    if (settings.privacyModeEnabled !== undefined) {
      updates.push('privacy_mode_enabled = ?');
      values.push(settings.privacyModeEnabled ? 1 : 0);
    }

    if (settings.passwordHash !== undefined) {
      updates.push('password_hash = ?');
      values.push(settings.passwordHash);
    }

    if (settings.dataRetentionDays !== undefined) {
      updates.push('data_retention_days = ?');
      values.push(settings.dataRetentionDays);
    }

    if (settings.userId !== undefined) {
      updates.push('user_id = ?');
      values.push(settings.userId);
    }

    if (settings.username !== undefined) {
      updates.push('username = ?');
      values.push(settings.username);
    }

    if (settings.avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(settings.avatarUrl);
    }

    updates.push('updated_at = ?');
    values.push(now);

    values.push(1); // id = 1

    await db.executeSql(
      `UPDATE ${TABLE_USER_SETTINGS} SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return await getUserSettings();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

// ==================== 统计和数据分析 ====================

/**
 * 获取睡眠统计数据
 * @param period 统计周期
 * @returns 统计数据
 */
export const getSleepStatistics = async (
  period: StatisticsPeriod
): Promise<DatabaseQueryResult<any>> => {
  try {
    const db = getDatabase();
    
    let dateFilter = '';
    const now = new Date();
    
    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = `WHERE bed_time >= '${weekAgo.toISOString()}'`;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = `WHERE bed_time >= '${monthAgo.toISOString()}'`;
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter = `WHERE bed_time >= '${yearAgo.toISOString()}'`;
        break;
      default:
        dateFilter = '';
    }

    const [result] = await db.executeSql(
      `SELECT 
        COUNT(*) as total_records,
        AVG(duration) as avg_duration,
        AVG(quality_score) as avg_quality,
        MIN(quality_score) as min_quality,
        MAX(quality_score) as max_quality,
        SUM(CASE WHEN quality = 'excellent' THEN 1 ELSE 0 END) as excellent_count,
        SUM(CASE WHEN quality = 'good' THEN 1 ELSE 0 END) as good_count,
        SUM(CASE WHEN quality = 'fair' THEN 1 ELSE 0 END) as fair_count,
        SUM(CASE WHEN quality = 'poor' THEN 1 ELSE 0 END) as poor_count,
        SUM(CASE WHEN quality = 'terrible' THEN 1 ELSE 0 END) as terrible_count
       FROM ${TABLE_SLEEP_RECORDS}
       ${dateFilter}`
    );

    const stats = result.rows.item(0);
    return { success: true, data: stats };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

// ==================== 数据备份与导出 ====================

/**
 * 导出所有数据
 * @returns 导出结果，包含 JSON 数据
 */
export const exportAllData = async (): Promise<DatabaseQueryResult<string>> => {
  try {
    const settingsResult = await getUserSettings();
    const recordsResult = await getAllSleepRecords({ pagination: { page: 1, pageSize: 10000 } });

    if (!settingsResult.success) {
      return { success: false, error: settingsResult.error };
    }

    if (!recordsResult.success) {
      return { success: false, error: recordsResult.error };
    }

    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      settings: settingsResult.data,
      records: recordsResult.data?.data || [],
    };

    return { success: true, data: JSON.stringify(exportData, null, 2) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 清除所有数据
 * @returns 清除结果
 */
export const clearAllData = async (): Promise<DatabaseQueryResult<void>> => {
  try {
    const db = getDatabase();

    await db.executeSql(`DELETE FROM ${TABLE_SLEEP_RECORDS}`);
    await db.executeSql(`DELETE FROM ${TABLE_STATISTICS_CACHE}`);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * 重置数据库
 * 删除所有表并重新初始化
 * @returns 重置结果
 */
export const resetDatabase = async (): Promise<DatabaseQueryResult<void>> => {
  try {
    const db = getDatabase();

    await db.executeSql(`DROP TABLE IF EXISTS ${TABLE_SLEEP_RECORDS}`);
    await db.executeSql(`DROP TABLE IF EXISTS ${TABLE_USER_SETTINGS}`);
    await db.executeSql(`DROP TABLE IF EXISTS ${TABLE_STATISTICS_CACHE}`);

    return await initializeDatabase();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

// ==================== 数据库健康检查 ====================

/**
 * 检查数据库健康状态
 * @returns 健康检查结果
 */
export const checkDatabaseHealth = async (): Promise<
  DatabaseQueryResult<{
    isHealthy: boolean;
    recordCount: number;
    databaseSize: number;
    lastError?: string;
  }>
> => {
  try {
    const db = getDatabase();

    // 检查记录数量
    const [countResult] = await db.executeSql(
      `SELECT COUNT(*) as count FROM ${TABLE_SLEEP_RECORDS}`
    );
    const recordCount = countResult.rows.item(0).count;

    // 尝试执行简单查询验证连接
    await db.executeSql('SELECT 1');

    return {
      success: true,
      data: {
        isHealthy: true,
        recordCount,
        databaseSize: 0, // SQLite 不直接提供大小查询
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: true,
      data: {
        isHealthy: false,
        recordCount: 0,
        databaseSize: 0,
        lastError: errorMessage,
      },
    };
  }
};

export default {
  openDatabase,
  closeDatabase,
  getDatabase,
  initializeDatabase,
  executeTransaction,
  createSleepRecord,
  getSleepRecordById,
  getAllSleepRecords,
  getSleepRecordsByDateRange,
  getTodaySleepRecord,
  updateSleepRecord,
  deleteSleepRecord,
  batchDeleteSleepRecords,
  getRecentSleepRecords,
  getUserSettings,
  updateUserSettings,
  getSleepStatistics,
  exportAllData,
  clearAllData,
  resetDatabase,
  checkDatabaseHealth,
};

/**
 * SleepTracker - 类型定义模块
 * 定义应用中所有使用的 TypeScript 接口和类型
 */

// ==================== 睡眠记录相关类型 ====================

/**
 * 睡眠质量等级
 */
export type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'terrible';

/**
 * 睡眠阶段类型
 */
export type SleepStage = 'awake' | 'light' | 'deep' | 'rem';

/**
 * 睡眠标签类型
 */
export type SleepTag = 
  | 'caffeine'      // 咖啡因
  | 'alcohol'       // 酒精
  | 'exercise'      // 运动
  | 'stress'        // 压力
  | 'screen'        // 屏幕时间
  | 'late_meal'     // 夜宵
  | 'medication'    // 药物
  | 'noise'         // 噪音
  | 'temperature'   // 温度
  | 'travel';       // 旅行

/**
 * 睡眠记录接口
 * 存储单次睡眠的完整数据
 */
export interface SleepRecord {
  /** 唯一标识符 */
  id: string;
  
  /** 入睡时间 (ISO 8601 格式) */
  bedTime: string;
  
  /** 起床时间 (ISO 8601 格式) */
  wakeTime: string;
  
  /** 实际睡着时间 (ISO 8601 格式，可选) */
  sleepTime?: string;
  
  /** 醒来次数 */
  wakeUpCount: number;
  
  /** 睡眠质量评分 (1-10) */
  qualityScore: number;
  
  /** 睡眠质量等级 */
  quality: SleepQuality;
  
  /** 睡眠时长 (分钟) */
  duration: number;
  
  /** 深度睡眠时长 (分钟，可选) */
  deepSleepDuration?: number;
  
  /** 浅度睡眠时长 (分钟，可选) */
  lightSleepDuration?: number;
  
  /** REM睡眠时长 (分钟，可选) */
  remSleepDuration?: number;
  
  /** 用户备注 */
  notes: string;
  
  /** 睡眠标签数组 */
  tags: SleepTag[];
  
  /** 创建时间 */
  createdAt: string;
  
  /** 更新时间 */
  updatedAt: string;
  
  /** 是否同步到云端 */
  isSynced: boolean;
  
  /** 睡眠效率 (百分比) */
  sleepEfficiency?: number;
  
  /** 入睡潜伏期 (分钟，从躺下到入睡的时间) */
  sleepLatency?: number;
}

/**
 * 睡眠记录创建参数
 */
export interface CreateSleepRecordParams {
  bedTime: string;
  wakeTime: string;
  sleepTime?: string;
  wakeUpCount?: number;
  qualityScore: number;
  notes?: string;
  tags?: SleepTag[];
  deepSleepDuration?: number;
  lightSleepDuration?: number;
  remSleepDuration?: number;
  sleepLatency?: number;
}

/**
 * 睡眠记录更新参数
 */
export interface UpdateSleepRecordParams {
  id: string;
  bedTime?: string;
  wakeTime?: string;
  sleepTime?: string;
  wakeUpCount?: number;
  qualityScore?: number;
  notes?: string;
  tags?: SleepTag[];
  deepSleepDuration?: number;
  lightSleepDuration?: number;
  remSleepDuration?: number;
  sleepLatency?: number;
}

// ==================== 用户配置相关类型 ====================

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 提醒类型
 */
export type ReminderType = 'bedtime' | 'waketime' | 'winddown';

/**
 * 提醒设置
 */
export interface ReminderSetting {
  /** 提醒类型 */
  type: ReminderType;
  
  /** 是否启用 */
  enabled: boolean;
  
  /** 提醒时间 (HH:mm 格式) */
  time: string;
  
  /** 提醒重复日期 (0=周日, 6=周六) */
  repeatDays: number[];
  
  /** 提醒音效 */
  sound: string;
  
  /** 震动 */
  vibration: boolean;
  
  /** 提前提醒时间 (分钟) */
  advanceMinutes: number;
}

/**
 * 睡眠目标设置
 */
export interface SleepGoal {
  /** 目标睡眠时长 (分钟) */
  durationGoal: number;
  
  /** 目标入睡时间 */
  targetBedTime: string;
  
  /** 目标起床时间 */
  targetWakeTime: string;
  
  /** 目标睡眠质量评分 */
  targetQualityScore: number;
  
  /** 每周目标天数 */
  targetDaysPerWeek: number;
}

/**
 * 用户配置接口
 */
export interface UserSettings {
  /** 主题模式 */
  themeMode: ThemeMode;
  
  /** 使用24小时制 */
  use24HourFormat: boolean;
  
  /** 温度单位 (C/F) */
  temperatureUnit: 'C' | 'F';
  
  /** 语言设置 */
  language: string;
  
  /** 睡眠目标 */
  sleepGoal: SleepGoal;
  
  /** 提醒设置数组 */
  reminders: ReminderSetting[];
  
  /** 是否启用智能提醒 */
  smartRemindersEnabled: boolean;
  
  /** 是否启用睡眠分析 */
  sleepAnalysisEnabled: boolean;
  
  /** 是否启用云同步 */
  cloudSyncEnabled: boolean;
  
  /** 隐私模式 (是否启用密码保护) */
  privacyModeEnabled: boolean;
  
  /** 密码 (加密存储) */
  passwordHash?: string;
  
  /** 数据保留天数 (0表示永久) */
  dataRetentionDays: number;
  
  /** 最后同步时间 */
  lastSyncTime?: string;
  
  /** 用户ID */
  userId?: string;
  
  /** 用户名 */
  username?: string;
  
  /** 用户头像URL */
  avatarUrl?: string;
  
  /** 注册时间 */
  registeredAt?: string;
}

/**
 * 用户设置更新参数
 */
export interface UpdateUserSettingsParams {
  themeMode?: ThemeMode;
  use24HourFormat?: boolean;
  temperatureUnit?: 'C' | 'F';
  language?: string;
  sleepGoal?: Partial<SleepGoal>;
  reminders?: ReminderSetting[];
  smartRemindersEnabled?: boolean;
  sleepAnalysisEnabled?: boolean;
  cloudSyncEnabled?: boolean;
  privacyModeEnabled?: boolean;
  passwordHash?: string;
  dataRetentionDays?: number;
  username?: string;
  avatarUrl?: string;
}

// ==================== 统计数据相关类型 ====================

/**
 * 睡眠统计周期
 */
export type StatisticsPeriod = 'day' | 'week' | 'month' | 'year' | 'custom';

/**
 * 睡眠统计数据
 */
export interface SleepStatistics {
  /** 统计周期 */
  period: StatisticsPeriod;
  
  /** 开始日期 */
  startDate: string;
  
  /** 结束日期 */
  endDate: string;
  
  /** 平均睡眠时长 (分钟) */
  averageDuration: number;
  
  /** 总睡眠天数 */
  totalDays: number;
  
  /** 记录天数 */
  recordedDays: number;
  
  /** 平均睡眠质量评分 */
  averageQualityScore: number;
  
  /** 最佳睡眠质量评分 */
  bestQualityScore: number;
  
  /** 最差睡眠质量评分 */
  worstQualityScore: number;
  
  /** 最长睡眠时长 */
  longestSleep: number;
  
  /** 最短睡眠时长 */
  shortestSleep: number;
  
  /** 平均入睡时间 */
  averageBedTime: string;
  
  /** 平均起床时间 */
  averageWakeTime: string;
  
  /** 睡眠规律性评分 (0-100) */
  regularityScore: number;
  
  /** 睡眠效率平均值 */
  averageSleepEfficiency: number;
  
  /** 各质量等级次数统计 */
  qualityDistribution: Record<SleepQuality, number>;
  
  /** 每日详细数据 */
  dailyData: DailySleepData[];
  
  /** 趋势分析 */
  trends: SleepTrends;
}

/**
 * 每日睡眠数据
 */
export interface DailySleepData {
  /** 日期 */
  date: string;
  
  /** 睡眠记录 (可能为空) */
  record?: SleepRecord;
  
  /** 是否达成目标 */
  goalAchieved: boolean;
}

/**
 * 睡眠趋势分析
 */
export interface SleepTrends {
  /** 睡眠时长趋势 (正数=改善，负数=恶化) */
  durationTrend: number;
  
  /** 睡眠质量趋势 */
  qualityTrend: number;
  
  /** 规律性趋势 */
  regularityTrend: number;
  
  /** 相比上期的改善百分比 */
  improvementPercentage: number;
}

/**
 * 睡眠洞察/建议
 */
export interface SleepInsight {
  /** 洞察ID */
  id: string;
  
  /** 洞察类型 */
  type: 'positive' | 'warning' | 'tip' | 'achievement';
  
  /** 标题 */
  title: string;
  
  /** 详细描述 */
  description: string;
  
  /** 相关指标 */
  relatedMetric?: string;
  
  /** 建议操作 */
  suggestedAction?: string;
  
  /** 生成日期 */
  generatedAt: string;
  
  /** 是否已读 */
  isRead: boolean;
  
  /** 优先级 */
  priority: 'low' | 'medium' | 'high';
}

// ==================== 应用状态相关类型 ====================

/**
 * 加载状态
 */
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * 异步操作状态
 */
export interface AsyncState {
  loading: boolean;
  error: string | null;
}

/**
 * 睡眠状态 (Redux)
 */
export interface SleepState {
  /** 所有睡眠记录 */
  records: SleepRecord[];
  
  /** 当前选中的记录 */
  selectedRecord: SleepRecord | null;
  
  /** 今日记录 */
  todayRecord: SleepRecord | null;
  
  /** 统计数据 */
  statistics: SleepStatistics | null;
  
  /** 加载状态 */
  loadingState: LoadingState;
  
  /** 错误信息 */
  error: string | null;
  
  /** 记录总数 */
  totalCount: number;
  
  /** 最后更新时间 */
  lastUpdated: string | null;
}

/**
 * 设置状态 (Redux)
 */
export interface SettingsState {
  /** 用户设置 */
  settings: UserSettings;
  
  /** 加载状态 */
  loadingState: LoadingState;
  
  /** 错误信息 */
  error: string | null;
  
  /** 是否已初始化 */
  isInitialized: boolean;
}

/**
 * 应用全局状态
 */
export interface AppState {
  /** 睡眠模块状态 */
  sleep: SleepState;
  
  /** 设置模块状态 */
  settings: SettingsState;
}

// ==================== 导航相关类型 ====================

/**
 * 主 Tab 导航参数列表
 */
export type MainTabParamList = {
  Home: undefined;
  Statistics: undefined;
  Add: undefined;
  History: undefined;
  Settings: undefined;
};

/**
 * 根栈导航参数列表
 */
export type RootStackParamList = {
  MainTabs: undefined;
  SleepDetail: { recordId: string };
  SleepEdit: { recordId?: string };
  StatisticsDetail: { period: StatisticsPeriod };
  SettingsDetail: { section: string };
  GoalSetting: undefined;
  ReminderSetting: undefined;
  DataExport: undefined;
  About: undefined;
};

// ==================== 组件 Props 类型 ====================

/**
 * 睡眠质量卡片 Props
 */
export interface SleepQualityCardProps {
  /** 睡眠记录 */
  record: SleepRecord;
  
  /** 点击回调 */
  onPress?: (record: SleepRecord) => void;
  
  /** 是否紧凑模式 */
  compact?: boolean;
}

/**
 * 睡眠统计卡片 Props
 */
export interface SleepStatsCardProps {
  /** 统计数据 */
  statistics: SleepStatistics;
  
  /** 标题 */
  title?: string;
  
  /** 点击回调 */
  onPress?: () => void;
}

/**
 * 图表数据点
 */
export interface ChartDataPoint {
  /** X轴标签 */
  label: string;
  
  /** Y轴数值 */
  value: number;
  
  /** 颜色 */
  color?: string;
  
  /** 附加数据 */
  data?: SleepRecord;
}

/**
 * 时间范围选择器 Props
 */
export interface DateRangePickerProps {
  /** 开始日期 */
  startDate: Date;
  
  /** 结束日期 */
  endDate: Date;
  
  /** 日期变化回调 */
  onDateChange: (start: Date, end: Date) => void;
  
  /** 预设周期选项 */
  presetPeriods?: StatisticsPeriod[];
}

// ==================== 工具类型 ====================

/**
 * 数据库查询结果
 */
export interface DatabaseQueryResult<T> {
  /** 是否成功 */
  success: boolean;
  
  /** 数据 */
  data?: T;
  
  /** 错误信息 */
  error?: string;
  
  /** 影响行数 */
  affectedRows?: number;
  
  /** 插入ID */
  insertId?: number;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 页码 (从1开始) */
  page: number;
  
  /** 每页数量 */
  pageSize: number;
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  /** 数据列表 */
  data: T[];
  
  /** 总记录数 */
  total: number;
  
  /** 当前页码 */
  page: number;
  
  /** 每页数量 */
  pageSize: number;
  
  /** 总页数 */
  totalPages: number;
  
  /** 是否有下一页 */
  hasNextPage: boolean;
  
  /** 是否有上一页 */
  hasPreviousPage: boolean;
}

/**
 * 睡眠建议规则
 */
export interface SleepAdviceRule {
  /** 规则ID */
  id: string;
  
  /** 规则名称 */
  name: string;
  
  /** 触发条件 */
  condition: (stats: SleepStatistics) => boolean;
  
  /** 建议消息 */
  message: string;
  
  /** 建议优先级 */
  priority: 'low' | 'medium' | 'high';
  
  /** 相关标签 */
  relatedTags?: SleepTag[];
}

/**
 * 睡眠知识文章
 */
export interface SleepKnowledgeArticle {
  /** 文章ID */
  id: string;
  
  /** 标题 */
  title: string;
  
  /** 摘要 */
  summary: string;
  
  /** 内容 */
  content: string;
  
  /** 分类 */
  category: string;
  
  /** 标签 */
  tags: string[];
  
  /** 阅读时间 (分钟) */
  readTime: number;
  
  /** 封面图片 */
  coverImage?: string;
  
  /** 发布日期 */
  publishedAt: string;
}

/**
 * 睡眠影响因素
 */
export interface SleepFactor {
  /** 因素名称 */
  name: string;
  
  /** 因素类型 */
  type: 'positive' | 'negative' | 'neutral';
  
  /** 影响程度 (0-100) */
  impact: number;
  
  /** 描述 */
  description: string;
  
  /** 建议 */
  recommendation?: string;
}

/**
 * 导出数据格式
 */
export interface ExportData {
  /** 导出版本 */
  version: string;
  
  /** 导出日期 */
  exportDate: string;
  
  /** 用户设置 */
  settings: UserSettings;
  
  /** 睡眠记录 */
  records: SleepRecord[];
  
  /** 统计数据 */
  statistics?: SleepStatistics;
}

/**
 * 应用主题
 */
export interface AppTheme {
  /** 主色调 */
  primary: string;
  
  /** 次要色调 */
  secondary: string;
  
  /** 背景色 */
  background: string;
  
  /** 卡片背景色 */
  card: string;
  
  /** 文字颜色 */
  text: string;
  
  /** 次要文字颜色 */
  textSecondary: string;
  
  /** 边框颜色 */
  border: string;
  
  /** 通知/提示色 */
  notification: string;
  
  /** 成功色 */
  success: string;
  
  /** 警告色 */
  warning: string;
  
  /** 错误色 */
  error: string;
  
  /** 信息色 */
  info: string;
  
  /** 睡眠质量颜色映射 */
  qualityColors: Record<SleepQuality, string>;
}

/**
 * 睡眠阶段数据
 */
export interface SleepStageData {
  /** 阶段类型 */
  stage: SleepStage;
  
  /** 开始时间 */
  startTime: string;
  
  /** 结束时间 */
  endTime: string;
  
  /** 持续时间 (分钟) */
  duration: number;
}

/**
 * 智能分析结果
 */
export interface SmartAnalysisResult {
  /** 分析ID */
  id: string;
  
  /** 分析日期 */
  analysisDate: string;
  
  /** 睡眠评分 (0-100) */
  overallScore: number;
  
  /** 评分解释 */
  scoreExplanation: string;
  
  /** 识别的模式 */
  identifiedPatterns: string[];
  
  /** 发现的问题 */
  issues: string[];
  
  /** 个性化建议 */
  recommendations: string[];
  
  /** 影响因素分析 */
  factors: SleepFactor[];
  
  /** 预测数据 */
  predictions?: {
    nextWeekTrend: 'improving' | 'stable' | 'declining';
    predictedSleepQuality: number;
    confidence: number;
  };
}

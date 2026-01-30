/**
 * SleepTracker - 日期工具函数
 * 提供日期处理、格式化、计算等功能
 */

import {
  format,
  parseISO,
  isValid,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInMinutes,
  differenceInHours,
  isSameDay,
  isToday,
  isYesterday,
  isTomorrow,
  getHours,
  getMinutes,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

// ==================== 格式化函数 ====================

/**
 * 格式化日期为显示字符串
 * @param date 日期对象或ISO字符串
 * @param formatStr 格式化模式
 * @returns 格式化后的字符串
 */
export const formatDate = (
  date: Date | string | null | undefined,
  formatStr: string = 'yyyy-MM-dd'
): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatStr, { locale: zhCN });
};

/**
 * 格式化时间为显示字符串
 * @param date 日期对象或ISO字符串
 * @param use24Hour 是否使用24小时制
 * @returns 格式化后的时间字符串
 */
export const formatTime = (
  date: Date | string | null | undefined,
  use24Hour: boolean = true
): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  const formatStr = use24Hour ? 'HH:mm' : 'hh:mm a';
  return format(dateObj, formatStr);
};

/**
 * 格式化日期时间为完整字符串
 * @param date 日期对象或ISO字符串
 * @param use24Hour 是否使用24小时制
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (
  date: Date | string | null | undefined,
  use24Hour: boolean = true
): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  const formatStr = use24Hour ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd hh:mm a';
  return format(dateObj, formatStr, { locale: zhCN });
};

/**
 * 格式化时长为可读字符串
 * @param minutes 分钟数
 * @param showSeconds 是否显示秒
 * @returns 格式化后的时长字符串
 */
export const formatDuration = (minutes: number, showSeconds: boolean = false): string => {
  if (minutes < 0) return '0分钟';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}分钟`;
  }
  
  if (mins === 0) {
    return `${hours}小时`;
  }
  
  return `${hours}小时${mins}分钟`;
};

/**
 * 格式化时长为简短字符串
 * @param minutes 分钟数
 * @returns 格式化后的简短字符串，如 "8h30m"
 */
export const formatDurationShort = (minutes: number): string => {
  if (minutes < 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${mins}m`;
};

// ==================== 解析函数 ====================

/**
 * 解析时间为今天的日期对象
 * @param timeStr 时间字符串 (HH:mm 或 hh:mm a)
 * @returns 日期对象
 */
export const parseTimeString = (timeStr: string): Date | null => {
  if (!timeStr) return null;
  
  const today = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) return null;
  
  today.setHours(hours, minutes, 0, 0);
  return today;
};

/**
 * 解析ISO字符串为日期对象
 * @param isoString ISO 8601 格式字符串
 * @returns 日期对象或null
 */
export const parseISODate = (isoString: string | null | undefined): Date | null => {
  if (!isoString) return null;
  
  try {
    const date = parseISO(isoString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

// ==================== 计算函数 ====================

/**
 * 计算两个时间之间的分钟差
 * @param start 开始时间
 * @param end 结束时间
 * @returns 分钟差
 */
export const calculateDurationMinutes = (
  start: Date | string,
  end: Date | string
): number => {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  
  if (!isValid(startDate) || !isValid(endDate)) return 0;
  
  let diff = differenceInMinutes(endDate, startDate);
  
  // 处理跨天的情况（假设睡眠时间不超过24小时）
  if (diff < 0) {
    diff += 24 * 60;
  }
  
  return diff;
};

/**
 * 计算睡眠时长的小时部分
 * @param minutes 分钟数
 * @returns 小时数
 */
export const getHoursFromMinutes = (minutes: number): number => {
  return Math.floor(minutes / 60);
};

/**
 * 计算睡眠时长的分钟部分
 * @param minutes 总分钟数
 * @returns 剩余分钟数
 */
export const getRemainingMinutes = (minutes: number): number => {
  return minutes % 60;
};

// ==================== 日期范围函数 ====================

/**
 * 获取本周的日期范围
 * @param date 参考日期
 * @returns 开始和结束日期
 */
export const getWeekRange = (date: Date = new Date()): { start: Date; end: Date } => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // 周一为一周开始
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
};

/**
 * 获取本月的日期范围
 * @param date 参考日期
 * @returns 开始和结束日期
 */
export const getMonthRange = (date: Date = new Date()): { start: Date; end: Date } => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

/**
 * 获取最近N天的日期范围
 * @param days 天数
 * @param endDate 结束日期
 * @returns 开始和结束日期
 */
export const getLastNDaysRange = (
  days: number,
  endDate: Date = new Date()
): { start: Date; end: Date } => {
  return {
    start: subDays(endDate, days - 1),
    end: endDate,
  };
};

// ==================== 比较函数 ====================

/**
 * 检查两个日期是否是同一天
 * @param date1 日期1
 * @param date2 日期2
 * @returns 是否同一天
 */
export const isSameDate = (
  date1: Date | string,
  date2: Date | string
): boolean => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  
  if (!isValid(d1) || !isValid(d2)) return false;
  
  return isSameDay(d1, d2);
};

/**
 * 检查日期是否是今天
 * @param date 日期
 * @returns 是否今天
 */
export const isTodayDate = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return false;
  
  return isToday(d);
};

/**
 * 检查日期是否是昨天
 * @param date 日期
 * @returns 是否昨天
 */
export const isYesterdayDate = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return false;
  
  return isYesterday(d);
};

/**
 * 检查日期是否是明天
 * @param date 日期
 * @returns 是否明天
 */
export const isTomorrowDate = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return false;
  
  return isTomorrow(d);
};

// ==================== 显示函数 ====================

/**
 * 获取相对日期显示文本
 * @param date 日期
 * @returns 显示文本
 */
export const getRelativeDateText = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  
  if (isToday(d)) return '今天';
  if (isYesterday(d)) return '昨天';
  if (isTomorrow(d)) return '明天';
  
  return formatDate(d, 'MM月dd日');
};

/**
 * 获取星期显示文本
 * @param date 日期
 * @returns 星期文本
 */
export const getWeekdayText = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[d.getDay()];
};

// ==================== 睡眠专用函数 ====================

/**
 * 计算睡眠质量等级
 * @param score 质量评分 (1-10)
 * @returns 质量等级
 */
export const getSleepQualityFromScore = (
  score: number
): 'excellent' | 'good' | 'fair' | 'poor' | 'terrible' => {
  if (score >= 9) return 'excellent';
  if (score >= 7) return 'good';
  if (score >= 5) return 'fair';
  if (score >= 3) return 'poor';
  return 'terrible';
};

/**
 * 获取睡眠质量显示文本
 * @param quality 质量等级
 * @returns 显示文本
 */
export const getSleepQualityText = (
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible'
): string => {
  const qualityMap = {
    excellent: '极佳',
    good: '良好',
    fair: '一般',
    poor: '较差',
    terrible: '糟糕',
  };
  return qualityMap[quality];
};

/**
 * 获取睡眠质量颜色
 * @param quality 质量等级
 * @returns 颜色代码
 */
export const getSleepQualityColor = (
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible'
): string => {
  const colorMap = {
    excellent: '#4CAF50', // 绿色
    good: '#8BC34A',      // 浅绿
    fair: '#FFC107',      // 黄色
    poor: '#FF9800',      // 橙色
    terrible: '#F44336',  // 红色
  };
  return colorMap[quality];
};

/**
 * 计算入睡潜伏期
 * @param bedTime 躺下时间
 * @param sleepTime 入睡时间
 * @returns 潜伏期分钟数
 */
export const calculateSleepLatency = (
  bedTime: Date | string,
  sleepTime?: Date | string | null
): number | undefined => {
  if (!sleepTime) return undefined;
  
  return calculateDurationMinutes(bedTime, sleepTime);
};

/**
 * 计算睡眠效率
 * @param duration 实际睡眠时长（分钟）
 * @param bedTime 躺下时间
 * @param wakeTime 起床时间
 * @returns 睡眠效率百分比
 */
export const calculateSleepEfficiency = (
  duration: number,
  bedTime: Date | string,
  wakeTime: Date | string
): number => {
  const timeInBed = calculateDurationMinutes(bedTime, wakeTime);
  if (timeInBed === 0) return 0;
  
  return Math.round((duration / timeInBed) * 100);
};

// ==================== 导出默认对象 ====================

export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  formatDurationShort,
  parseTimeString,
  parseISODate,
  calculateDurationMinutes,
  getHoursFromMinutes,
  getRemainingMinutes,
  getWeekRange,
  getMonthRange,
  getLastNDaysRange,
  isSameDate,
  isTodayDate,
  isYesterdayDate,
  isTomorrowDate,
  getRelativeDateText,
  getWeekdayText,
  getSleepQualityFromScore,
  getSleepQualityText,
  getSleepQualityColor,
  calculateSleepLatency,
  calculateSleepEfficiency,
};

/**
 * SleepTracker - 主题配置
 * 定义应用的颜色、字体、间距等样式变量
 */

import { AppTheme } from '../types';

// ==================== 颜色定义 ====================

/**
 * 基础颜色
 */
export const colors = {
  // 主色调
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // 次要色调
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0',
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },
  
  // 灰度色
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // 语义化颜色
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
  },
  warning: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
  },
  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
  },
  info: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1976D2',
  },
};

/**
 * 睡眠质量颜色
 */
export const qualityColors = {
  excellent: '#4CAF50', // 极佳 - 绿色
  good: '#8BC34A',      // 良好 - 浅绿
  fair: '#FFC107',      // 一般 - 黄色
  poor: '#FF9800',      // 较差 - 橙色
  terrible: '#F44336',  // 糟糕 - 红色
};

/**
 * 睡眠阶段颜色
 */
export const stageColors = {
  awake: '#FF5722',   // 清醒
  light: '#4CAF50',   // 浅睡
  deep: '#2196F3',    // 深睡
  rem: '#9C27B0',     // REM
};

// ==================== 亮/暗主题 ====================

/**
 * 亮色主题
 */
export const lightTheme: AppTheme = {
  primary: colors.primary[500],
  secondary: colors.secondary[500],
  background: colors.gray[50],
  card: '#FFFFFF',
  text: colors.gray[900],
  textSecondary: colors.gray[600],
  border: colors.gray[300],
  notification: colors.primary[500],
  success: colors.success.main,
  warning: colors.warning.main,
  error: colors.error.main,
  info: colors.info.main,
  qualityColors,
};

/**
 * 暗色主题
 */
export const darkTheme: AppTheme = {
  primary: colors.primary[400],
  secondary: colors.secondary[400],
  background: colors.gray[900],
  card: colors.gray[800],
  text: colors.gray[50],
  textSecondary: colors.gray[400],
  border: colors.gray[700],
  notification: colors.primary[400],
  success: colors.success.light,
  warning: colors.warning.light,
  error: colors.error.light,
  info: colors.info.light,
  qualityColors,
};

// ==================== 字体定义 ====================

/**
 * 字体大小
 */
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 40,
};

/**
 * 字体粗细
 */
export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

/**
 * 行高
 */
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// ==================== 间距定义 ====================

/**
 * 间距
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

/**
 * 圆角
 */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// ==================== 阴影定义 ====================

/**
 * 阴影样式
 */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ==================== 动画定义 ====================

/**
 * 动画时长
 */
export const animationDuration = {
  fast: 150,
  normal: 300,
  slow: 500,
};

/**
 * 缓动函数
 */
export const easing = {
  easeInOut: 'ease-in-out',
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  linear: 'linear',
};

// ==================== 布局定义 ====================

/**
 * 断点
 */
export const breakpoints = {
  xs: 0,
  sm: 320,
  md: 375,
  lg: 414,
  xl: 768,
};

/**
 * Z-Index 层级
 */
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
};

// ==================== 组件特定样式 ====================

/**
 * 按钮样式
 */
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  secondary: {
    backgroundColor: colors.secondary[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
};

/**
 * 卡片样式
 */
export const cardStyles = {
  default: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  flat: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.lg,
  },
};

/**
 * 输入框样式
 */
export const inputStyles = {
  default: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
  },
  focused: {
    borderColor: colors.primary[500],
  },
  error: {
    borderColor: colors.error.main,
  },
};

// ==================== 导出默认 ====================

export default {
  colors,
  qualityColors,
  stageColors,
  lightTheme,
  darkTheme,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
  borderRadius,
  shadows,
  animationDuration,
  easing,
  breakpoints,
  zIndex,
  buttonStyles,
  cardStyles,
  inputStyles,
};

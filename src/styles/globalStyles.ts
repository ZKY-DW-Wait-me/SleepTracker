/**
 * SleepTracker - 全局样式
 * 定义应用的全局样式和通用组件样式
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from './theme';

/**
 * 全局样式表
 */
export const globalStyles = StyleSheet.create({
  // ==================== 容器 ====================
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  
  safeArea: {
    flex: 1,
  },
  
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  
  // ==================== 文本 ====================
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold as any,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  
  subtitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold as any,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  
  heading: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium as any,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal as any,
    color: colors.gray[700],
    lineHeight: 22,
  },
  
  caption: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal as any,
    color: colors.gray[500],
  },
  
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium as any,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  
  // ==================== 卡片 ====================
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  
  cardFlat: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  
  // ==================== 按钮 ====================
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium as any,
  },
  
  buttonSecondary: {
    backgroundColor: colors.secondary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonOutlineText: {
    color: colors.primary[500],
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium as any,
  },
  
  buttonDisabled: {
    backgroundColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // ==================== 输入框 ====================
  input: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
    color: colors.gray[900],
  },
  
  inputFocused: {
    borderColor: colors.primary[500],
  },
  
  inputError: {
    borderColor: colors.error.main,
  },
  
  // ==================== 列表 ====================
  listItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  
  listItemLast: {
    borderBottomWidth: 0,
  },
  
  // ==================== 分隔线 ====================
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.lg,
  },
  
  dividerVertical: {
    width: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.lg,
  },
  
  // ==================== 间距 ====================
  mtXs: { marginTop: spacing.xs },
  mtSm: { marginTop: spacing.sm },
  mtMd: { marginTop: spacing.md },
  mtLg: { marginTop: spacing.lg },
  mtXl: { marginTop: spacing.xl },
  
  mbXs: { marginBottom: spacing.xs },
  mbSm: { marginBottom: spacing.sm },
  mbMd: { marginBottom: spacing.md },
  mbLg: { marginBottom: spacing.lg },
  mbXl: { marginBottom: spacing.xl },
  
  mlXs: { marginLeft: spacing.xs },
  mlSm: { marginLeft: spacing.sm },
  mlMd: { marginLeft: spacing.md },
  mlLg: { marginLeft: spacing.lg },
  mlXl: { marginLeft: spacing.xl },
  
  mrXs: { marginRight: spacing.xs },
  mrSm: { marginRight: spacing.sm },
  mrMd: { marginRight: spacing.md },
  mrLg: { marginRight: spacing.lg },
  mrXl: { marginRight: spacing.xl },
  
  mxXs: { marginHorizontal: spacing.xs },
  mxSm: { marginHorizontal: spacing.sm },
  mxMd: { marginHorizontal: spacing.md },
  mxLg: { marginHorizontal: spacing.lg },
  mxXl: { marginHorizontal: spacing.xl },
  
  myXs: { marginVertical: spacing.xs },
  mySm: { marginVertical: spacing.sm },
  myMd: { marginVertical: spacing.md },
  myLg: { marginVertical: spacing.lg },
  myXl: { marginVertical: spacing.xl },
  
  pXs: { padding: spacing.xs },
  pSm: { padding: spacing.sm },
  pMd: { padding: spacing.md },
  pLg: { padding: spacing.lg },
  pXl: { padding: spacing.xl },
  
  pxXs: { paddingHorizontal: spacing.xs },
  pxSm: { paddingHorizontal: spacing.sm },
  pxMd: { paddingHorizontal: spacing.md },
  pxLg: { paddingHorizontal: spacing.lg },
  pxXl: { paddingHorizontal: spacing.xl },
  
  pyXs: { paddingVertical: spacing.xs },
  pySm: { paddingVertical: spacing.sm },
  pyMd: { paddingVertical: spacing.md },
  pyLg: { paddingVertical: spacing.lg },
  pyXl: { paddingVertical: spacing.xl },
  
  // ==================== Flexbox ====================
  row: {
    flexDirection: 'row',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  justifyStart: {
    justifyContent: 'flex-start',
  },
  
  justifyCenter: {
    justifyContent: 'center',
  },
  
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  
  justifyBetween: {
    justifyContent: 'space-between',
  },
  
  justifyAround: {
    justifyContent: 'space-around',
  },
  
  alignStart: {
    alignItems: 'flex-start',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  alignEnd: {
    alignItems: 'flex-end',
  },
  
  flex1: {
    flex: 1,
  },
  
  flexWrap: {
    flexWrap: 'wrap',
  },
  
  // ==================== 状态 ====================
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  
  errorText: {
    color: colors.error.main,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  
  emptyText: {
    color: colors.gray[500],
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});

export default globalStyles;

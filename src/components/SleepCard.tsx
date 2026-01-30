/**
 * SleepTracker - SleepCard 组件
 * 展示昨晚/历史睡眠记录的高颜值卡片
 * 深蓝紫渐变风格
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Moon, Clock, Star, ChevronRight } from 'lucide-react-native';
import { SleepRecord } from '../types';
import { 
  formatDate, 
  formatTime, 
  formatDuration, 
  getRelativeDateText,
  getSleepQualityText,
  getSleepQualityColor,
} from '../utils/dateUtils';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== 属性定义 ====================

interface SleepCardProps {
  /** 睡眠记录数据 */
  record: SleepRecord;
  /** 点击回调 */
  onPress?: (record: SleepRecord) => void;
  /** 是否紧凑模式（用于列表） */
  compact?: boolean;
  /** 动画索引（用于列表交错动画） */
  index?: number;
}

// ==================== 组件实现 ====================

export const SleepCard: React.FC<SleepCardProps> = ({
  record,
  onPress,
  compact = false,
  index = 0,
}) => {
  // 计算睡眠质量颜色和图标
  const qualityColor = useMemo(() => getSleepQualityColor(record.quality), [record.quality]);
  const qualityText = useMemo(() => getSleepQualityText(record.quality), [record.quality]);
  
  // 格式化时间
  const dateText = useMemo(() => getRelativeDateText(record.bedTime), [record.bedTime]);
  const bedTimeText = useMemo(() => formatTime(record.bedTime), [record.bedTime]);
  const wakeTimeText = useMemo(() => formatTime(record.wakeTime), [record.wakeTime]);
  const durationText = useMemo(() => formatDuration(record.duration), [record.duration]);

  // 紧凑模式 - 用于历史列表
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={() => onPress?.(record)}
        activeOpacity={0.8}
      >
        {/* 左侧日期 */}
        <View style={styles.compactLeft}>
          <Text style={styles.compactDate}>{dateText}</Text>
          <Text style={styles.compactDay}>{formatDate(record.bedTime, 'MM/dd')}</Text>
        </View>

        {/* 中间时长 */}
        <View style={styles.compactCenter}>
          <Moon size={16} color={colors.primary[500]} />
          <Text style={styles.compactDuration}>{durationText}</Text>
        </View>

        {/* 右侧质量评分 */}
        <View style={[styles.compactRight, { backgroundColor: qualityColor + '20' }]}>
          <Text style={[styles.compactScore, { color: qualityColor }]}>
            {record.qualityScore}
          </Text>
        </View>

        <ChevronRight size={20} color={colors.gray[400]} style={styles.chevron} />
      </TouchableOpacity>
    );
  }

  // 完整卡片模式 - 用于首页展示
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(record)}
      activeOpacity={0.9}
    >
      {/* 渐变背景层 */}
      <View style={styles.gradientBackground}>
        {/* 装饰圆点 */}
        <View style={styles.decorationCircle1} />
        <View style={styles.decorationCircle2} />
      </View>

      {/* 内容层 */}
      <View style={styles.content}>
        {/* 头部：日期和质量标签 */}
        <View style={styles.header}>
          <View style={styles.dateBadge}>
            <Moon size={14} color="#FFFFFF" />
            <Text style={styles.dateText}>{dateText}的睡眠</Text>
          </View>
          
          <View style={[styles.qualityBadge, { backgroundColor: qualityColor }]}>
            <Star size={12} color="#FFFFFF" />
            <Text style={styles.qualityText}>{qualityText}</Text>
          </View>
        </View>

        {/* 核心数据：睡眠时长 */}
        <View style={styles.durationSection}>
          <Text style={styles.durationLabel}>睡眠时长</Text>
          <Text style={styles.durationValue}>{durationText}</Text>
          <View style={styles.durationBar}>
            <View 
              style={[
                styles.durationProgress, 
                { 
                  width: `${Math.min((record.duration / 600) * 100, 100)}%`,
                  backgroundColor: qualityColor,
                }
              ]} 
            />
          </View>
        </View>

        {/* 时间详情 */}
        <View style={styles.timeSection}>
          <View style={styles.timeItem}>
            <Clock size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.timeLabel}>入睡</Text>
            <Text style={styles.timeValue}>{bedTimeText}</Text>
          </View>
          
          <View style={styles.timeDivider} />
          
          <View style={styles.timeItem}>
            <Clock size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.timeLabel}>起床</Text>
            <Text style={styles.timeValue}>{wakeTimeText}</Text>
          </View>

          <View style={styles.timeDivider} />
          
          <View style={styles.timeItem}>
            <Star size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.timeLabel}>评分</Text>
            <Text style={styles.timeValue}>{record.qualityScore}/10</Text>
          </View>
        </View>

        {/* 标签展示 */}
        {record.tags.length > 0 && (
          <View style={styles.tagsSection}>
            {record.tags.slice(0, 3).map((tag, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagText}>{getTagLabel(tag)}</Text>
              </View>
            ))}
            {record.tags.length > 3 && (
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>+{record.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ==================== 辅助函数 ====================

/**
 * 获取标签显示文本
 */
const getTagLabel = (tag: string): string => {
  const tagMap: Record<string, string> = {
    caffeine: '咖啡因',
    alcohol: '酒精',
    exercise: '运动',
    stress: '压力',
    screen: '屏幕',
    late_meal: '夜宵',
    medication: '药物',
    noise: '噪音',
    temperature: '温度',
    travel: '旅行',
  };
  return tagMap[tag] || tag;
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  // 完整卡片样式
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.lg,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E1B4B', // 深蓝紫底色
  },
  decorationCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  decorationCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  content: {
    padding: spacing.xl,
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  qualityText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  durationSection: {
    marginBottom: spacing.lg,
  },
  durationLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  durationValue: {
    color: '#FFFFFF',
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  durationBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  durationProgress: {
    height: '100%',
    borderRadius: 3,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  timeValue: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  timeDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: fontSize.xs,
  },

  // 紧凑模式样式
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  compactLeft: {
    width: 60,
  },
  compactDate: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    fontWeight: '500',
  },
  compactDay: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    marginTop: spacing.xs,
  },
  compactCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactDuration: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[800],
    marginLeft: spacing.sm,
  },
  compactRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  compactScore: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: spacing.xs,
  },
});

export default SleepCard;

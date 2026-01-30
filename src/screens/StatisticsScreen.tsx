/**
 * SleepTracker - StatisticsScreen
 * 统计页面：周、月、季数据展示
 * 使用 react-native-chart-kit 实现多种图表
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  TrendingUp,
  Calendar,
  Moon,
  Star,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight,
  Target,
} from 'lucide-react-native';
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, parseISO } from 'date-fns';

// 组件
import { SleepTrendChart, SleepDurationChart, SleepQualityChart } from '../components';

// Hooks
import { useSleepRecords } from '../hooks';

// 工具
import { formatDuration, getWeekdayText, getSleepQualityColor, getSleepQualityText } from '../utils/dateUtils';

// 样式
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles';

// 类型
import { SleepRecord, StatisticsPeriod } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== 统计卡片组件 ====================

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon,
  color,
  delay = 0,
}) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
    </Animated.View>
  );
};

// ==================== 睡眠质量分布组件 ====================

interface QualityDistributionProps {
  records: SleepRecord[];
}

const QualityDistribution: React.FC<QualityDistributionProps> = ({ records }) => {
  const distribution = useMemo(() => {
    const result = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      terrible: 0,
    };
    
    records.forEach(record => {
      result[record.quality]++;
    });
    
    return result;
  }, [records]);

  const total = records.length;

  const items = [
    { key: 'excellent', label: '极佳', color: '#4CAF50' },
    { key: 'good', label: '良好', color: '#8BC34A' },
    { key: 'fair', label: '一般', color: '#FFC107' },
    { key: 'poor', label: '较差', color: '#FF9800' },
    { key: 'terrible', label: '糟糕', color: '#F44336' },
  ] as const;

  return (
    <View style={styles.distributionContainer}>
      <Text style={styles.distributionTitle}>质量分布</Text>
      <View style={styles.distributionGrid}>
        {items.map((item, index) => {
          const count = distribution[item.key];
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          
          return (
            <View key={item.key} style={styles.distributionItem}>
              <View
                style={[
                  styles.distributionBar,
                  { backgroundColor: item.color, opacity: count > 0 ? 1 : 0.3 },
                ]}
              >
                <Text style={styles.distributionCount}>{count}</Text>
              </View>
              <Text style={styles.distributionLabel}>{item.label}</Text>
              <Text style={styles.distributionPercent}>{percentage}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ==================== 主页面组件 ====================

export const StatisticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  // 状态
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<StatisticsPeriod>('week');
  const [currentOffset, setCurrentOffset] = useState(0);
  const [headerOpacity] = useState(new Animated.Value(0));

  // Hooks
  const { records, statistics, loadRecords, isLoading } = useSleepRecords();

  // 初始化
  useEffect(() => {
    loadRecords({ pagination: { page: 1, pageSize: 100 } });
    
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // 根据周期过滤记录
  const filteredRecords = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = subWeeks(now, 1 + currentOffset);
        break;
      case 'month':
        startDate = subMonths(now, 1 + currentOffset);
        break;
      case 'year':
        startDate = subMonths(now, 3 + currentOffset * 3); // 季度
        break;
      default:
        startDate = subWeeks(now, 1);
    }

    return records.filter(record => {
      const recordDate = parseISO(record.bedTime);
      return recordDate >= startDate && recordDate <= now;
    });
  }, [records, period, currentOffset]);

  // 计算统计数据
  const stats = useMemo(() => {
    if (filteredRecords.length === 0) {
      return {
        avgDuration: 0,
        avgQuality: 0,
        totalDays: 0,
        goalAchievement: 0,
        bestDay: null as SleepRecord | null,
      };
    }

    const totalDuration = filteredRecords.reduce((sum, r) => sum + r.duration, 0);
    const totalQuality = filteredRecords.reduce((sum, r) => sum + r.qualityScore, 0);
    const goalDays = filteredRecords.filter(r => r.duration >= 420).length;
    const bestDay = filteredRecords.reduce((best, current) =>
      current.qualityScore > best.qualityScore ? current : best
    );

    return {
      avgDuration: Math.round(totalDuration / filteredRecords.length),
      avgQuality: (totalQuality / filteredRecords.length).toFixed(1),
      totalDays: filteredRecords.length,
      goalAchievement: Math.round((goalDays / filteredRecords.length) * 100),
      bestDay,
    };
  }, [filteredRecords]);

  // 准备图表数据
  const chartData = useMemo(() => {
    const sorted = [...filteredRecords].sort(
      (a, b) => new Date(a.bedTime).getTime() - new Date(b.bedTime).getTime()
    );

    const labels = sorted.map(r => format(parseISO(r.bedTime), 'MM/dd'));
    const data = sorted.map(r => r.duration);

    // 如果数据太少，补充空数据
    while (labels.length < 7 && period === 'week') {
      labels.unshift('-');
      data.unshift(0);
    }

    return { labels, data };
  }, [filteredRecords, period]);

  // 日期范围显示
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    
    switch (period) {
      case 'week':
        start = subWeeks(now, 1);
        return `${format(start, 'MM/dd')} - ${format(now, 'MM/dd')}`;
      case 'month':
        start = subMonths(now, 1);
        return `${format(start, 'MM/dd')} - ${format(now, 'MM/dd')}`;
      case 'year':
        return `${format(now, 'yyyy')}年`;
      default:
        return '';
    }
  }, [period]);

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecords({ pagination: { page: 1, pageSize: 100 } });
    setRefreshing(false);
  }, []);

  // 周期切换
  const handlePeriodChange = useCallback((newPeriod: 'week' | 'month' | 'quarter') => {
    const periodMap: Record<string, StatisticsPeriod> = {
      week: 'week',
      month: 'month',
      quarter: 'year',
    };
    setPeriod(periodMap[newPeriod]);
    setCurrentOffset(0);
  }, []);

  // 导航
  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentOffset(prev => direction === 'prev' ? prev + 1 : Math.max(0, prev - 1));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 头部 */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerOpacity },
        ]}
      >
        <View>
          <Text style={styles.headerTitle}>睡眠统计</Text>
          <Text style={styles.headerSubtitle}>{dateRange}</Text>
        </View>
        <View style={styles.headerIcon}>
          <TrendingUp size={24} color={colors.primary[500]} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 统计概览卡片 */}
        <View style={styles.statsGrid}>
          <StatCard
            title="平均睡眠"
            value={formatDuration(stats.avgDuration)}
            subValue={`${stats.totalDays}天记录`}
            icon={<Clock size={20} color={colors.primary[500]} />}
            color={colors.primary[500]}
            delay={0}
          />
          <StatCard
            title="平均质量"
            value={stats.avgQuality}
            subValue="满分10分"
            icon={<Star size={20} color={colors.warning.main} />}
            color={colors.warning.main}
            delay={100}
          />
          <StatCard
            title="目标达成"
            value={`${stats.goalAchievement}%`}
            subValue="7小时以上"
            icon={<Target size={20} color={colors.success.main} />}
            color={colors.success.main}
            delay={200}
          />
          <StatCard
            title="记录天数"
            value={`${stats.totalDays}`}
            subValue="天"
            icon={<Calendar size={20} color={colors.secondary[500]} />}
            color={colors.secondary[500]}
            delay={300}
          />
        </View>

        {/* 趋势图表 */}
        {filteredRecords.length > 0 ? (
          <>
            <SleepTrendChart
              title="睡眠趋势"
              subtitle="时长变化曲线"
              labels={chartData.labels}
              data={chartData.data}
              currentPeriod={period === 'week' ? 'week' : period === 'month' ? 'month' : 'quarter'}
              onPeriodChange={handlePeriodChange}
              dateRange={dateRange}
            />

            {/* 质量分布 */}
            <QualityDistribution records={filteredRecords} />

            {/* 最佳记录 */}
            {stats.bestDay && (
              <View style={styles.bestDayContainer}>
                <Text style={styles.bestDayTitle}>🏆 最佳记录</Text>
                <View style={styles.bestDayCard}>
                  <View style={styles.bestDayHeader}>
                    <Moon size={20} color={colors.primary[500]} />
                    <Text style={styles.bestDayDate}>
                      {format(parseISO(stats.bestDay.bedTime), 'M月d日')}
                    </Text>
                  </View>
                  <View style={styles.bestDayStats}>
                    <View style={styles.bestDayStat}>
                      <Text style={styles.bestDayValue}>
                        {formatDuration(stats.bestDay.duration)}
                      </Text>
                      <Text style={styles.bestDayLabel}>睡眠时长</Text>
                    </View>
                    <View style={styles.bestDayDivider} />
                    <View style={styles.bestDayStat}>
                      <Text style={[styles.bestDayValue, { color: getSleepQualityColor(stats.bestDay.quality) }]}>
                        {stats.bestDay.qualityScore}
                      </Text>
                      <Text style={styles.bestDayLabel}>
                        {getSleepQualityText(stats.bestDay.quality)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Activity size={48} color={colors.gray[300]} />
            </View>
            <Text style={styles.emptyTitle}>暂无数据</Text>
            <Text style={styles.emptyText}>开始记录睡眠，查看您的睡眠统计</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.gray[800],
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    marginRight: spacing.md,
    ...shadows.sm,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statTitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statSubValue: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
  },
  distributionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  distributionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.lg,
  },
  distributionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distributionItem: {
    alignItems: 'center',
    flex: 1,
  },
  distributionBar: {
    width: 36,
    height: 60,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  distributionCount: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  distributionLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  distributionPercent: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[800],
  },
  bestDayContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  bestDayTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  bestDayCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  bestDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bestDayDate: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
  bestDayStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestDayStat: {
    flex: 1,
    alignItems: 'center',
  },
  bestDayDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  bestDayValue: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  bestDayLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    marginHorizontal: spacing.lg,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
});

export default StatisticsScreen;

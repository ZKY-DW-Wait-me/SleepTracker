/**
 * SleepTracker - HomeScreen
 * 首页：睡眠概览、进度圆环、快捷记录、趋势图
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Moon,
  Plus,
  TrendingUp,
  Calendar,
  ChevronRight,
  BedDouble,
  AlarmClock,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { format, subDays, parseISO } from 'date-fns';

// 组件
import { SleepCard, GradientButton } from '../components';

// Hooks
import { useSleepRecords } from '../hooks';

// 工具
import { formatDuration, getWeekdayText } from '../utils/dateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 样式
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles';

// 类型
import { SleepRecord } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// AsyncStorage key
const STORAGE_KEY = 'sleepRecords';

// ==================== 环形进度组件 ====================

interface CircularProgressProps {
  /** 当前值（分钟） */
  value: number;
  /** 目标值（分钟） */
  goal: number;
  /** 尺寸 */
  size?: number;
  /** 线条宽度 */
  strokeWidth?: number;
  /** 动画持续时间 */
  duration?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  goal,
  size = 200,
  strokeWidth = 20,
  duration = 1000,
}) => {
  const animatedValue = useState(new Animated.Value(0))[0];
  const [displayValue, setDisplayValue] = useState(0);

  // 计算进度（最大100%）
  const progress = Math.min(value / goal, 1);
  const percentage = Math.round(progress * 100);

  // 圆的参数
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    // 动画 - 使用原生驱动
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();

    // 数字动画
    let current = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, goal]);

  const hours = Math.floor(displayValue / 60);
  const minutes = displayValue % 60;

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      {/* 背景圆环 */}
      <View style={styles.circularBackground}>
        {/* SVG 模拟 */}
        <View
          style={[
            styles.circularTrack,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'rgba(99, 102, 241, 0.15)',
            },
          ]}
        />
        
        {/* 进度圆环 - 使用渐变效果 */}
        <Animated.View
          style={[
            styles.circularProgress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: colors.primary[500],
              borderTopColor: colors.secondary[400],
              borderRightColor: colors.secondary[500],
              transform: [
                { rotate: '-90deg' },
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${progress * 360}deg`],
                  }) as any,
                },
              ],
            },
          ]}
        />
      </View>

      {/* 中心内容 */}
      <View style={styles.circularContent}>
        <Moon size={24} color={colors.primary[500]} />
        <Text style={styles.circularHours}>{hours}</Text>
        <Text style={styles.circularUnit}>小时 {minutes} 分钟</Text>
        <View style={styles.circularGoal}>
          <Text style={styles.circularGoalText}>目标 {Math.round(goal / 60)}h</Text>
        </View>
      </View>
    </View>
  );
};

// ==================== 快捷统计项组件 ====================

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color?: string;
  delay?: number;
}

const StatItem: React.FC<StatItemProps> = ({
  icon,
  label,
  value,
  subValue,
  color = colors.primary[500],
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
        styles.statItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
    </Animated.View>
  );
};

// ==================== 小趋势图组件 ====================

interface MiniTrendChartProps {
  data: number[];
  labels: string[];
}

const MiniTrendChart: React.FC<MiniTrendChartProps> = ({ data, labels }) => {
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  return (
    <View style={styles.miniChartContainer}>
      <Text style={styles.miniChartTitle}>最近7天趋势</Text>
      <View style={styles.miniChartContent}>
        {data.map((value, index) => {
          const height = ((value - minValue) / range) * 60 + 20;
          const isGoalMet = value >= 420; // 7小时目标
          
          return (
            <View key={index} style={styles.miniBarContainer}>
              <View
                style={[
                  styles.miniBar,
                  {
                    height,
                    backgroundColor: isGoalMet ? colors.success.main : colors.warning.main,
                  },
                ]}
              />
              <Text style={styles.miniBarLabel}>{labels[index]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ==================== 主页面组件 ====================

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 状态
  const [refreshing, setRefreshing] = useState(false);
  const [headerOpacity] = useState(new Animated.Value(1));
  
  // 本地状态（替代 useSleepRecords 的数据）
  const [todayRecord, setTodayRecord] = useState<SleepRecord | null>(null);
  const [records, setRecords] = useState<SleepRecord[]>([]);

  // 从 AsyncStorage 直接读取今日数据
  const loadTodayData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allRecords: SleepRecord[] = JSON.parse(stored);
        
        // 按时间倒序排列
        const sorted = allRecords.sort((a, b) => 
          new Date(b.bedTime).getTime() - new Date(a.bedTime).getTime()
        );
        
        setRecords(sorted);
        
        // 查找今日记录（bedTime 是今天的）
        const today = new Date().toDateString();
        const foundToday = sorted.find(r => 
          new Date(r.bedTime).toDateString() === today
        );
        
        setTodayRecord(foundToday || null);
        console.log('[DEBUG] HomeScreen loaded, todayRecord:', foundToday ? 'found' : 'none');
      } else {
        setRecords([]);
        setTodayRecord(null);
      }
    } catch (error) {
      console.error('[ERROR] Failed to load today data:', error);
    }
  }, []);

  // 使用 useFocusEffect 确保每次进入页面都强制刷新数据
  useFocusEffect(
    useCallback(() => {
      console.log('[DEBUG] HomeScreen focused, reloading data...');
      loadTodayData();
      
      // 头部动画
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      return () => {
        // 清理工作（如果需要）
      };
    }, [loadTodayData])
  );

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTodayData();
    setRefreshing(false);
  }, [loadTodayData]);

  // 获取昨晚记录（非今天的第一条）
  const lastNightRecord = useMemo(() => {
    const today = new Date().toDateString();
    return records.find(r => new Date(r.bedTime).toDateString() !== today);
  }, [records]);

  // 准备趋势图数据
  const trendData = useMemo(() => {
    const last7Days = records.slice(0, 7);
    const data = last7Days.map(r => r.duration);
    const labels = last7Days.map(r => format(parseISO(r.bedTime), 'MM/dd'));
    
    // 补足7天
    while (data.length < 7) {
      data.push(0);
      labels.push('-');
    }
    
    return { data: data.slice(0, 7).reverse(), labels: labels.slice(0, 7).reverse() };
  }, [records]);

  // 平均睡眠时长
  const avgDuration = useMemo(() => {
    if (records.length === 0) return 0;
    return Math.round(records.reduce((sum, r) => sum + r.duration, 0) / records.length);
  }, [records]);

  // 连续达标天数
  const streakDays = useMemo(() => {
    let streak = 0;
    for (const record of records) {
      if (record.duration >= 420 && record.qualityScore >= 6) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [records]);

  // 导航到添加记录
  const handleAddRecord = useCallback(() => {
    // @ts-ignore
    navigation.navigate('MainTabs', { screen: 'Add' });
  }, [navigation]);

  // 查看记录详情
  const handleViewRecord = useCallback((record: SleepRecord) => {
    // @ts-ignore
    navigation.navigate('SleepDetail', { recordId: record.id });
  }, [navigation]);

  // 查看统计
  const handleViewStats = useCallback(() => {
    // @ts-ignore
    navigation.navigate('MainTabs', { screen: 'Statistics' });
  }, [navigation]);

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
          <Text style={styles.greeting}>晚上好</Text>
          <Text style={styles.date}>
            {format(new Date(), 'M月d日')} {getWeekdayText(new Date().toISOString())}
          </Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileText}>👤</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 今日睡眠进度圆环 */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>今日睡眠</Text>
          
          {todayRecord ? (
            <View style={styles.progressContainer}>
              <CircularProgress
                value={todayRecord.duration}
                goal={480} // 8小时目标
                size={220}
                strokeWidth={18}
              />
            </View>
          ) : (
            <View style={styles.noRecordContainer}>
              <View style={styles.noRecordIcon}>
                <Moon size={40} color={colors.primary[300]} />
              </View>
              <Text style={styles.noRecordTitle}>今晚还未记录</Text>
              <Text style={styles.noRecordSubtext}>点击下方按钮开始记录</Text>
            </View>
          )}
        </View>

        {/* 快捷操作按钮 */}
        <View style={styles.actionSection}>
          <GradientButton
            title={todayRecord ? '更新今日记录' : '记录今晚睡眠'}
            onPress={handleAddRecord}
            leftIcon={<Plus size={20} color="#FFFFFF" />}
          />
        </View>

        {/* 快捷统计 */}
        <View style={styles.statsSection}>
          <StatItem
            icon={<BedDouble size={20} color={colors.primary[500]} />}
            label="平均睡眠"
            value={formatDuration(avgDuration)}
            subValue="近7天"
            color={colors.primary[500]}
            delay={100}
          />
          <StatItem
            icon={<TrendingUp size={20} color={colors.success.main} />}
            label="连续达标"
            value={`${streakDays}天`}
            subValue="目标达成"
            color={colors.success.main}
            delay={200}
          />
          <StatItem
            icon={<Calendar size={20} color={colors.secondary[500]} />}
            label="记录天数"
            value={`${records.length}天`}
            subValue="累计记录"
            color={colors.secondary[500]}
            delay={300}
          />
        </View>

        {/* 昨晚睡眠卡片 */}
        {lastNightRecord && (
          <View style={styles.cardSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>昨晚睡眠</Text>
              <TouchableOpacity onPress={handleViewStats}>
                <Text style={styles.seeAll}>查看全部</Text>
              </TouchableOpacity>
            </View>
            <SleepCard
              record={lastNightRecord}
              onPress={handleViewRecord}
            />
          </View>
        )}

        {/* 最近7天趋势 */}
        {records.length > 1 && (
          <View style={styles.trendSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>睡眠趋势</Text>
              <TouchableOpacity onPress={handleViewStats}>
                <ChevronRight size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
            <MiniTrendChart data={trendData.data} labels={trendData.labels} />
          </View>
        )}

        {/* 睡眠小贴士 */}
        <View style={styles.tipSection}>
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <AlarmClock size={24} color={colors.warning.main} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>睡眠小贴士</Text>
              <Text style={styles.tipText}>
                保持规律的作息时间有助于提高睡眠质量，建议每天同一时间上床和起床。
              </Text>
            </View>
          </View>
        </View>
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
  greeting: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.gray[800],
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularBackground: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularTrack: {
    position: 'absolute',
  },
  circularProgress: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  circularContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularHours: {
    fontSize: fontSize['5xl'],
    fontWeight: '700',
    color: colors.gray[800],
    marginTop: spacing.xs,
  },
  circularUnit: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  circularGoal: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  circularGoalText: {
    fontSize: fontSize.xs,
    color: colors.primary[600],
    fontWeight: '500',
  },
  noRecordContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noRecordIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noRecordTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  noRecordSubtext: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  actionSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    ...shadows.sm,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  statSubValue: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    marginTop: spacing.xs,
  },
  cardSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.primary[500],
    fontWeight: '500',
  },
  trendSection: {
    marginBottom: spacing.xl,
  },
  miniChartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  miniChartTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
  miniChartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  miniBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  miniBar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  miniBarLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    marginTop: spacing.xs,
  },
  tipSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.warning.light + '20',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning.main,
  },
  tipIcon: {
    marginRight: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
});

export default HomeScreen;

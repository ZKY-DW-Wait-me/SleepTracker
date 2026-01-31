/**
 * SleepTracker - HomeScreen
 * 首页：睡眠概览、进度圆环、快捷记录、趋势图
 * 
 * 全量重构：修复统计数据计算逻辑
 */

import React, { useState, useCallback, useMemo } from 'react';
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
import { format, parseISO } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 组件
import { SleepCard, GradientButton } from '../components';

// 工具
import { formatDuration, getWeekdayText } from '../utils/dateUtils';

// 样式
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles';

// 类型
import { SleepRecord } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// AsyncStorage key
const STORAGE_KEY = 'sleepRecords';

// ==================== 环形进度组件 ====================

interface CircularProgressProps {
  value: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  goal,
  size = 200,
  strokeWidth = 20,
}) => {
  const progress = Math.min(value / goal, 1);
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      {/* 背景圆环 */}
      <View
        style={[
          styles.circularTrack,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          },
        ]}
      />
      
      {/* 进度圆环 */}
      <View
        style={[
          styles.circularProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      />

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
}

const StatItem: React.FC<StatItemProps> = ({
  icon,
  label,
  value,
  subValue,
  color = colors.primary[500],
}) => {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
    </View>
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
          const isGoalMet = value >= 420;
          
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
  
  // 核心状态
  const [allRecords, setAllRecords] = useState<SleepRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<SleepRecord | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sleepGoal] = useState(480); // 8小时目标

  // ========== 核心数据读取与计算逻辑（重写）==========
  const loadData = useCallback(async () => {
    try {
      console.log('[DEBUG] HomeScreen: Loading data...');
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const records = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      console.log('[DEBUG] HomeScreen: Total records loaded:', records.length);
      
      // 保存所有记录
      setAllRecords(records);
      
      // 查找今日记录
      const today = new Date().toDateString();
      const foundToday = records.find((r: SleepRecord) => 
        new Date(r.bedTime || r.startTime).toDateString() === today
      );
      setTodayRecord(foundToday || null);
      
      console.log('[DEBUG] HomeScreen: Today record:', foundToday ? 'found' : 'none');
    } catch (e) {
      console.error('[ERROR] HomeScreen: Failed to load data:', e);
      setAllRecords([]);
      setTodayRecord(null);
    }
  }, []);

  // 使用 useFocusEffect 确保每次进入页面都刷新
  useFocusEffect(
    useCallback(() => {
      console.log('[DEBUG] HomeScreen: Screen focused, reloading...');
      loadData();
    }, [loadData])
  );

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // ========== 统计数据计算（基于所有历史记录）==========
  
  // 记录天数 = 所有记录的数量
  const recordCount = allRecords.length;
  
  // 平均睡眠时长 = 所有记录时长总和 / 记录条数
  const avgDuration = useMemo(() => {
    if (allRecords.length === 0) return 0;
    const total = allRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
    return Math.round(total / allRecords.length);
  }, [allRecords]);
  
  // 连续达标天数
  const streakDays = useMemo(() => {
    let streak = 0;
    for (const record of allRecords) {
      if ((record.duration || 0) >= 420 && (record.qualityScore || 0) >= 6) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [allRecords]);

  // 获取昨晚记录（非今天的第一条）
  const lastNightRecord = useMemo(() => {
    const today = new Date().toDateString();
    return allRecords.find(r => 
      new Date(r.bedTime || r.startTime).toDateString() !== today
    );
  }, [allRecords]);

  // 准备趋势图数据
  const trendData = useMemo(() => {
    const last7Days = allRecords.slice(0, 7);
    const data = last7Days.map(r => r.duration || 0);
    const labels = last7Days.map(r => 
      format(parseISO(r.bedTime || r.startTime), 'MM/dd')
    );
    
    while (data.length < 7) {
      data.push(0);
      labels.push('-');
    }
    
    return { 
      data: data.slice(0, 7).reverse(), 
      labels: labels.slice(0, 7).reverse() 
    };
  }, [allRecords]);

  // ========== 导航处理 ==========
  const handleAddRecord = useCallback(() => {
    // @ts-ignore
    navigation.navigate('MainTabs', { screen: 'Add' });
  }, [navigation]);

  const handleViewRecord = useCallback((record: SleepRecord) => {
    // @ts-ignore
    navigation.navigate('SleepDetail', { recordId: record.id });
  }, [navigation]);

  const handleViewStats = useCallback(() => {
    // @ts-ignore
    navigation.navigate('MainTabs', { screen: 'Statistics' });
  }, [navigation]);

  // ========== 调试输出 ==========
  console.log('[DEBUG] HomeScreen: Rendering with recordCount:', recordCount);
  console.log('[DEBUG] HomeScreen: avgDuration:', avgDuration);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 头部 */}
      <View style={styles.header}>
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
      </View>

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
                value={todayRecord.duration || 0}
                goal={sleepGoal}
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

        {/* 快捷统计 - 基于所有历史记录 */}
        <View style={styles.statsSection}>
          <StatItem
            icon={<BedDouble size={20} color={colors.primary[500]} />}
            label="平均睡眠"
            value={formatDuration(avgDuration)}
            subValue="所有记录"
            color={colors.primary[500]}
          />
          <StatItem
            icon={<TrendingUp size={20} color={colors.success.main} />}
            label="连续达标"
            value={`${streakDays}天`}
            subValue="目标达成"
            color={colors.success.main}
          />
          <StatItem
            icon={<Calendar size={20} color={colors.secondary[500]} />}
            label="记录天数"
            value={`${recordCount}天`}
            subValue="累计记录"
            color={colors.secondary[500]}
          />
        </View>

        {/* 昨晚睡眠卡片 */}
        {lastNightRecord && (
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
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
        {allRecords.length > 1 && (
          <View style={styles.trendSection}>
            <View style={styles.sectionHeaderRow}>
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
  circularTrack: {
    position: 'absolute',
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  circularProgress: {
    position: 'absolute',
    borderColor: colors.primary[500],
    borderTopColor: colors.secondary[400],
    borderRightColor: colors.secondary[500],
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
  sectionHeaderRow: {
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
    backgroundColor: (colors.warning.light + '20') as string,
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

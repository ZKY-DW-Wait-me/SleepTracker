/**
 * SleepTracker - ChartWrapper 组件
 * 封装图表基础样式，统一图表外观
 * 深蓝紫渐变风格
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ContributionGraph,
} from 'react-native-chart-kit';
import { TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '../styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CHART_HEIGHT = 220;

// ==================== 属性定义 ====================

interface ChartWrapperProps {
  /** 图表标题 */
  title: string;
  /** 副标题/说明 */
  subtitle?: string;
  /** 图表类型 */
  type: 'line' | 'bar' | 'pie' | 'heatmap';
  /** 图表数据 */
  data: any;
  /** 周期切换回调 */
  onPeriodChange?: (period: 'week' | 'month' | 'quarter') => void;
  /** 当前周期 */
  currentPeriod?: 'week' | 'month' | 'quarter';
  /** 左右切换回调 */
  onNavigate?: (direction: 'prev' | 'next') => void;
  /** 日期范围显示 */
  dateRange?: string;
  /** 自定义图表配置 */
  chartConfig?: any;
}

// ==================== 默认图表配置 ====================

const getDefaultChartConfig = (isDark = false) => ({
  backgroundColor: 'transparent',
  backgroundGradientFrom: isDark ? '#1E1B4B' : '#FFFFFF',
  backgroundGradientTo: isDark ? '#1E1B4B' : '#FFFFFF',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`, // 靛紫色
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  style: {
    borderRadius: borderRadius.lg,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#6366F1',
  },
  propsForLabels: {
    fontSize: 10,
  },
  propsForBackgroundLines: {
    stroke: 'rgba(148, 163, 184, 0.2)',
    strokeWidth: 1,
  },
});

// ==================== 主组件 ====================

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  type,
  data,
  onPeriodChange,
  currentPeriod = 'week',
  onNavigate,
  dateRange,
  chartConfig,
}) => {
  // 合并配置
  const finalChartConfig = useMemo(() => {
    return { ...getDefaultChartConfig(), ...chartConfig };
  }, [chartConfig]);

  // 周期选项
  const periods = [
    { key: 'week' as const, label: '周' },
    { key: 'month' as const, label: '月' },
    { key: 'quarter' as const, label: '季' },
  ];

  // 渲染图表
  const renderChart = () => {
    const commonProps = {
      data,
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      chartConfig: finalChartConfig,
      bezier: type === 'line',
      style: styles.chart,
      withInnerLines: true,
      withOuterLines: false,
      fromZero: true,
    };

    switch (type) {
      case 'line':
        return (
          <LineChart
            {...commonProps}
            withDots={true}
            withShadow={true}
            segments={5}
          />
        );
      
      case 'bar':
        return (
          <BarChart
            {...commonProps}
            showBarTops={true}
            withCustomBarColorFromData={true}
            flatColor={false}
          />
        );
      
      case 'pie':
        return (
          <PieChart
            data={data}
            width={CHART_WIDTH}
            height={CHART_HEIGHT - 40}
            chartConfig={finalChartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        );
      
      case 'heatmap':
        return (
          <ContributionGraph
            values={data}
            endDate={new Date()}
            numDays={105}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            chartConfig={{
              ...finalChartConfig,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* 头部区域 */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <TrendingUp size={20} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        {/* 周期切换 */}
        {onPeriodChange && (
          <View style={styles.periodContainer}>
            {periods.map(period => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  currentPeriod === period.key && styles.periodButtonActive,
                ]}
                onPress={() => onPeriodChange(period.key)}
              >
                <Text
                  style={[
                    styles.periodText,
                    currentPeriod === period.key && styles.periodTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 日期导航 */}
      {(onNavigate || dateRange) && (
        <View style={styles.navigation}>
          {onNavigate && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => onNavigate('prev')}
            >
              <ChevronLeft size={20} color={colors.gray[500]} />
            </TouchableOpacity>
          )}
          
          {dateRange && (
            <View style={styles.dateRangeContainer}>
              <Calendar size={14} color={colors.gray[500]} />
              <Text style={styles.dateRangeText}>{dateRange}</Text>
            </View>
          )}
          
          {onNavigate && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => onNavigate('next')}
            >
              <ChevronRight size={20} color={colors.gray[500]} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 图表区域 */}
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {/* 底部装饰线 */}
      <View style={styles.bottomLine} />
    </View>
  );
};

// ==================== 快捷组件 ====================

/**
 * 睡眠趋势图（折线图）
 */
export const SleepTrendChart: React.FC<
  Omit<ChartWrapperProps, 'type' | 'data'> & {
    labels: string[];
    data: number[];
  }
> = ({ labels, data, ...props }) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  return <ChartWrapper type="line" data={chartData} {...props} />;
};

/**
 * 睡眠时长分布图（柱状图）
 */
export const SleepDurationChart: React.FC<
  Omit<ChartWrapperProps, 'type' | 'data'> & {
    labels: string[];
    data: number[];
  }
> = ({ labels, data, ...props }) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        colors: data.map(value => {
          // 根据时长返回不同颜色
          if (value >= 480) return colors.success.main; // 8小时以上
          if (value >= 360) return colors.warning.main; // 6-8小时
          return colors.error.main; // 6小时以下
        }),
      },
    ],
  };

  return <ChartWrapper type="bar" data={chartData} {...props} />;
};

/**
 * 睡眠质量分布图（饼图）
 */
export const SleepQualityChart: React.FC<
  Omit<ChartWrapperProps, 'type' | 'data'> & {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    terrible: number;
  }
> = ({ excellent, good, fair, poor, terrible, ...props }) => {
  const chartData = [
    {
      name: '极佳',
      population: excellent,
      color: '#4CAF50',
      legendFontColor: colors.gray[600],
      legendFontSize: 12,
    },
    {
      name: '良好',
      population: good,
      color: '#8BC34A',
      legendFontColor: colors.gray[600],
      legendFontSize: 12,
    },
    {
      name: '一般',
      population: fair,
      color: '#FFC107',
      legendFontColor: colors.gray[600],
      legendFontSize: 12,
    },
    {
      name: '较差',
      population: poor,
      color: '#FF9800',
      legendFontColor: colors.gray[600],
      legendFontSize: 12,
    },
    {
      name: '糟糕',
      population: terrible,
      color: '#F44336',
      legendFontColor: colors.gray[600],
      legendFontSize: 12,
    },
  ].filter(item => item.population > 0);

  return <ChartWrapper type="pie" data={chartData} {...props} />;
};

/**
 * 睡眠热力图
 */
export const SleepHeatmap: React.FC<
  Omit<ChartWrapperProps, 'type' | 'data'> & {
    data: Array<{ date: string; count: number }>;
  }
> = ({ data, ...props }) => {
  return <ChartWrapper type="heatmap" data={data} {...props} />;
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[800],
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontWeight: '500',
  },
  periodTextActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  navButton: {
    padding: spacing.sm,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
  },
  dateRangeText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginLeft: spacing.xs,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    borderRadius: borderRadius.lg,
    paddingRight: spacing.md,
  },
  bottomLine: {
    height: 3,
    backgroundColor: colors.primary[500],
    borderRadius: 2,
    marginTop: spacing.md,
    marginHorizontal: spacing.xl,
    opacity: 0.3,
  },
});

export default ChartWrapper;

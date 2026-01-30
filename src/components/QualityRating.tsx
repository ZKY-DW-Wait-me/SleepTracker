/**
 * SleepTracker - QualityRating 组件
 * 滑动评分组件，用于睡眠质量评分
 * 深蓝紫渐变风格，带霓虹效果
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { Star, Frown, Meh, Smile, Laugh } from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '../styles';
import { getSleepQualityFromScore, getSleepQualityText, getSleepQualityColor } from '../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - spacing.lg * 4;
const STEP_WIDTH = SLIDER_WIDTH / 10;

// ==================== 属性定义 ====================

interface QualityRatingProps {
  /** 当前评分值 (1-10) */
  value: number;
  /** 评分变化回调 */
  onValueChange: (value: number) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 尺寸：small | medium | large */
  size?: 'small' | 'medium' | 'large';
  /** 是否显示标签 */
  showLabel?: boolean;
}

// ==================== 表情图标组件 ====================

const MoodIcon: React.FC<{ score: number; size: number }> = ({ score, size }) => {
  if (score <= 3) return <Frown size={size} color={getSleepQualityColor('terrible')} />;
  if (score <= 5) return <Meh size={size} color={getSleepQualityColor('poor')} />;
  if (score <= 7) return <Smile size={size} color={getSleepQualityColor('fair')} />;
  if (score <= 9) return <Smile size={size} color={getSleepQualityColor('good')} />;
  return <Laugh size={size} color={getSleepQualityColor('excellent')} />;
};

// ==================== 主组件 ====================

export const QualityRating: React.FC<QualityRatingProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'medium',
  showLabel = true,
}) => {
  // 动画值
  const [animatedValue] = useState(new Animated.Value(value));
  const [currentValue, setCurrentValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  
  // 计算尺寸
  const sizes = {
    small: { slider: 150, thumb: 20, icon: 16, font: fontSize.sm },
    medium: { slider: SLIDER_WIDTH, thumb: 28, icon: 32, font: fontSize.xl },
    large: { slider: SLIDER_WIDTH, thumb: 36, icon: 48, font: fontSize['3xl'] },
  }[size];

  // 更新内部值
  useEffect(() => {
    setCurrentValue(value);
    animatedValue.setValue(value);
  }, [value]);

  // 计算步进值
  const calculateStep = useCallback((x: number): number => {
    const stepWidth = sizes.slider / 10;
    const step = Math.round(x / stepWidth);
    return Math.max(1, Math.min(10, step));
  }, [sizes.slider]);

  // 手势响应器
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      
      onPanResponderGrant: () => {
        setIsDragging(true);
        // 触摸反馈动画
        Animated.spring(animatedValue, {
          toValue: currentValue,
          friction: 5,
          tension: 40,
          useNativeDriver: false,
        }).start();
      },
      
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        const newValue = calculateStep(gestureState.moveX - spacing.lg * 2);
        if (newValue !== currentValue) {
          setCurrentValue(newValue);
          animatedValue.setValue(newValue);
          onValueChange(newValue);
        }
      },
      
      onPanResponderRelease: () => {
        setIsDragging(false);
        // 吸附到最近的整数
        const finalValue = Math.round(currentValue);
        setCurrentValue(finalValue);
        onValueChange(finalValue);
      },
    })
  ).current;

  // 获取当前质量信息
  const quality = getSleepQualityFromScore(currentValue);
  const qualityText = getSleepQualityText(quality);
  const qualityColor = getSleepQualityColor(quality);

  // 计算滑块位置
  const thumbPosition = animatedValue.interpolate({
    inputRange: [1, 10],
    outputRange: [0, sizes.slider - sizes.thumb],
    extrapolate: 'clamp',
  });

  // 计算发光强度
  const glowOpacity = animatedValue.interpolate({
    inputRange: [1, 10],
    outputRange: [0.3, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* 标签区域 */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>睡眠质量评分</Text>
          <View style={[styles.qualityBadge, { backgroundColor: qualityColor + '20' }]}>
            <MoodIcon score={currentValue} size={16} />
            <Text style={[styles.qualityText, { color: qualityColor }]}>
              {qualityText}
            </Text>
          </View>
        </View>
      )}

      {/* 分数显示 */}
      <View style={styles.scoreContainer}>
        <Animated.View
          style={[
            styles.scoreCircle,
            {
              width: sizes.icon + 24,
              height: sizes.icon + 24,
              borderRadius: (sizes.icon + 24) / 2,
              borderColor: qualityColor,
              shadowColor: qualityColor,
              shadowOpacity: isDragging ? 0.8 : 0.4,
            },
          ]}
        >
          <MoodIcon score={currentValue} size={sizes.icon} />
        </Animated.View>
        
        <View style={styles.scoreTextContainer}>
          <Animated.Text
            style={[
              styles.scoreValue,
              { fontSize: sizes.font, color: qualityColor },
            ]}
          >
            {currentValue}
          </Animated.Text>
          <Text style={styles.scoreMax}>/10</Text>
        </View>
      </View>

      {/* 滑块区域 */}
      <View 
        style={[styles.sliderContainer, { width: sizes.slider }]}
        {...panResponder.panHandlers}
      >
        {/* 背景轨道 */}
        <View style={styles.track}>
          {/* 进度填充 */}
          <Animated.View
            style={[
              styles.progress,
              {
                width: animatedValue.interpolate({
                  inputRange: [1, 10],
                  outputRange: ['10%', '100%'],
                }),
                backgroundColor: qualityColor,
              },
            ]}
          />
        </View>

        {/* 刻度标记 */}
        <View style={styles.ticksContainer}>
          {[...Array(10)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.tick,
                {
                  backgroundColor: index < currentValue ? qualityColor : colors.gray[300],
                },
              ]}
            />
          ))}
        </View>

        {/* 滑块拇指 */}
        <Animated.View
          style={[
            styles.thumb,
            {
              width: sizes.thumb,
              height: sizes.thumb,
              borderRadius: sizes.thumb / 2,
              left: thumbPosition,
              backgroundColor: qualityColor,
              shadowColor: qualityColor,
              shadowOpacity: isDragging ? 0.9 : 0.5,
              transform: [{ scale: isDragging ? 1.2 : 1 }],
            },
          ]}
        >
          <Star size={sizes.thumb * 0.5} color="#FFFFFF" fill="#FFFFFF" />
        </Animated.View>
      </View>

      {/* 描述文本 */}
      {showLabel && (
        <Text style={styles.description}>
          {getScoreDescription(currentValue)}
        </Text>
      )}
    </View>
  );
};

// ==================== 辅助函数 ====================

/**
 * 获取评分描述文本
 */
const getScoreDescription = (score: number): string => {
  if (score <= 3) return '睡眠质量很差，建议调整作息习惯';
  if (score <= 5) return '睡眠质量不佳，需要注意改善';
  if (score <= 7) return '睡眠质量一般，还有提升空间';
  if (score <= 9) return '睡眠质量良好，继续保持';
  return '睡眠质量极佳，完美的一晚！';
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[800],
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  qualityText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: spacing.md,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
  },
  scoreTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: fontSize.lg,
    color: colors.gray[400],
    marginLeft: spacing.xs,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  ticksContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  tick: {
    width: 2,
    height: 4,
    borderRadius: 1,
    opacity: 0.5,
  },
  thumb: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    top: 6,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});

export default QualityRating;

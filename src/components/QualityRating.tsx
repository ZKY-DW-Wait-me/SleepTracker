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
  PanResponderGestureState,
} from 'react-native';
import { Star, Frown, Meh, Smile, Laugh } from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '../styles';
import { getSleepQualityFromScore, getSleepQualityText, getSleepQualityColor } from '../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - spacing.lg * 4;

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
  // 内部状态 - 使用 ref 避免闭包问题
  const currentValueRef = useRef(value);
  const [displayValue, setDisplayValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  
  // 动画值
  const animatedValue = useRef(new Animated.Value(value)).current;
  
  // 计算尺寸
  const sizes = {
    small: { slider: 150, thumb: 20, icon: 16, font: fontSize.sm },
    medium: { slider: SLIDER_WIDTH, thumb: 28, icon: 32, font: fontSize.xl },
    large: { slider: SLIDER_WIDTH, thumb: 36, icon: 48, font: fontSize['3xl'] },
  }[size];

  // 同步外部 value 变化（只在初始化或外部主动改变时）
  useEffect(() => {
    // 只有在非拖拽状态下才响应外部 value 变化
    if (!isDragging && value !== currentValueRef.current) {
      currentValueRef.current = value;
      setDisplayValue(value);
      animatedValue.setValue(value);
    }
  }, [value, isDragging, animatedValue]);

  // 计算步进值
  const calculateStep = useCallback((x: number): number => {
    const stepWidth = sizes.slider / 10;
    const relativeX = Math.max(0, Math.min(x, sizes.slider));
    const step = Math.round(relativeX / stepWidth);
    return Math.max(1, Math.min(10, step));
  }, [sizes.slider]);

  // 更新值的核心函数
  const updateValue = useCallback((newValue: number) => {
    if (newValue !== currentValueRef.current) {
      currentValueRef.current = newValue;
      setDisplayValue(newValue);
      animatedValue.setValue(newValue);
      onValueChange(newValue);
    }
  }, [onValueChange, animatedValue]);

  // 手势响应器
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        // 计算点击位置对应的值
        const { locationX } = evt.nativeEvent;
        const newValue = calculateStep(locationX);
        updateValue(newValue);
      },
      
      onPanResponderMove: (evt, gestureState: PanResponderGestureState) => {
        // 使用 gestureState.moveX 相对于屏幕的位置，需要计算相对于滑块的偏移
        const { moveX } = gestureState;
        // 滑块在屏幕上的偏移量估算
        const sliderOffset = (SCREEN_WIDTH - sizes.slider) / 2;
        const relativeX = moveX - sliderOffset;
        const newValue = calculateStep(relativeX);
        updateValue(newValue);
      },
      
      onPanResponderRelease: () => {
        setIsDragging(false);
        // 确保最终值是整数
        const finalValue = Math.round(currentValueRef.current);
        updateValue(finalValue);
      },
      
      onPanResponderTerminate: () => {
        setIsDragging(false);
        const finalValue = Math.round(currentValueRef.current);
        updateValue(finalValue);
      },
    })
  ).current;

  // 获取当前质量信息
  const quality = getSleepQualityFromScore(displayValue);
  const qualityText = getSleepQualityText(quality);
  const qualityColor = getSleepQualityColor(quality);

  // 计算滑块位置
  const thumbPosition = animatedValue.interpolate({
    inputRange: [1, 10],
    outputRange: [sizes.thumb / 2, sizes.slider - sizes.thumb / 2],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* 标签区域 */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>睡眠质量评分</Text>
          <View style={[styles.qualityBadge, { backgroundColor: qualityColor + '20' }]}>
            <MoodIcon score={displayValue} size={16} />
            <Text style={[styles.qualityText, { color: qualityColor }]}>
              {qualityText}
            </Text>
          </View>
        </View>
      )}

      {/* 分数显示 */}
      <View style={styles.scoreContainer}>
        <View
          style={[
            styles.scoreCircle,
            {
              width: sizes.icon + 24,
              height: sizes.icon + 24,
              borderRadius: (sizes.icon + 24) / 2,
              borderColor: qualityColor,
              shadowColor: qualityColor,
            },
          ]}
        >
          <MoodIcon score={displayValue} size={sizes.icon} />
        </View>
        
        <View style={styles.scoreTextContainer}>
          <Text
            style={[
              styles.scoreValue,
              { fontSize: sizes.font, color: qualityColor },
            ]}
          >
            {displayValue}
          </Text>
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
                  backgroundColor: index < displayValue ? qualityColor : colors.gray[300],
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
              marginLeft: -sizes.thumb / 2,
              backgroundColor: qualityColor,
              shadowColor: qualityColor,
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
          {getScoreDescription(displayValue)}
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
    shadowOpacity: 0.4,
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
    height: 50,
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
    shadowOpacity: 0.5,
    elevation: 5,
    top: 9,
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

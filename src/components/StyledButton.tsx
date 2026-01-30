/**
 * SleepTracker - StyledButton 组件
 * 霓虹感按钮组件
 * 支持多种变体：primary, secondary, outline, ghost, gradient
 */

import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../styles';

// ==================== 属性定义 ====================

interface StyledButtonProps {
  /** 按钮文本 */
  title: string;
  /** 点击回调 */
  onPress: () => void;
  /** 变体类型 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 是否禁用 */
  disabled?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 图标（左侧） */
  leftIcon?: React.ReactNode;
  /** 图标（右侧） */
  rightIcon?: React.ReactNode;
  /** 自定义样式 */
  style?: ViewStyle;
  /** 自定义文本样式 */
  textStyle?: TextStyle;
  /** 是否全宽 */
  fullWidth?: boolean;
}

// ==================== 主组件 ====================

export const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  // 动画值
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // 按下动画
  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  // 松开动画
  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  // 计算尺寸
  const sizeStyles = {
    small: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      fontSize: fontSize.sm,
    },
    medium: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      fontSize: fontSize.md,
    },
    large: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing['2xl'],
      fontSize: fontSize.lg,
    },
  }[size];

  // 变体样式
  const variantStyles = {
    primary: {
      container: {
        backgroundColor: colors.primary[600],
        borderWidth: 0,
      },
      text: {
        color: '#FFFFFF',
      },
      glowColor: colors.primary[500],
    },
    secondary: {
      container: {
        backgroundColor: colors.secondary[600],
        borderWidth: 0,
      },
      text: {
        color: '#FFFFFF',
      },
      glowColor: colors.secondary[500],
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary[500],
      },
      text: {
        color: colors.primary[600],
      },
      glowColor: colors.primary[200],
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      text: {
        color: colors.gray[600],
      },
      glowColor: 'transparent',
    },
    gradient: {
      container: {
        backgroundColor: colors.primary[600],
        borderWidth: 0,
        // 渐变效果通过阴影模拟
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
      },
      text: {
        color: '#FFFFFF',
      },
      glowColor: colors.primary[400],
    },
  }[variant];

  // 发光动画样式
  const glowStyle = {
    shadowColor: variantStyles.glowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: variant === 'gradient' ? [0.4, 0.8] : [0, 0.6],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: variant === 'gradient' ? [12, 20] : [0, 15],
    }),
    elevation: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [variant === 'gradient' ? 8 : 2, 12],
    }),
  };

  // 是否禁用
  const isDisabled = disabled || loading;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: isDisabled ? 0.6 : 1,
          width: fullWidth ? '100%' : 'auto',
        },
        glowStyle,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          sizeStyles,
          variantStyles.container,
          {
            borderRadius: borderRadius.lg,
            width: fullWidth ? '100%' : 'auto',
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variantStyles.text.color} 
          />
        ) : (
          <>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text
              style={[
                styles.text,
                { fontSize: sizeStyles.fontSize },
                variantStyles.text,
                textStyle,
              ]}
            >
              {title}
            </Text>
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ==================== 快捷变体组件 ====================

/**
 * 主要按钮
 */
export const PrimaryButton: React.FC<Omit<StyledButtonProps, 'variant'>> = (props) => (
  <StyledButton {...props} variant="primary" />
);

/**
 * 次要按钮
 */
export const SecondaryButton: React.FC<Omit<StyledButtonProps, 'variant'>> = (props) => (
  <StyledButton {...props} variant="secondary" />
);

/**
 * 轮廓按钮
 */
export const OutlineButton: React.FC<Omit<StyledButtonProps, 'variant'>> = (props) => (
  <StyledButton {...props} variant="outline" />
);

/**
 * 幽灵按钮
 */
export const GhostButton: React.FC<Omit<StyledButtonProps, 'variant'>> = (props) => (
  <StyledButton {...props} variant="ghost" />
);

/**
 * 渐变霓虹按钮（主操作按钮）
 */
export const GradientButton: React.FC<Omit<StyledButtonProps, 'variant'>> = (props) => (
  <StyledButton {...props} variant="gradient" size="large" fullWidth />
);

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
});

export default StyledButton;

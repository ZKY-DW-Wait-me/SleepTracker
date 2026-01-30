/**
 * SleepTracker - ErrorBoundary
 * 全局错误边界组件 - 捕获 React 组件树中的 JavaScript 错误
 * 
 * 使用：包裹在应用根组件外，捕获所有渲染错误
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../styles';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染显示错误 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误到控制台
    console.error('[ErrorBoundary] React Error Caught:', error);
    console.error('[ErrorBoundary] Component Stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    try {
      console.log('[ErrorBoundary] Resetting error state...');
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    } catch (e) {
      console.error('[ErrorBoundary] Failed to reset:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      // 渲染错误 UI
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* 错误图标 */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>

            {/* 错误标题 */}
            <Text style={styles.title}>应用遇到错误</Text>
            
            {/* 错误描述 */}
            <Text style={styles.description}>
              抱歉，应用发生了意外错误。您可以选择重新加载应用。
            </Text>

            {/* 错误详情（调试用） */}
            <View style={styles.errorBox}>
              <Text style={styles.errorLabel}>错误信息：</Text>
              <Text style={styles.errorMessage}>
                {this.state.error?.message || '未知错误'}
              </Text>
              
              {this.state.errorInfo && (
                <>
                  <Text style={[styles.errorLabel, { marginTop: spacing.md }]}>
                    组件堆栈：
                  </Text>
                  <Text style={styles.stackTrace} numberOfLines={10}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                </>
              )}
            </View>

            {/* 操作按钮 */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>重新加载应用</Text>
            </TouchableOpacity>

            {/* 提示信息 */}
            <Text style={styles.hint}>
              如果问题持续存在，请尝试：{'\n'}
              • 重启应用{'\n'}
              • 清除应用数据{'\n'}
              • 联系开发者
            </Text>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.error.light + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.error.main,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error.light,
  },
  errorLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  errorMessage: {
    fontSize: fontSize.sm,
    color: colors.error.main,
    lineHeight: 20,
  },
  stackTrace: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  resetButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resetButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ErrorBoundary;

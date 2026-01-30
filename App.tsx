/**
 * SleepTracker - 应用入口组件
 * 商业级睡眠管理专家 App
 * 
 * 修复：添加 ErrorBoundary，修复动画配置
 * 
 * @format
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Redux Store
import { store } from './src/store';

// 导航
import { AppNavigator } from './src/navigation';

// 服务
import { initializeDatabase, checkDatabaseHealth } from './src/services/database';

// 组件
import { ErrorBoundary } from './src/components';

// 样式
import { colors, fontSize, spacing } from './src/styles';

// 动画
const { width } = Dimensions.get('window');

// ==================== 初始化组件 ====================

/**
 * 应用初始化组件
 * 处理数据库初始化和加载状态
 */
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string>('正在初始化...');
  
  // 动画值 - 所有动画都使用原生驱动
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    try {
      // 入场动画
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('[ERROR] Animation start failed:', error);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 第一步：初始化数据库
        setDbStatus('正在初始化数据库...');
        Animated.timing(progressAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true, // 修复：改为 true
        }).start();
        
        const dbResult = await initializeDatabase();
        
        if (!dbResult.success) {
          throw new Error(dbResult.error || '数据库初始化失败');
        }

        // 第二步：检查数据库健康状态
        setDbStatus('正在检查数据库状态...');
        Animated.timing(progressAnim, {
          toValue: 0.6,
          duration: 500,
          useNativeDriver: true, // 修复：改为 true
        }).start();
        
        const healthResult = await checkDatabaseHealth();
        
        if (healthResult.success && healthResult.data) {
          console.log('[DEBUG] Database health:', healthResult.data);
          setDbStatus(`数据库就绪 (${healthResult.data.recordCount} 条记录)`);
        }

        // 第三步：加载用户设置
        setDbStatus('正在加载用户设置...');
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true, // 修复：改为 true
        }).start();
        
        // 模拟短暂的完成状态显示
        await new Promise<void>(resolve => setTimeout(resolve, 500));

        // 初始化完成
        setIsInitializing(false);
      } catch (error) {
        console.error('[ERROR] App initialization failed:', error);
        setInitError(error instanceof Error ? error.message : '未知错误');
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [progressAnim]);

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        {/* 背景渐变效果 */}
        <View style={styles.backgroundGradient} />
        
        {/* Logo 动画容器 */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* 应用 Logo */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>💤</Text>
          </View>
          
          <Text style={styles.loadingText}>SleepTracker</Text>
          <Text style={styles.loadingSubtext}>您的睡眠健康管家</Text>
          
          {/* 进度条 */}
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  transform: [{
                    scaleX: progressAnim,
                  }],
                },
              ]}
            />
          </View>
          
          <Text style={styles.statusText}>{dbStatus}</Text>
        </Animated.View>
        
        {/* 版本信息 */}
        <Text style={styles.versionText}>v1.0.1</Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>⚠️</Text>
        </View>
        <Text style={styles.errorTitle}>初始化失败</Text>
        <Text style={styles.errorText}>{initError}</Text>
        <View style={styles.errorHintBox}>
          <Text style={styles.errorHint}>请尝试以下操作：</Text>
          <Text style={styles.errorHintItem}>• 重启应用</Text>
          <Text style={styles.errorHintItem}>• 清除应用数据</Text>
          <Text style={styles.errorHintItem}>• 检查存储权限</Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

// ==================== 主应用组件 ====================

/**
 * 主应用组件
 * 配置 ErrorBoundary、Redux Provider、SafeAreaProvider、GestureHandler
 */
const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    flex: 1,
  };

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ReduxProvider store={store}>
            <AppInitializer>
              <SafeAreaView style={backgroundStyle}>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  backgroundColor={backgroundStyle.backgroundColor}
                />
                <AppNavigator />
              </SafeAreaView>
            </AppInitializer>
          </ReduxProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A', // 深蓝紫渐变底色
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    opacity: 0.95,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  logoText: {
    fontSize: 48,
  },
  loadingText: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  loadingSubtext: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: spacing.xl,
  },
  progressContainer: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366F1', // 靛紫色
    borderRadius: 2,
    width: '100%', // 用于 scaleX 动画
  },
  statusText: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  versionText: {
    position: 'absolute',
    bottom: spacing.xl,
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: spacing.xl,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error.light + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorIconText: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.error.main,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  errorHintBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  errorHint: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  errorHintItem: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
});

export default App;

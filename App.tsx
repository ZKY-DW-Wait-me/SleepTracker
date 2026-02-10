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
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [showContent, setShowContent] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string>('正在初始化...');

  // 动画值 - 所有动画都使用原生驱动
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const progressAnim = useState(new Animated.Value(0))[0];
  const splashOpacity = useState(new Animated.Value(1))[0];

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

        // 初始化完成 - 先显示内容，再淡出启动页
        setShowContent(true);
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setIsInitializing(false);
        });
      } catch (error) {
        console.error('[ERROR] App initialization failed:', error);
        setInitError(error instanceof Error ? error.message : '未知错误');
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [progressAnim]);

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

  // 启动页正在淡出时，同时显示内容和启动页覆盖层
  if (isInitializing || !showContent) {
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

  return (
    <View style={{ flex: 1 }}>
      {children}
      {/* 启动页淡出覆盖层 */}
      {splashOpacity && (
        <Animated.View
          style={[styles.splashOverlay, { opacity: splashOpacity }]}
          pointerEvents="none"
        />
      )}
    </View>
  );
};

// ==================== 隐私政策全文 ====================

const PRIVACY_TEXT_BEFORE = `SleepTracker 隐私政策
生效日期：2025年2月11日

前言
SleepTracker（以下简称"本应用"）是一款由ZKY开发的睡眠记录工具。我们非常重视用户的隐私保护，本政策旨在向您说明本应用如何处理您的信息。

重要说明：本应用为单机版应用。除非您主动联系开发者，本应用不会通过网络收集、传输或共享您的任何个人数据。

一、我们如何收集和使用信息
1. 用户主动输入的信息：为了实现核心功能（记录睡眠），本应用会记录您手动输入的入睡时间、起床时间及睡眠感受。这些数据仅用于在本应用内为您生成睡眠统计图表。
2. 设备权限说明：
   • 存储权限：我们可能需要读写设备存储空间，用于在您手机本地保存睡眠记录数据库。
   • 我们不会获取：您的地理位置、通讯录、短信、通话记录、IMEI或任何其他与功能无关的隐私权限。

二、我们如何存储信息
1. 存储位置：您的所有睡眠记录数据均存储在您手机本地的私有目录中。
2. 存储期限：除非您手动删除数据或卸载本应用，否则数据将一直保存在您的设备上。一旦卸载应用，所有存在本地的数据将无法找回。
3. 数据安全性：由于数据不上传至服务器，您的个人隐私安全主要由您的设备安全决定。建议您保护好手机，防止他人未经授权查看。

三、我们如何共享、转让、公开披露信息
1. 共享与转让：我们不会与任何公司、组织或个人共享您的个人信息。
2. 第三方插件：本应用不集成任何第三方广告、统计或分析类 SDK（软件开发工具包），因此不存在第三方收集您信息的情况。

四、您如何管理自己的信息
您可以随时在应用内：
1. 修改或删除任何一笔睡眠记录。
2. 通过清理应用缓存或卸载应用来清除所有本地数据。

五、未成年人保护
本应用不对未成年人收集任何特殊信息。如您是未成年人，建议在监护人指导下使用本工具。

六、政策的变更
我们可能会适时更新本隐私政策。当政策发生较大变化时，我们会在应用内通过弹窗或显著位置进行告知。`;

const PRIVACY_STORAGE_NOTICE = `【特别提示：关于本地存储机制】
本应用采用 Android 系统标准的私有目录存储技术（Internal Storage）。根据相关法律法规及系统权限规范，应用在自身私有目录下读写功能产生的必要数据（如睡眠记录数据库）无需调用系统级"存储权限"弹窗。

您点击"同意"即代表您已知悉并授权应用使用其私有目录空间。我们承诺不会扫描、读取、修改您私有目录之外的任何文件（如您的相册、文档或其他应用的数据）。`;

const PRIVACY_TEXT_AFTER = `七、如何联系我们
如果您对本隐私政策或您的个人信息保护有任何疑问，请通过以下方式联系开发者：
邮箱：chefzky@gmail.com`;

const PRIVACY_STORAGE_KEY = 'AGREE_PRIVACY';

// ==================== 全屏隐私政策同意页 ====================

const PrivacyConsentScreen: React.FC<{
  onAgree: () => void;
}> = ({ onAgree }) => {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    // 距离底部 30px 以内视为已读完
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 30;
    if (isAtBottom && !scrolledToBottom) {
      setScrolledToBottom(true);
    }
  }, [scrolledToBottom]);

  const handleDisagree = useCallback(() => {
    BackHandler.exitApp();
  }, []);

  const handleAgree = useCallback(async () => {
    if (!scrolledToBottom) {return;}
    try {
      await AsyncStorage.setItem(PRIVACY_STORAGE_KEY, 'true');
      onAgree();
    } catch (error) {
      console.error('[ERROR] Failed to save privacy consent:', error);
    }
  }, [scrolledToBottom, onAgree]);

  return (
    <View style={privacyStyles.fullScreen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* 标题栏 */}
      <View style={privacyStyles.header}>
        <Text style={privacyStyles.headerTitle}>用户协议与隐私政策</Text>
      </View>

      {/* 隐私政策全文 */}
      <ScrollView
        style={privacyStyles.scrollView}
        contentContainerStyle={privacyStyles.scrollContent}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      >
        <Text style={privacyStyles.policyText}>
          {PRIVACY_TEXT_BEFORE}
          {'\n\n'}
          <Text style={privacyStyles.policyTextRed}>{PRIVACY_STORAGE_NOTICE}</Text>
          {'\n\n'}
          {PRIVACY_TEXT_AFTER}
        </Text>
        <Text style={privacyStyles.scrollHint}>
          {scrolledToBottom ? '已阅读完毕' : '请滑动至底部阅读完整协议'}
        </Text>
      </ScrollView>

      {/* 底部按钮区 */}
      <View style={privacyStyles.bottomBar}>
        <TouchableOpacity
          style={privacyStyles.disagreeBtn}
          onPress={handleDisagree}
          activeOpacity={0.7}
        >
          <Text style={privacyStyles.disagreeBtnText}>不同意并退出</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            privacyStyles.agreeBtn,
            !scrolledToBottom && privacyStyles.agreeBtnDisabled,
          ]}
          onPress={handleAgree}
          activeOpacity={scrolledToBottom ? 0.8 : 1}
          disabled={!scrolledToBottom}
        >
          <Text
            style={[
              privacyStyles.agreeBtnText,
              !scrolledToBottom && privacyStyles.agreeBtnTextDisabled,
            ]}
          >
            同意并继续
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ==================== 主应用组件 ====================

/**
 * 主应用组件
 * 配置 ErrorBoundary、Redux Provider、SafeAreaProvider、GestureHandler
 */
const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPrivacy = async () => {
      try {
        const value = await AsyncStorage.getItem(PRIVACY_STORAGE_KEY);
        setPrivacyAgreed(value === 'true');
      } catch (error) {
        console.error('[ERROR] Failed to check privacy consent:', error);
        setPrivacyAgreed(false);
      }
    };
    checkPrivacy();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    flex: 1,
  };

  // 等待隐私状态加载
  if (privacyAgreed === null) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.backgroundGradient} />
      </View>
    );
  }

  // 未同意隐私协议 - 显示全屏隐私政策页，不渲染主应用
  if (!privacyAgreed) {
    return (
      <ErrorBoundary>
        <PrivacyConsentScreen onAgree={() => setPrivacyAgreed(true)} />
      </ErrorBoundary>
    );
  }

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
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
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

// ==================== 隐私政策页样式 ====================

const privacyStyles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 44 : 54,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gray[800],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  policyText: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
    lineHeight: 24,
  },
  policyTextRed: {
    color: '#DC2626',
    fontWeight: '600',
  },
  scrollHint: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'android' ? spacing.lg : spacing.xl,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    gap: spacing.md,
  },
  disagreeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
  },
  disagreeBtnText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[500],
  },
  agreeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
  },
  agreeBtnDisabled: {
    backgroundColor: colors.gray[200],
  },
  agreeBtnText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  agreeBtnTextDisabled: {
    color: colors.gray[400],
  },
});

export default App;

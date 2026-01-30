/**
 * SleepTracker - SettingsScreen
 * 设置页面：目标设定、深色模式、数据导出
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  Animated,
  Platform,
  Share,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  Moon,
  Sun,
  Target,
  Bell,
  Database,
  Share2,
  ChevronRight,
  User,
  Info,
  Trash2,
  FileText,
  Download,
  MoonStar,
  Languages,
  Thermometer,
  Clock,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// Hooks
import { useSettings } from '../hooks';

// 服务
import { exportAllData, clearAllData, resetDatabase } from '../services/database';

// 样式
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles';

// 类型
import { SleepGoal } from '../types';

// ==================== 设置项组件 ====================

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
  delay?: number;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  value,
  onPress,
  rightElement,
  danger = false,
  delay = 0,
}) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
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
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[styles.settingItem, onPress && styles.settingItemPressable]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
      >
        <View
          style={[
            styles.settingIcon,
            { backgroundColor: danger ? colors.error.light + '20' : colors.primary[50] },
          ]}
        >
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text
            style={[
              styles.settingTitle,
              danger && styles.settingTitleDanger,
            ]}
          >
            {title}
          </Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {rightElement}
        {onPress && !rightElement && (
          <ChevronRight
            size={20}
            color={danger ? colors.error.main : colors.gray[400]}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ==================== 睡眠目标设置模态框 ====================

interface GoalSettingModalProps {
  visible: boolean;
  onClose: () => void;
  currentGoal: SleepGoal;
  onSave: (goal: Partial<SleepGoal>) => void;
}

const GoalSettingModal: React.FC<GoalSettingModalProps> = ({
  visible,
  onClose,
  currentGoal,
  onSave,
}) => {
  const [targetBedTime, setTargetBedTime] = useState(currentGoal.targetBedTime);
  const [targetWakeTime, setTargetWakeTime] = useState(currentGoal.targetWakeTime);
  const [durationGoal, setDurationGoal] = useState(String(currentGoal.durationGoal));

  const handleSave = () => {
    const duration = parseInt(durationGoal, 10);
    if (isNaN(duration) || duration < 300 || duration > 720) {
      Alert.alert('无效时长', '睡眠目标时长应在5-12小时之间');
      return;
    }

    onSave({
      targetBedTime,
      targetWakeTime,
      durationGoal: duration,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>设置睡眠目标</Text>

          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>目标入睡时间</Text>
            <TextInput
              style={styles.modalInput}
              value={targetBedTime}
              onChangeText={setTargetBedTime}
              placeholder="22:30"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>目标起床时间</Text>
            <TextInput
              style={styles.modalInput}
              value={targetWakeTime}
              onChangeText={setTargetWakeTime}
              placeholder="06:30"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>目标睡眠时长（分钟）</Text>
            <TextInput
              style={styles.modalInput}
              value={durationGoal}
              onChangeText={setDurationGoal}
              placeholder="480"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonTextCancel}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={handleSave}
            >
              <Text style={styles.modalButtonTextConfirm}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==================== 主页面组件 ====================

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 状态
  const [headerOpacity] = useState(new Animated.Value(0));
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Hooks
  const {
    settings,
    isInitialized,
    loadSettings,
    setTheme,
    setSleepGoal,
    toggleSmart,
    toggleAnalysis,
    toggleFormat,
    toggleTempUnit,
  } = useSettings();

  // 初始化
  useEffect(() => {
    if (!isInitialized) {
      loadSettings();
    }
    
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // 切换主题
  const handleThemeToggle = useCallback(async () => {
    const newTheme = settings.themeMode === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  }, [settings.themeMode, setTheme]);

  // 导出数据为 CSV
  const handleExportCSV = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await exportAllData();
      if (result.success && result.data) {
        // 构建 CSV 内容
        const data = JSON.parse(result.data);
        const records = data.records || [];
        
        const headers = ['日期', '入睡时间', '起床时间', '时长(分钟)', '质量评分', '质量等级', '醒来次数', '备注'];
        const rows = records.map((r: any) => [
          new Date(r.bedTime).toLocaleDateString('zh-CN'),
          new Date(r.bedTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          new Date(r.wakeTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          r.duration,
          r.qualityScore,
          r.quality,
          r.wakeUpCount,
          r.notes || '',
        ]);
        
        const csvContent = [
          headers.join(','),
          ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        // 分享文件
        await Share.share({
          message: csvContent,
          title: 'SleepTracker 数据导出',
        });
      } else {
        Alert.alert('导出失败', result.error || '无法导出数据');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('导出失败', '发生未知错误');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // 清空数据
  const handleClearData = useCallback(() => {
    Alert.alert(
      '清空数据',
      '此操作将删除所有睡眠记录，不可恢复。是否继续？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            const result = await clearAllData();
            if (result.success) {
              Alert.alert('已清空', '所有睡眠记录已删除');
            } else {
              Alert.alert('操作失败', result.error || '请重试');
            }
          },
        },
      ]
    );
  }, []);

  // 重置数据库
  const handleResetDatabase = useCallback(() => {
    Alert.alert(
      '重置数据库',
      '此操作将重置整个数据库，包括用户设置。是否继续？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          style: 'destructive',
          onPress: async () => {
            const result = await resetDatabase();
            if (result.success) {
              Alert.alert('已重置', '数据库已重置为初始状态');
            } else {
              Alert.alert('操作失败', result.error || '请重试');
            }
          },
        },
      ]
    );
  }, []);

  // 保存目标
  const handleSaveGoal = useCallback(async (goal: Partial<SleepGoal>) => {
    await setSleepGoal(goal);
  }, [setSleepGoal]);

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
          <Text style={styles.headerTitle}>设置</Text>
          <Text style={styles.headerSubtitle}>自定义您的睡眠追踪体验</Text>
        </View>
        <View style={styles.headerIcon}>
          <User size={24} color={colors.primary[500]} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 睡眠目标设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>睡眠目标</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Target size={20} color={colors.primary[500]} />}
              title="目标时间"
              subtitle={`入睡 ${settings.sleepGoal.targetBedTime} · 起床 ${settings.sleepGoal.targetWakeTime}`}
              value={`${Math.round(settings.sleepGoal.durationGoal / 60)}小时`}
              onPress={() => setShowGoalModal(true)}
              delay={0}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<MoonStar size={20} color={colors.secondary[500]} />}
              title="智能提醒"
              subtitle="根据睡眠习惯发送提醒"
              rightElement={
                <Switch
                  value={settings.smartRemindersEnabled}
                  onValueChange={toggleSmart}
                  trackColor={{ false: colors.gray[300], true: colors.primary[300] }}
                  thumbColor={settings.smartRemindersEnabled ? colors.primary[500] : '#FFFFFF'}
                />
              }
              delay={50}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<ActivityIndicator size="small" color={colors.success.main} /> as any}
              title="睡眠分析"
              subtitle="启用智能睡眠分析"
              rightElement={
                <Switch
                  value={settings.sleepAnalysisEnabled}
                  onValueChange={toggleAnalysis}
                  trackColor={{ false: colors.gray[300], true: colors.success.light }}
                  thumbColor={settings.sleepAnalysisEnabled ? colors.success.main : '#FFFFFF'}
                />
              }
              delay={100}
            />
          </View>
        </View>

        {/* 外观设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>外观</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={
                settings.themeMode === 'dark' ? (
                  <Moon size={20} color={colors.gray[700]} />
                ) : (
                  <Sun size={20} color={colors.warning.main} />
                )
              }
              title="深色模式"
              subtitle={settings.themeMode === 'dark' ? '已开启' : '已关闭'}
              rightElement={
                <Switch
                  value={settings.themeMode === 'dark'}
                  onValueChange={handleThemeToggle}
                  trackColor={{ false: colors.gray[300], true: colors.gray[700] }}
                  thumbColor={settings.themeMode === 'dark' ? '#FFFFFF' : '#FFFFFF'}
                />
              }
              delay={150}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Clock size={20} color={colors.info.main} />}
              title="24小时制"
              subtitle={settings.use24HourFormat ? '已开启' : '已关闭'}
              rightElement={
                <Switch
                  value={settings.use24HourFormat}
                  onValueChange={toggleFormat}
                  trackColor={{ false: colors.gray[300], true: colors.info.light }}
                  thumbColor={settings.use24HourFormat ? colors.info.main : '#FFFFFF'}
                />
              }
              delay={200}
            />
          </View>
        </View>

        {/* 数据管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据管理</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Download size={20} color={colors.success.main} />}
              title="导出数据"
              subtitle="导出为 CSV 格式"
              onPress={handleExportCSV}
              delay={250}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Trash2 size={20} color={colors.error.main} />}
              title="清空所有记录"
              subtitle="删除所有睡眠数据"
              danger
              onPress={handleClearData}
              delay={300}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Database size={20} color={colors.error.dark} />}
              title="重置数据库"
              subtitle="重置所有数据和设置"
              danger
              onPress={handleResetDatabase}
              delay={350}
            />
          </View>
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Info size={20} color={colors.gray[500]} />}
              title="版本"
              value="1.0.0"
              delay={400}
            />
          </View>
        </View>

        {/* 版权信息 */}
        <Text style={styles.copyright}>
          SleepTracker v1.0.0{'\n'}
          您的专业睡眠健康管家
        </Text>
      </ScrollView>

      {/* 目标设置模态框 */}
      <GoalSettingModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        currentGoal={settings.sleepGoal}
        onSave={handleSaveGoal}
      />
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[500],
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  settingItemPressable: {
    backgroundColor: '#FFFFFF',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.gray[800],
  },
  settingTitleDanger: {
    color: colors.error.main,
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  settingValue: {
    fontSize: fontSize.md,
    color: colors.gray[600],
    marginRight: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginLeft: spacing.lg + 36 + spacing.md,
  },
  copyright: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalField: {
    marginBottom: spacing.md,
  },
  modalLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.gray[800],
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.gray[100],
    marginRight: spacing.sm,
  },
  modalButtonConfirm: {
    backgroundColor: colors.primary[500],
    marginLeft: spacing.sm,
  },
  modalButtonTextCancel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[600],
  },
  modalButtonTextConfirm: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SettingsScreen;

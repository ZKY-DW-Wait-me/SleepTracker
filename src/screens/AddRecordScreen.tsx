/**
 * SleepTracker - AddRecordScreen
 * 添加/编辑睡眠记录页面
 * 时间选择器、质量评分、标签选择
 * 
 * 重构：使用 DateTimePickerAndroid.open() 指令式调用，修复崩溃问题
 * 优化：添加自定义 Toast 和加载状态
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
// 使用 DateTimePickerAndroid 指令式 API
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import {
  Sun,
  Moon,
  FileText,
  Save,
  X,
  Clock,
  ChevronDown,
  Check,
  CheckCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { format, isValid } from 'date-fns';

// 组件
import { QualityRating, GradientButton } from '../components';

// Hooks
import { useSleepRecords } from '../hooks';

// 工具
import { calculateDurationMinutes } from '../utils/dateUtils';

// 样式
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles';

// 类型
import { SleepTag } from '../types';

// ==================== 常量定义 ====================

const SLEEP_TAGS: { key: SleepTag; label: string; icon: string }[] = [
  { key: 'caffeine', label: '咖啡因', icon: '☕' },
  { key: 'alcohol', label: '酒精', icon: '🍺' },
  { key: 'exercise', label: '运动', icon: '💪' },
  { key: 'stress', label: '压力', icon: '😰' },
  { key: 'screen', label: '屏幕', icon: '📱' },
  { key: 'late_meal', label: '夜宵', icon: '🍔' },
  { key: 'medication', label: '药物', icon: '💊' },
  { key: 'noise', label: '噪音', icon: '🔊' },
  { key: 'temperature', label: '温度', icon: '🌡️' },
  { key: 'travel', label: '旅行', icon: '✈️' },
];

// ==================== 自定义 Toast 组件 ====================

interface ToastProps {
  visible: boolean;
  message: string;
  onHide?: () => void;
}

const Toast: React.FC<ToastProps> = ({ visible, message, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide?.();
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, translateY, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.toastContent}>
        <CheckCircle size={20} color="#FFFFFF" />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

// ==================== 时间字段组件（使用 DateTimePickerAndroid）====================

interface TimeFieldProps {
  label: string;
  icon: React.ReactNode;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'bedtime' | 'waketime';
}

const TimeField: React.FC<TimeFieldProps> = ({
  label,
  icon,
  value,
  onChange,
  mode = 'bedtime',
}) => {
  // 使用 DateTimePickerAndroid.open 指令式打开时间选择器
  const handlePress = useCallback(() => {
    try {
      console.log('[DEBUG] Opening time picker for:', label);
      
      // 先打开日期选择
      DateTimePickerAndroid.open({
        value: value,
        mode: 'date',
        minimumDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
        maximumDate: new Date(),
        onChange: (dateEvent, selectedDate) => {
          if (dateEvent.type === 'set' && selectedDate) {
            // 日期选择后，打开时间选择
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: 'time',
              is24Hour: true,
              onChange: (timeEvent, selectedTime) => {
                if (timeEvent.type === 'set' && selectedTime) {
                  // 合并日期和时间
                  const finalDate = new Date(selectedDate);
                  finalDate.setHours(selectedTime.getHours());
                  finalDate.setMinutes(selectedTime.getMinutes());
                  console.log('[DEBUG] Final datetime selected:', finalDate.toISOString());
                  onChange(finalDate);
                }
              },
            });
          }
        },
      });
    } catch (error) {
      console.error('[ERROR] Failed to open picker:', error);
    }
  }, [label, value, onChange]);

  const displayValue = format(value, 'HH:mm');
  const dateValue = format(value, 'MM月dd日');

  return (
    <View style={styles.timeFieldContainer}>
      <Text style={styles.timeFieldLabel}>{label}</Text>
      
      <TouchableOpacity
        style={[
          styles.timeFieldButton,
          mode === 'bedtime' ? styles.bedtimeButton : styles.waketimeButton,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.timeFieldIcon}>{icon}</View>
        <View style={styles.timeFieldContent}>
          <Text style={styles.timeFieldValue}>{displayValue}</Text>
          <Text style={styles.timeFieldDate}>{dateValue}</Text>
        </View>
        <ChevronDown size={20} color={colors.gray[400]} />
      </TouchableOpacity>
    </View>
  );
};

// ==================== 单个标签项组件 ====================

interface TagItemProps {
  tag: typeof SLEEP_TAGS[0];
  isSelected: boolean;
  onToggle: () => void;
}

const TagItem: React.FC<TagItemProps> = ({ tag, isSelected, onToggle }) => {
  return (
    <TouchableOpacity
      style={[
        styles.tagButton,
        isSelected && styles.tagButtonSelected,
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={styles.tagIcon}>{tag.icon}</Text>
      <Text
        style={[
          styles.tagText,
          isSelected && styles.tagTextSelected,
        ]}
      >
        {tag.label}
      </Text>
      {isSelected && <Check size={14} color="#FFFFFF" style={styles.tagCheck} />}
    </TouchableOpacity>
  );
};

// ==================== 标签选择组件 ====================

interface TagSelectorProps {
  selectedTags: SleepTag[];
  onToggleTag: (tag: SleepTag) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onToggleTag }) => {
  return (
    <View style={styles.tagContainer}>
      <Text style={styles.tagLabel}>影响因素</Text>
      <View style={styles.tagGrid}>
        {SLEEP_TAGS.map((tag) => (
          <TagItem
            key={tag.key}
            tag={tag}
            isSelected={selectedTags.includes(tag.key)}
            onToggle={() => onToggleTag(tag.key)}
          />
        ))}
      </View>
    </View>
  );
};

// ==================== 统计预览组件 ====================

interface StatsPreviewProps {
  bedTime: Date;
  wakeTime: Date;
  qualityScore: number;
}

const StatsPreview: React.FC<StatsPreviewProps> = ({
  bedTime,
  wakeTime,
}) => {
  let duration = 0;
  let hours = 0;
  let minutes = 0;
  
  try {
    duration = calculateDurationMinutes(bedTime, wakeTime);
    hours = Math.floor(duration / 60);
    minutes = duration % 60;
  } catch (error) {
    console.error('[ERROR] Failed to calculate duration:', error);
  }

  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>预计睡眠</Text>
        <Text style={styles.previewDuration}>
          {hours}<Text style={styles.previewUnit}>小时</Text>{' '}
          {minutes}<Text style={styles.previewUnit}>分钟</Text>
        </Text>
        <View style={styles.previewDetails}>
          <View style={styles.previewItem}>
            <Moon size={14} color={colors.primary[400]} />
            <Text style={styles.previewItemText}>
              {format(bedTime, 'HH:mm')} 入睡
            </Text>
          </View>
          <View style={styles.previewDivider} />
          <View style={styles.previewItem}>
            <Sun size={14} color={colors.warning.main} />
            <Text style={styles.previewItemText}>
              {format(wakeTime, 'HH:mm')} 起床
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ==================== 主页面组件 ====================

export const AddRecordScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 获取 hooks
  const { addRecord } = useSleepRecords();

  // 表单状态
  const [bedTime, setBedTime] = useState<Date>(new Date());
  const [wakeTime, setWakeTime] = useState<Date>(new Date());
  const [qualityScore, setQualityScore] = useState<number>(7);
  const [selectedTags, setSelectedTags] = useState<SleepTag[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [wakeUpCount, setWakeUpCount] = useState<number>(0);

  // 新增状态：加载和 Toast
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 切换标签
  const toggleTag = useCallback((tag: SleepTag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  // 增加醒来次数
  const incrementWakeUp = useCallback(() => {
    setWakeUpCount(prev => prev + 1);
  }, []);

  // 减少醒来次数
  const decrementWakeUp = useCallback(() => {
    setWakeUpCount(prev => Math.max(0, prev - 1));
  }, []);

  // 处理床时间变化
  const handleBedTimeChange = useCallback((date: Date) => {
    console.log('[DEBUG] Bed time changed:', date.toISOString());
    setBedTime(date);
  }, []);

  // 处理起床时间变化
  const handleWakeTimeChange = useCallback((date: Date) => {
    console.log('[DEBUG] Wake time changed:', date.toISOString());
    setWakeTime(date);
  }, []);

  // 保存记录
  const handleSave = useCallback(async () => {
    try {
      // 验证
      if (wakeTime <= bedTime) {
        // 使用 Toast 显示错误（可选）或保持静默
        console.error('[ERROR] Wake time must be after bed time');
        return;
      }

      const duration = calculateDurationMinutes(bedTime, wakeTime);
      if (duration < 60) {
        console.error('[ERROR] Sleep duration too short');
        return;
      }

      if (duration > 720) {
        console.error('[ERROR] Sleep duration too long');
        return;
      }

      // 设置加载状态
      setLoading(true);

      const recordData = {
        bedTime: bedTime.toISOString(),
        wakeTime: wakeTime.toISOString(),
        qualityScore,
        wakeUpCount,
        notes,
        tags: selectedTags,
      };
      
      console.log('[DEBUG] Saving record:', JSON.stringify(recordData, null, 2));

      const success = await addRecord(recordData);

      if (success) {
        // 显示成功 Toast
        setShowToast(true);
        // 延迟 1.5 秒后返回
        setTimeout(() => {
          // @ts-ignore
          navigation.navigate('MainTabs', { screen: 'Home' });
        }, 1500);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('[ERROR] Save error:', error);
      setLoading(false);
    }
  }, [bedTime, wakeTime, qualityScore, selectedTags, notes, wakeUpCount, addRecord, navigation]);

  // 取消
  const handleCancel = useCallback(() => {
    if (notes || selectedTags.length > 0) {
      // 简化取消逻辑，直接返回
      navigation.goBack();
    } else {
      navigation.goBack();
    }
  }, [notes, selectedTags, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Toast 提示 */}
      <Toast 
        visible={showToast} 
        message="保存成功" 
        onHide={() => setShowToast(false)}
      />

      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <X size={24} color={colors.gray[600]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>记录睡眠</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!loading}
        >
          {/* 时间选择 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>时间设置</Text>
            <View style={styles.timeFields}>
              <TimeField
                label="入睡时间"
                icon={<Moon size={20} color={colors.primary[500]} />}
                value={bedTime}
                onChange={handleBedTimeChange}
                mode="bedtime"
              />
              <TimeField
                label="起床时间"
                icon={<Sun size={20} color={colors.warning.main} />}
                value={wakeTime}
                onChange={handleWakeTimeChange}
                mode="waketime"
              />
            </View>
          </View>

          {/* 统计预览 */}
          <StatsPreview
            bedTime={bedTime}
            wakeTime={wakeTime}
            qualityScore={qualityScore}
          />

          {/* 质量评分 */}
          <View style={styles.section}>
            <QualityRating
              value={qualityScore}
              onValueChange={setQualityScore}
              size="large"
              showLabel={true}
            />
          </View>

          {/* 醒来次数 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>夜间醒来</Text>
            <View style={styles.wakeUpContainer}>
              <TouchableOpacity
                style={[styles.wakeUpButton, loading && styles.disabledButton]}
                onPress={decrementWakeUp}
                disabled={loading}
              >
                <Text style={styles.wakeUpButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.wakeUpDisplay}>
                <Clock size={20} color={colors.primary[500]} />
                <Text style={styles.wakeUpCount}>{wakeUpCount}</Text>
                <Text style={styles.wakeUpLabel}>次</Text>
              </View>
              <TouchableOpacity
                style={[styles.wakeUpButton, loading && styles.disabledButton]}
                onPress={incrementWakeUp}
                disabled={loading}
              >
                <Text style={styles.wakeUpButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 标签选择 */}
          <TagSelector
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
          />

          {/* 备注输入 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>备注</Text>
            <View style={styles.notesContainer}>
              <FileText size={20} color={colors.gray[400]} style={styles.notesIcon} />
              <TextInput
                style={styles.notesInput}
                multiline
                numberOfLines={4}
                placeholder="记录今天的睡眠感受..."
                placeholderTextColor={colors.gray[400]}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 底部保存按钮 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {loading ? '保存中...' : '保存记录'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  // Toast 样式
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success?.main || '#10B981',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[800],
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
  timeFields: {
    gap: spacing.md,
  },
  timeFieldContainer: {
    marginBottom: spacing.md,
  },
  timeFieldLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  timeFieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    ...shadows.sm,
  },
  bedtimeButton: {
    borderColor: colors.primary[200],
  },
  waketimeButton: {
    borderColor: colors.warning.light + '50',
  },
  timeFieldIcon: {
    marginRight: spacing.md,
  },
  timeFieldContent: {
    flex: 1,
  },
  timeFieldValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gray[800],
  },
  timeFieldDate: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  previewContainer: {
    marginBottom: spacing.xl,
  },
  previewCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: spacing.sm,
  },
  previewDuration: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  previewUnit: {
    fontSize: fontSize.lg,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  previewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewItemText: {
    fontSize: fontSize.sm,
    color: '#FFFFFF',
    marginLeft: spacing.xs,
  },
  previewDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: spacing.md,
  },
  wakeUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  wakeUpButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  wakeUpButtonText: {
    fontSize: fontSize['2xl'],
    fontWeight: '600',
    color: colors.primary[600],
  },
  wakeUpDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
  },
  wakeUpCount: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.gray[800],
    marginHorizontal: spacing.sm,
  },
  wakeUpLabel: {
    fontSize: fontSize.md,
    color: colors.gray[500],
  },
  tagContainer: {
    marginBottom: spacing.xl,
  },
  tagLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...shadows.sm,
  },
  tagButtonSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  tagIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  tagText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  tagTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tagCheck: {
    marginLeft: spacing.xs,
  },
  notesContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...shadows.sm,
  },
  notesIcon: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  notesInput: {
    flex: 1,
    minHeight: 100,
    fontSize: fontSize.md,
    color: colors.gray[800],
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    ...shadows.lg,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

export default AddRecordScreen;

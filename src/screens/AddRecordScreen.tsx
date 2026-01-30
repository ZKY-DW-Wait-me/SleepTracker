/**
 * SleepTracker - AddRecordScreen
 * 添加/编辑睡眠记录页面
 * 时间选择器、质量评分、标签选择
 * 
 * 修复：添加完整错误处理和调试日志，防止原生模块崩溃
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  BedDouble,
  Sun,
  Moon,
  FileText,
  Save,
  X,
  Clock,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { format, isValid, subDays } from 'date-fns';

// 组件
import { QualityRating, GradientButton } from '../components';

// Hooks
import { useSleepRecords } from '../hooks';

// 工具
import { calculateDurationMinutes, formatDuration } from '../utils/dateUtils';

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

// ==================== 时间选择器组件（修复闪退 - 添加完整错误处理）====================

interface TimePickerFieldProps {
  label: string;
  icon: React.ReactNode;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'bedtime' | 'waketime';
}

const TimePickerField: React.FC<TimePickerFieldProps> = ({
  label,
  icon,
  value,
  onChange,
  mode = 'bedtime',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 修复：添加完整错误处理和调试日志
  const handleChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    try {
      console.log('[DEBUG] TimePicker handleChange called:', {
        type: event.type,
        platform: Platform.OS,
        hasDate: !!selectedDate,
        timestamp: new Date().toISOString(),
      });

      // Android 自动关闭，iOS 需要手动关闭
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }
      
      // 处理用户取消的情况 (event.type === 'dismissed')
      if (event.type === 'dismissed') {
        console.log('[DEBUG] User dismissed the picker');
        if (Platform.OS === 'ios') {
          setShowPicker(false);
        }
        return;
      }
      
      // 确保有有效日期且不是取消操作
      if (event.type === 'set' && selectedDate) {
        // 验证日期是否有效
        if (!isValid(selectedDate)) {
          console.error('[ERROR] Invalid date selected:', selectedDate);
          Alert.alert('错误', '选择的日期无效');
          return;
        }
        
        console.log('[DEBUG] Valid date selected:', selectedDate.toISOString());
        
        // 使用 try-catch 包装 onChange 调用
        try {
          onChange(selectedDate);
        } catch (callbackError) {
          console.error('[ERROR] onChange callback failed:', callbackError);
          Alert.alert('错误', '更新日期失败');
        }
        
        // iOS 需要手动关闭
        if (Platform.OS === 'ios') {
          setShowPicker(false);
        }
      }
    } catch (error) {
      console.error('[ERROR] TimePicker handleChange error:', error);
      setHasError(true);
      setShowPicker(false);
      Alert.alert('错误', '时间选择器发生错误，请重试');
    }
  }, [onChange]);

  // 处理打开选择器
  const handlePress = useCallback(() => {
    try {
      console.log('[DEBUG] Opening time picker');
      setShowPicker(true);
      setHasError(false);
    } catch (error) {
      console.error('[ERROR] Failed to open picker:', error);
      Alert.alert('错误', '无法打开时间选择器');
    }
  }, []);

  // 处理 iOS 完成按钮
  const handleDone = useCallback(() => {
    try {
      console.log('[DEBUG] iOS Done button pressed');
      setShowPicker(false);
    } catch (error) {
      console.error('[ERROR] Failed to close picker:', error);
      setShowPicker(false);
    }
  }, []);

  const displayValue = format(value, 'HH:mm');
  const dateValue = format(value, 'MM月dd日');

  return (
    <View style={styles.timeFieldContainer}>
      <Text style={styles.timeFieldLabel}>{label}</Text>
      
      <TouchableOpacity
        style={[
          styles.timeFieldButton,
          mode === 'bedtime' ? styles.bedtimeButton : styles.waketimeButton,
          hasError && { borderColor: colors.error.main },
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

      {/* 直接渲染选择器，不使用 Modal 嵌套 - 修复闪退 */}
      {showPicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={value}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            maximumDate={new Date()}
            minimumDate={subDays(new Date(), 7)}
            locale="zh-CN"
            testID={`${mode}-picker`}
          />
          
          {/* iOS 需要额外的完成按钮 */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity 
              style={styles.iosDoneButton}
              onPress={handleDone}
            >
              <Text style={styles.iosDoneButtonText}>完成</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {hasError && (
        <Text style={styles.errorText}>时间选择器出错，请重试</Text>
      )}
    </View>
  );
};

// ==================== 单个标签项组件 ====================

interface TagItemProps {
  tag: typeof SLEEP_TAGS[0];
  index: number;
  isSelected: boolean;
  onToggle: () => void;
}

const TagItem: React.FC<TagItemProps> = ({ tag, isSelected, onToggle }) => {
  const handlePress = useCallback(() => {
    try {
      onToggle();
    } catch (error) {
      console.error('[ERROR] Tag toggle failed:', error);
    }
  }, [onToggle]);

  return (
    <TouchableOpacity
      style={[
        styles.tagButton,
        isSelected && styles.tagButtonSelected,
      ]}
      onPress={handlePress}
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
  const handleToggle = useCallback((tagKey: SleepTag) => {
    try {
      console.log('[DEBUG] Toggling tag:', tagKey);
      onToggleTag(tagKey);
    } catch (error) {
      console.error('[ERROR] Failed to toggle tag:', error);
      Alert.alert('错误', '切换标签失败');
    }
  }, [onToggleTag]);

  return (
    <View style={styles.tagContainer}>
      <Text style={styles.tagLabel}>影响因素</Text>
      <View style={styles.tagGrid}>
        {SLEEP_TAGS.map((tag, index) => (
          <TagItem
            key={tag.key}
            tag={tag}
            index={index}
            isSelected={selectedTags.includes(tag.key)}
            onToggle={() => handleToggle(tag.key)}
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
  qualityScore,
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
  const { addRecord, isLoading } = useSleepRecords();

  // 表单状态
  const [bedTime, setBedTime] = useState<Date>(subDays(new Date(), 0));
  const [wakeTime, setWakeTime] = useState<Date>(new Date());
  const [qualityScore, setQualityScore] = useState<number>(7);
  const [selectedTags, setSelectedTags] = useState<SleepTag[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [wakeUpCount, setWakeUpCount] = useState<number>(0);

  // 切换标签 - 添加错误处理
  const toggleTag = useCallback((tag: SleepTag) => {
    try {
      setSelectedTags(prev =>
        prev.includes(tag)
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    } catch (error) {
      console.error('[ERROR] toggleTag failed:', error);
    }
  }, []);

  // 增加醒来次数 - 添加错误处理
  const incrementWakeUp = useCallback(() => {
    try {
      setWakeUpCount(prev => prev + 1);
    } catch (error) {
      console.error('[ERROR] incrementWakeUp failed:', error);
    }
  }, []);

  // 减少醒来次数 - 添加错误处理
  const decrementWakeUp = useCallback(() => {
    try {
      setWakeUpCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[ERROR] decrementWakeUp failed:', error);
    }
  }, []);

  // 处理床时间变化
  const handleBedTimeChange = useCallback((date: Date) => {
    try {
      console.log('[DEBUG] Bed time changed:', date.toISOString());
      setBedTime(date);
    } catch (error) {
      console.error('[ERROR] Failed to set bed time:', error);
      Alert.alert('错误', '设置入睡时间失败');
    }
  }, []);

  // 处理起床时间变化
  const handleWakeTimeChange = useCallback((date: Date) => {
    try {
      console.log('[DEBUG] Wake time changed:', date.toISOString());
      setWakeTime(date);
    } catch (error) {
      console.error('[ERROR] Failed to set wake time:', error);
      Alert.alert('错误', '设置起床时间失败');
    }
  }, []);

  // 保存记录 - 添加完整错误处理
  const handleSave = useCallback(async () => {
    try {
      console.log('[DEBUG] handleSave called');
      
      // 验证
      if (wakeTime <= bedTime) {
        Alert.alert('时间错误', '起床时间必须晚于入睡时间');
        return;
      }

      const duration = calculateDurationMinutes(bedTime, wakeTime);
      if (duration < 60) {
        Alert.alert('时间过短', '睡眠时长至少需要1小时');
        return;
      }

      if (duration > 720) {
        Alert.alert('时间过长', '单次睡眠时长不应超过12小时');
        return;
      }

      console.log('[DEBUG] Validation passed, saving record...');
      
      // 准备记录数据
      const recordData = {
        bedTime: bedTime.toISOString(),
        wakeTime: wakeTime.toISOString(),
        qualityScore,
        wakeUpCount,
        notes,
        tags: selectedTags,
      };
      
      console.log('[DEBUG] Record data:', JSON.stringify(recordData, null, 2));

      const success = await addRecord(recordData);

      if (success) {
        console.log('[DEBUG] Record saved successfully');
        Alert.alert(
          '保存成功',
          '睡眠记录已保存',
          [
            {
              text: '确定',
              onPress: () => {
                try {
                  // @ts-ignore
                  navigation.navigate('MainTabs', { screen: 'Home' });
                } catch (navError) {
                  console.error('[ERROR] Navigation failed:', navError);
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } else {
        console.error('[ERROR] addRecord returned false');
        Alert.alert('保存失败', '请重试');
      }
    } catch (error) {
      console.error('[ERROR] Save error:', error);
      Alert.alert('保存失败', error instanceof Error ? error.message : '发生未知错误');
    }
  }, [bedTime, wakeTime, qualityScore, selectedTags, notes, wakeUpCount, addRecord, navigation]);

  // 取消 - 添加错误处理
  const handleCancel = useCallback(() => {
    try {
      console.log('[DEBUG] handleCancel called');
      
      if (notes || selectedTags.length > 0) {
        Alert.alert(
          '确认退出',
          '未保存的内容将丢失，是否继续？',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '退出',
              style: 'destructive',
              onPress: () => {
                try {
                  navigation.goBack();
                } catch (error) {
                  console.error('[ERROR] Navigation failed:', error);
                }
              },
            },
          ]
        );
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('[ERROR] Cancel error:', error);
      // 如果出错，直接返回
      try {
        navigation.goBack();
      } catch {
        // 忽略导航错误
      }
    }
  }, [notes, selectedTags, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        >
          {/* 时间选择 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>时间设置</Text>
            <View style={styles.timeFields}>
              <TimePickerField
                label="入睡时间"
                icon={<Moon size={20} color={colors.primary[500]} />}
                value={bedTime}
                onChange={handleBedTimeChange}
                mode="bedtime"
              />
              <TimePickerField
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
                style={styles.wakeUpButton}
                onPress={decrementWakeUp}
              >
                <Text style={styles.wakeUpButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.wakeUpDisplay}>
                <Clock size={20} color={colors.primary[500]} />
                <Text style={styles.wakeUpCount}>{wakeUpCount}</Text>
                <Text style={styles.wakeUpLabel}>次</Text>
              </View>
              <TouchableOpacity
                style={styles.wakeUpButton}
                onPress={incrementWakeUp}
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
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 底部保存按钮 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <GradientButton
          title="保存记录"
          onPress={handleSave}
          loading={isLoading}
          leftIcon={<Save size={20} color="#FFFFFF" />}
        />
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
  pickerContainer: {
    marginTop: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    ...shadows.sm,
  },
  iosDoneButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  iosDoneButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error.main,
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
});

export default AddRecordScreen;

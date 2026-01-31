/**
 * SleepTracker - SleepEditScreen
 * 编辑睡眠记录页面
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
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format, parseISO, isValid } from 'date-fns';

// 组件
import { QualityRating } from '../components';

// Hooks
import { useSleepRecords } from '../hooks';

// 工具
import { calculateDurationMinutes } from '../utils/dateUtils';

// 样式
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles';

// 类型
import { RootStackParamList, SleepTag } from '../types';

type SleepEditRouteProp = RouteProp<RootStackParamList, 'SleepEdit'>;

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
      pointerEvents="box-none"
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

// ==================== 时间字段组件 ====================

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
  const handlePress = useCallback(() => {
    try {
      DateTimePickerAndroid.open({
        value: value,
        mode: 'date',
        minimumDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        maximumDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        onChange: (dateEvent, selectedDate) => {
          if (dateEvent.type === 'set' && selectedDate) {
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: 'time',
              is24Hour: true,
              onChange: (timeEvent, selectedTime) => {
                if (timeEvent.type === 'set' && selectedTime) {
                  const finalDate = new Date(selectedDate);
                  finalDate.setHours(selectedTime.getHours());
                  finalDate.setMinutes(selectedTime.getMinutes());
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
  }, [value, onChange]);

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

// ==================== 标签项组件 ====================

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
}

const StatsPreview: React.FC<StatsPreviewProps> = ({ bedTime, wakeTime }) => {
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
        <Text style={styles.previewTitle}>睡眠时长</Text>
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

export const SleepEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SleepEditRouteProp>();
  const insets = useSafeAreaInsets();
  const { records, editRecord } = useSleepRecords();

  const { recordId } = route.params || {};
  const record = records.find((r) => r.id === recordId);

  // 表单状态
  const [bedTime, setBedTime] = useState<Date>(new Date());
  const [wakeTime, setWakeTime] = useState<Date>(new Date());
  const [qualityScore, setQualityScore] = useState<number>(7);
  const [selectedTags, setSelectedTags] = useState<SleepTag[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [wakeUpCount, setWakeUpCount] = useState<number>(0);

  // UI 状态
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 加载记录数据
  useEffect(() => {
    if (record) {
      setBedTime(parseISO(record.bedTime));
      setWakeTime(parseISO(record.wakeTime));
      setQualityScore(record.qualityScore);
      setSelectedTags(record.tags || []);
      setNotes(record.notes || '');
      setWakeUpCount(record.wakeUpCount || 0);
    }
  }, [record]);

  // 切换标签
  const toggleTag = useCallback((tag: SleepTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // 增加/减少醒来次数
  const incrementWakeUp = useCallback(() => {
    setWakeUpCount((prev) => prev + 1);
  }, []);

  const decrementWakeUp = useCallback(() => {
    setWakeUpCount((prev) => Math.max(0, prev - 1));
  }, []);

  // 保存修改
  const handleSave = useCallback(async () => {
    if (!record) return;

    try {
      if (wakeTime <= bedTime) {
        Alert.alert('时间错误', '起床时间必须晚于入睡时间');
        return;
      }

      const duration = calculateDurationMinutes(bedTime, wakeTime);
      if (duration < 60 || duration > 720) {
        Alert.alert('时间异常', '睡眠时长应在 1-12 小时之间');
        return;
      }

      setLoading(true);

      const updateData = {
        bedTime: bedTime.toISOString(),
        wakeTime: wakeTime.toISOString(),
        qualityScore,
        wakeUpCount,
        notes,
        tags: selectedTags,
      };

      const success = await editRecord({ id: recordId!, ...updateData });

      if (success) {
        setShowToast(true);
        setTimeout(() => {
          setLoading(false);
          navigation.goBack();
        }, 1500);
      } else {
        setLoading(false);
        Alert.alert('保存失败', '请重试');
      }
    } catch (error) {
      console.error('[ERROR] Save error:', error);
      Alert.alert('错误', '保存失败，请重试');
      setLoading(false);
    }
  }, [
    record,
    recordId,
    bedTime,
    wakeTime,
    qualityScore,
    selectedTags,
    notes,
    wakeUpCount,
    editRecord,
    navigation,
  ]);

  // 取消
  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!record) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <X size={24} color={colors.gray[600]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>编辑记录</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>记录不存在或已被删除</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleCancel}>
            <Text style={styles.emptyButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Toast visible={showToast} message="保存成功" onHide={() => setShowToast(false)} />

      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <X size={24} color={colors.gray[600]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>编辑记录</Text>
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
                onChange={setBedTime}
                mode="bedtime"
              />
              <TimeField
                label="起床时间"
                icon={<Sun size={20} color={colors.warning.main} />}
                value={wakeTime}
                onChange={setWakeTime}
                mode="waketime"
              />
            </View>
          </View>

          {/* 统计预览 */}
          <StatsPreview bedTime={bedTime} wakeTime={wakeTime} />

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
          <TagSelector selectedTags={selectedTags} onToggleTag={toggleTag} />

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
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>{loading ? '保存中...' : '保存修改'}</Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.gray[500],
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

export default SleepEditScreen;

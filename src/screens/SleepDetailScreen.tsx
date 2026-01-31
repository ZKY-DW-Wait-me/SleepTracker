/**
 * SleepTracker - SleepDetailScreen
 * 睡眠详情页面：展示单条睡眠记录的详细信息
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Moon,
  Sun,
  Clock,
  Star,
  Calendar,
  Trash2,
  Edit3,
  TrendingUp,
  Battery,
  Eye,
  Tag,
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// Hooks
import { useSleepRecords } from '../hooks';

// 样式
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles';

// 类型
import { RootStackParamList, SleepQuality, SleepTag } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SleepDetailRouteProp = RouteProp<RootStackParamList, 'SleepDetail'>;

// 影响因素标签映射
const TAG_CONFIG: Record<SleepTag, { label: string; icon: string; color: string }> = {
  caffeine: { label: '咖啡因', icon: '☕', color: '#8B4513' },
  alcohol: { label: '酒精', icon: '🍺', color: '#F59E0B' },
  exercise: { label: '运动', icon: '💪', color: '#10B981' },
  stress: { label: '压力', icon: '😰', color: '#EF4444' },
  screen: { label: '屏幕', icon: '📱', color: '#3B82F6' },
  late_meal: { label: '夜宵', icon: '🍔', color: '#F97316' },
  medication: { label: '药物', icon: '💊', color: '#8B5CF6' },
  noise: { label: '噪音', icon: '🔊', color: '#6B7280' },
  temperature: { label: '温度', icon: '🌡️', color: '#EC4899' },
  travel: { label: '旅行', icon: '✈️', color: '#06B6D4' },
};

// 影响因素标签组件
const TagBadge: React.FC<{ tag: SleepTag }> = ({ tag }) => {
  const config = TAG_CONFIG[tag];
  return (
    <View style={[styles.tagBadge, { backgroundColor: config.color + '20' }]}>
      <Text style={styles.tagIcon}>{config.icon}</Text>
      <Text style={[styles.tagLabel, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

// ==================== 评分徽章 ====================

const QualityBadge: React.FC<{ quality: SleepQuality }> = ({ quality }) => {
  const config = {
    excellent: { color: '#10B981', bgColor: '#D1FAE5', label: '优秀', icon: Star },
    good: { color: '#3B82F6', bgColor: '#DBEAFE', label: '良好', icon: TrendingUp },
    fair: { color: '#F59E0B', bgColor: '#FEF3C7', label: '一般', icon: Battery },
    poor: { color: '#EF4444', bgColor: '#FEE2E2', label: '较差', icon: Battery },
  };

  const { color, bgColor, label, icon: Icon } = config[quality];

  return (
    <View style={[styles.qualityBadge, { backgroundColor: bgColor }]}>
      <Icon size={16} color={color} />
      <Text style={[styles.qualityText, { color }]}>{label}</Text>
    </View>
  );
};

// ==================== 详情卡片 ====================

interface DetailCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
}

const DetailCard: React.FC<DetailCardProps> = ({ icon, title, value, subtitle }) => {
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailCardIcon}>{icon}</View>
      <View style={styles.detailCardContent}>
        <Text style={styles.detailCardTitle}>{title}</Text>
        <Text style={styles.detailCardValue}>{value}</Text>
        {subtitle && <Text style={styles.detailCardSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

// ==================== 时间线组件 ====================

const Timeline: React.FC<{ bedTime: string; wakeTime: string }> = ({
  bedTime,
  wakeTime,
}) => {
  const bed = parseISO(bedTime);
  const wake = parseISO(wakeTime);

  return (
    <View style={styles.timelineContainer}>
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: colors.primary[500] }]} />
        <View style={styles.timelineContent}>
          <Text style={styles.timelineLabel}>就寝时间</Text>
          <Text style={styles.timelineTime}>{format(bed, 'HH:mm')}</Text>
          <Text style={styles.timelineDate}>{format(bed, 'M月d日 EEEE', { locale: zhCN })}</Text>
        </View>
      </View>

      <View style={styles.timelineLine} />

      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: '#F59E0B' }]} />
        <View style={styles.timelineContent}>
          <Text style={styles.timelineLabel}>起床时间</Text>
          <Text style={styles.timelineTime}>{format(wake, 'HH:mm')}</Text>
          <Text style={styles.timelineDate}>{format(wake, 'M月d日 EEEE', { locale: zhCN })}</Text>
        </View>
      </View>
    </View>
  );
};

// ==================== 主页面组件 ====================

export const SleepDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SleepDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const { records, removeRecord } = useSleepRecords();

  const { recordId } = route.params;
  const record = records.find((r) => r.id === recordId);

  // 计算睡眠时长
  const getDurationText = useCallback(() => {
    if (!record) return '';
    const minutes = differenceInMinutes(parseISO(record.wakeTime), parseISO(record.bedTime));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  }, [record]);

  // 删除记录
  const handleDelete = useCallback(() => {
    if (!record) return;
    const recordDate = format(parseISO(record.bedTime), 'M月d日');

    Alert.alert(
      '删除记录？',
      `确定要删除 ${recordDate} 的睡眠记录吗？此操作不可撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const success = await removeRecord(recordId);
            if (success) {
              navigation.goBack();
            } else {
              Alert.alert('删除失败', '请重试');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [record, recordId, removeRecord, navigation]);

  // 编辑记录
  const handleEdit = useCallback(() => {
    // @ts-ignore
    navigation.navigate('SleepEdit', { recordId });
  }, [navigation, recordId]);

  // 返回上一页
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!record) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>睡眠详情</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>记录不存在或已被删除</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleGoBack}>
            <Text style={styles.emptyButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const durationMinutes = differenceInMinutes(
    parseISO(record.wakeTime),
    parseISO(record.bedTime)
  );
  const durationHours = (durationMinutes / 60).toFixed(1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 头部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>睡眠详情</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
            <Edit3 size={20} color={colors.primary[500]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Trash2 size={20} color={colors.error?.main || '#EF4444'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* 日期和评分 */}
        <View style={styles.dateSection}>
          <View style={styles.dateHeader}>
            <Calendar size={20} color={colors.primary[500]} />
            <Text style={styles.dateText}>
              {format(parseISO(record.bedTime), 'yyyy年M月d日', { locale: zhCN })}
            </Text>
          </View>
          <QualityBadge quality={record.quality} />
        </View>

        {/* 睡眠时长概览 */}
        <View style={styles.durationCard}>
          <View style={styles.durationIcon}>
            <Moon size={32} color={colors.primary[500]} />
          </View>
          <View style={styles.durationContent}>
            <Text style={styles.durationLabel}>睡眠时长</Text>
            <Text style={styles.durationValue}>{getDurationText()}</Text>
            <Text style={styles.durationSubtext}>约 {durationHours} 小时</Text>
          </View>
        </View>

        {/* 时间线 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>睡眠周期</Text>
          <View style={styles.timelineCard}>
            <Timeline bedTime={record.bedTime} wakeTime={record.wakeTime} />
          </View>
        </View>

        {/* 详细信息网格 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>详细信息</Text>
          <View style={styles.detailsGrid}>
            <DetailCard
              icon={<Moon size={20} color={colors.primary[500]} />}
              title="入睡时间"
              value={format(parseISO(record.bedTime), 'HH:mm')}
              subtitle={format(parseISO(record.bedTime), 'M月d日')}
            />
            <DetailCard
              icon={<Sun size={20} color="#F59E0B" />}
              title="醒来时间"
              value={format(parseISO(record.wakeTime), 'HH:mm')}
              subtitle={format(parseISO(record.wakeTime), 'M月d日')}
            />
            <DetailCard
              icon={<Clock size={20} color="#3B82F6" />}
              title="总时长"
              value={`${Math.floor(durationMinutes / 60)}小时`}
              subtitle={`${durationMinutes % 60}分钟`}
            />
            <DetailCard
              icon={<Star size={20} color="#8B5CF6" />}
              title="睡眠质量"
              value={
                record.quality === 'excellent'
                  ? '优秀'
                  : record.quality === 'good'
                  ? '良好'
                  : record.quality === 'fair'
                  ? '一般'
                  : '较差'
              }
              subtitle="基于睡眠时长和深度"
            />
            {/* 夜间醒来次数 */}
            <DetailCard
              icon={<Eye size={20} color="#EC4899" />}
              title="夜间醒来"
              value={`${record.wakeUpCount || 0}次`}
              subtitle={record.wakeUpCount && record.wakeUpCount > 0 ? '睡眠被打断' : '一觉到天亮'}
            />
          </View>
        </View>

        {/* 影响因素 */}
        {record.tags && record.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>影响因素</Text>
            <View style={styles.tagsCard}>
              <View style={styles.tagsList}>
                {record.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* 备注 */}
        {record.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>备注</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{record.notes}</Text>
            </View>
          </View>
        )}

        {/* 创建时间信息 */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            记录于 {format(parseISO(record.createdAt), 'yyyy-MM-dd HH:mm')}
          </Text>
        </View>
      </ScrollView>
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
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.gray[800],
  },
  headerRight: {
    width: 40,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[800],
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  qualityText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  durationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  durationContent: {
    flex: 1,
  },
  durationLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  durationValue: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.gray[800],
  },
  durationSubtext: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  timelineContainer: {
    paddingLeft: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    height: 50,
    backgroundColor: colors.gray[200],
    marginLeft: 5,
    marginVertical: spacing.xs,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  timelineTime: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.gray[800],
    marginTop: spacing.xs,
  },
  timelineDate: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detailCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  detailCardIcon: {
    marginRight: spacing.md,
  },
  detailCardContent: {
    flex: 1,
  },
  detailCardTitle: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginBottom: 2,
  },
  detailCardValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[800],
  },
  detailCardSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    marginTop: 2,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  notesText: {
    fontSize: fontSize.md,
    color: colors.gray[700],
    lineHeight: 22,
  },
  tagsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  tagIcon: {
    fontSize: 16,
  },
  tagLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  footerInfo: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
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

export default SleepDetailScreen;

/**
 * SleepTracker - HistoryScreen
 * 历史记录页面：展示所有睡眠记录列表
 * 
 * 全量重构：彻底修复数据读取逻辑
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  History,
  Trash,
  CheckCircle,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { format, parseISO, subDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 组件
import { SleepCard } from '../components';

// 样式
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles';

// 类型
import { SleepRecord } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// AsyncStorage key - 必须与保存时使用的 key 一致
const STORAGE_KEY = 'sleepRecords';

// ==================== 月份分组头部 ====================

interface SectionHeaderProps {
  title: string;
  count: number;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count }) => {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLine} />
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Text style={styles.sectionHeaderCount}>({count})</Text>
      <View style={styles.sectionHeaderLine} />
    </View>
  );
};

// ==================== 空状态组件 ====================

const EmptyState: React.FC<{ onAddPress: () => void }> = ({ onAddPress }) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <History size={48} color={colors.primary[300]} />
      </View>
      <Text style={styles.emptyTitle}>暂无睡眠记录</Text>
      <Text style={styles.emptyText}>开始记录您的第一晚睡眠吧</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAddPress}>
        <Text style={styles.emptyButtonText}>去记录</Text>
      </TouchableOpacity>
    </View>
  );
};

// ==================== 筛选标签组件 ====================

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          isActive && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ==================== 删除成功提示组件 ====================

const DeleteToast: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.deleteToast} pointerEvents="none">
      <View style={styles.deleteToastContent}>
        <CheckCircle size={16} color="#FFFFFF" />
        <Text style={styles.deleteToastText}>删除成功</Text>
      </View>
    </View>
  );
};

// ==================== 主页面组件 ====================

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 核心状态：记录列表
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'month'>('all');
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  // ========== 核心数据读取逻辑（重写）==========
  const loadData = useCallback(async () => {
    try {
      console.log('[DEBUG] HistoryScreen: Loading data from AsyncStorage...');
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('[DEBUG] HistoryScreen: Raw data:', jsonValue?.substring(0, 100));
      
      const data = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      // 按日期倒序排列（最新的在前面）
      data.sort((a: SleepRecord, b: SleepRecord) => {
        const timeA = new Date(a.bedTime || a.startTime || 0).getTime();
        const timeB = new Date(b.bedTime || b.startTime || 0).getTime();
        return timeB - timeA;
      });
      
      console.log('[DEBUG] HistoryScreen: Loaded records count:', data.length);
      setRecords(data);
    } catch (e) {
      console.error('[ERROR] HistoryScreen: Failed to load records:', e);
      setRecords([]);
    }
  }, []);

  // 使用 useFocusEffect 确保每次进入页面都刷新
  useFocusEffect(
    useCallback(() => {
      console.log('[DEBUG] HistoryScreen: Screen focused, reloading...');
      loadData();
    }, [loadData])
  );

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // ========== 过滤记录 ==========
  const filteredRecords = React.useMemo(() => {
    const now = new Date();
    
    return records.filter((record: SleepRecord) => {
      const recordDate = parseISO(record.bedTime || record.startTime);
      
      switch (selectedFilter) {
        case 'week':
          return recordDate >= subDays(now, 7);
        case 'month':
          return recordDate >= subDays(now, 30);
        default:
          return true;
      }
    });
  }, [records, selectedFilter]);

  // ========== 查看详情 ==========
  const handleViewRecord = useCallback((record: SleepRecord) => {
    // @ts-ignore
    navigation.navigate('SleepDetail', { recordId: record.id });
  }, [navigation]);

  // ========== 删除记录 ==========
  const handleDelete = useCallback((record: SleepRecord) => {
    const recordDate = format(parseISO(record.bedTime || record.startTime), 'M月d日');
    
    Alert.alert(
      '删除记录？',
      `确定要删除 ${recordDate} 的睡眠记录吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. 读取当前数据
              const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
              const allRecords = jsonValue != null ? JSON.parse(jsonValue) : [];
              
              // 2. 过滤掉要删除的记录
              const updatedRecords = allRecords.filter((r: SleepRecord) => r.id !== record.id);
              
              // 3. 保存回 AsyncStorage
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
              
              // 4. 立即更新本地状态（关键！）
              setRecords(updatedRecords);
              
              // 5. 显示成功提示
              setShowDeleteToast(true);
              setTimeout(() => setShowDeleteToast(false), 1500);
              
              console.log('[DEBUG] HistoryScreen: Deleted record:', record.id);
            } catch (error) {
              console.error('[ERROR] HistoryScreen: Failed to delete:', error);
              Alert.alert('删除失败', '请重试');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, []);

  // ========== 前往添加记录 ==========
  const handleAddRecord = useCallback(() => {
    // @ts-ignore
    navigation.navigate('MainTabs', { screen: 'Add' });
  }, [navigation]);

  // ========== 渲染列表项 ==========
  const renderItem = useCallback(({ item }: { item: SleepRecord }) => {
    return (
      <View style={styles.recordItem}>
        <TouchableOpacity
          style={styles.recordContent}
          onPress={() => handleViewRecord(item)}
          onLongPress={() => handleDelete(item)}
          delayLongPress={400}
          activeOpacity={0.8}
        >
          <SleepCard record={item} compact onPress={() => handleViewRecord(item)} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
          activeOpacity={0.6}
        >
          <Trash size={18} color={colors.error?.main || '#EF4444'} />
        </TouchableOpacity>
      </View>
    );
  }, [handleViewRecord, handleDelete]);

  // ========== 调试输出 ==========
  console.log('[DEBUG] HistoryScreen: Rendering records count:', records.length);
  console.log('[DEBUG] HistoryScreen: Filtered records count:', filteredRecords.length);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 删除成功提示 */}
      <DeleteToast visible={showDeleteToast} />

      {/* 头部 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>历史记录</Text>
          <Text style={styles.headerSubtitle}>共 {records.length} 条记录</Text>
        </View>
        <View style={styles.headerIcon}>
          <History size={24} color={colors.primary[500]} />
        </View>
      </View>

      {/* 筛选栏 */}
      <View style={styles.filterBar}>
        <View style={styles.filterChips}>
          <FilterChip
            label="全部"
            isActive={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
          />
          <FilterChip
            label="最近7天"
            isActive={selectedFilter === 'week'}
            onPress={() => setSelectedFilter('week')}
          />
          <FilterChip
            label="最近30天"
            isActive={selectedFilter === 'month'}
            onPress={() => setSelectedFilter('month')}
          />
        </View>
      </View>

      {/* 长按提示 */}
      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>长按记录可删除，点击可查看详情</Text>
      </View>

      {/* 记录列表 */}
      {filteredRecords.length > 0 ? (
        <FlatList
          data={filteredRecords}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <EmptyState onAddPress={handleAddRecord} />
      )}
    </SafeAreaView>
  );
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  deleteToast: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  deleteToastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success?.main || '#10B981',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  deleteToastText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
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
    minHeight: 60,
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
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
  },
  filterChipText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tipContainer: {
    backgroundColor: colors.primary[50],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  tipText: {
    fontSize: fontSize.xs,
    color: colors.primary[600],
    textAlign: 'center',
  },
  listContent: {
    paddingTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  sectionHeaderText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[600],
    marginHorizontal: spacing.sm,
  },
  sectionHeaderCount: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  recordContent: {
    flex: 1,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginHorizontal: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
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

export default HistoryScreen;

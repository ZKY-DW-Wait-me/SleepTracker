/**
 * SleepTracker - HistoryScreen
 * 历史记录页面：展示所有睡眠记录列表
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  History,
  Calendar,
  Filter,
  Trash2,
  ChevronRight,
  Search,
  Archive,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO, subDays, isSameDay } from 'date-fns';

// 组件
import { SleepCard } from '../components';

// Hooks
import { useSleepRecords } from '../hooks';

// 样式
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles';

// 类型
import { SleepRecord } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
        <Archive size={48} color={colors.primary[300]} />
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

// ==================== 主页面组件 ====================

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 状态
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'month'>('all');
  const [headerOpacity] = useState(new Animated.Value(0));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Hooks
  const {
    records,
    totalCount,
    loadRecords,
    removeRecord,
    batchDeleteRecords,
    isLoading,
  } = useSleepRecords();

  // 初始化
  useEffect(() => {
    loadRecords({ pagination: { page: 1, pageSize: 50 } });
    
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // 过滤记录
  const filteredRecords = useMemo(() => {
    const now = new Date();
    
    return records.filter(record => {
      const recordDate = parseISO(record.bedTime);
      
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

  // 按月份分组
  const groupedRecords = useMemo(() => {
    const groups: { title: string; data: SleepRecord[] }[] = [];
    
    filteredRecords.forEach(record => {
      const date = parseISO(record.bedTime);
      const title = format(date, 'yyyy年M月');
      
      const existingGroup = groups.find(g => g.title === title);
      if (existingGroup) {
        existingGroup.data.push(record);
      } else {
        groups.push({ title, data: [record] });
      }
    });
    
    return groups;
  }, [filteredRecords]);

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecords({ pagination: { page: 1, pageSize: 50 } });
    setRefreshing(false);
  }, []);

  // 加载更多
  const onLoadMore = useCallback(() => {
    // 实现分页加载逻辑
  }, []);

  // 查看详情
  const handleViewRecord = useCallback((record: SleepRecord) => {
    if (isSelectionMode) {
      toggleSelection(record.id);
    } else {
      // @ts-ignore
      navigation.navigate('SleepDetail', { recordId: record.id });
    }
  }, [isSelectionMode, navigation]);

  // 长按进入选择模式
  const handleLongPress = useCallback((record: SleepRecord) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds([record.id]);
    }
  }, [isSelectionMode]);

  // 切换选择
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  // 退出选择模式
  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  }, []);

  // 删除选中项
  const handleDeleteSelected = useCallback(() => {
    Alert.alert(
      '确认删除',
      `确定要删除选中的 ${selectedIds.length} 条记录吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await batchDeleteRecords(selectedIds);
            exitSelectionMode();
          },
        },
      ]
    );
  }, [selectedIds, batchDeleteRecords, exitSelectionMode]);

  // 删除单条记录
  const handleDeleteRecord = useCallback((record: SleepRecord) => {
    Alert.alert(
      '确认删除',
      `确定要删除 ${format(parseISO(record.bedTime), 'M月d日')} 的睡眠记录吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => removeRecord(record.id),
        },
      ]
    );
  }, [removeRecord]);

  // 前往添加记录
  const handleAddRecord = useCallback(() => {
    // @ts-ignore
    navigation.navigate('MainTabs', { screen: 'Add' });
  }, [navigation]);

  // 渲染列表项
  const renderItem = useCallback(({ item, index }: { item: SleepRecord; index: number }) => {
    const isSelected = selectedIds.includes(item.id);
    
    return (
      <View style={[styles.recordItem, isSelected && styles.recordItemSelected]}>
        <TouchableOpacity
          style={styles.recordContent}
          onPress={() => handleViewRecord(item)}
          onLongPress={() => handleLongPress(item)}
          delayLongPress={500}
          activeOpacity={0.8}
        >
          <SleepCard record={item} compact onPress={() => handleViewRecord(item)} />
        </TouchableOpacity>
        
        {isSelectionMode && (
          <TouchableOpacity
            style={[
              styles.selectionIndicator,
              isSelected && styles.selectionIndicatorActive,
            ]}
            onPress={() => toggleSelection(item.id)}
          >
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        )}
      </View>
    );
  }, [selectedIds, isSelectionMode, handleViewRecord, handleLongPress, toggleSelection]);

  // 渲染分组头部
  const renderSectionHeader = useCallback((title: string, count: number) => (
    <SectionHeader title={title} count={count} />
  ), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 头部 */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerOpacity },
        ]}
      >
        {isSelectionMode ? (
          <>
            <TouchableOpacity onPress={exitSelectionMode}>
              <Text style={styles.headerAction}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>已选择 {selectedIds.length} 项</Text>
            <TouchableOpacity onPress={handleDeleteSelected}>
              <Text style={[styles.headerAction, styles.headerActionDanger]}>
                删除
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View>
              <Text style={styles.headerTitle}>历史记录</Text>
              <Text style={styles.headerSubtitle}>共 {totalCount} 条记录</Text>
            </View>
            <View style={styles.headerIcon}>
              <History size={24} color={colors.primary[500]} />
            </View>
          </>
        )}
      </Animated.View>

      {/* 筛选栏 */}
      {!isSelectionMode && (
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
      )}

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
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
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
  headerAction: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.primary[500],
    paddingHorizontal: spacing.sm,
  },
  headerActionDanger: {
    color: colors.error.main,
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
  },
  recordItemSelected: {
    backgroundColor: colors.primary[50],
  },
  recordContent: {
    flex: 1,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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

/**
 * SleepTracker - HistoryScreen
 * 历史记录页面：展示所有睡眠记录列表
 * 支持：下拉刷新、筛选、长按删除单条记录
 * 
 * 修复：使用 useFocusEffect 强制刷新，修复删除后 UI 不更新问题
 */

import React, { useState, useCallback, useMemo } from 'react';
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
  Trash,
  CheckCircle,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { format, parseISO, subDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 组件
import { SleepCard } from '../components';

// Hooks
import { useSleepRecords } from '../hooks';

// 样式
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles';

// 类型
import { SleepRecord } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// AsyncStorage key
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
  
  // 状态
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'month'>('all');
  const [headerOpacity] = useState(new Animated.Value(1));
  const [localRecords, setLocalRecords] = useState<SleepRecord[]>([]);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  // Hooks
  const {
    loadRecords,
    removeRecord,
  } = useSleepRecords();

  // 从 AsyncStorage 直接读取数据（强制刷新）
  const loadDataFromStorage = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 按时间倒序排列
        const sorted = parsed.sort((a: SleepRecord, b: SleepRecord) => 
          new Date(b.bedTime).getTime() - new Date(a.bedTime).getTime()
        );
        setLocalRecords(sorted);
      } else {
        setLocalRecords([]);
      }
    } catch (error) {
      console.error('[ERROR] Failed to load records:', error);
    }
  }, []);

  // 使用 useFocusEffect 确保每次进入页面都强制刷新数据
  useFocusEffect(
    useCallback(() => {
      console.log('[DEBUG] HistoryScreen focused, reloading data...');
      loadDataFromStorage();
      
      // 头部动画
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      return () => {
        // 清理工作（如果需要）
      };
    }, [])
  );

  // 过滤记录
  const filteredRecords = useMemo(() => {
    const now = new Date();
    
    return localRecords.filter(record => {
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
  }, [localRecords, selectedFilter]);

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
    await loadDataFromStorage();
    setRefreshing(false);
  }, [loadDataFromStorage]);

  // 查看详情
  const handleViewRecord = useCallback((record: SleepRecord) => {
    // @ts-ignore
    navigation.navigate('SleepDetail', { recordId: record.id });
  }, [navigation]);

  // 显示删除成功提示
  const showDeleteSuccess = useCallback(() => {
    setShowDeleteToast(true);
    setTimeout(() => {
      setShowDeleteToast(false);
    }, 1500);
  }, []);

  // 长按删除单条记录（修复版）
  const handleLongPress = useCallback((record: SleepRecord) => {
    const recordDate = format(parseISO(record.bedTime), 'M月d日');
    
    Alert.alert(
      '删除记录？',
      `确定要删除 ${recordDate} 的睡眠记录吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[DEBUG] Deleting record:', record.id);
              
              // 1. 从 AsyncStorage 读取记录
              const stored = await AsyncStorage.getItem(STORAGE_KEY);
              if (!stored) return;
              
              const allRecords: SleepRecord[] = JSON.parse(stored);
              
              // 2. 过滤掉要删除的记录
              const updatedRecords = allRecords.filter(r => r.id !== record.id);
              
              // 3. 写回 AsyncStorage
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
              console.log('[DEBUG] AsyncStorage updated');
              
              // 4. 【关键】立即更新本地状态，强制触发列表重绘
              setLocalRecords(updatedRecords.sort((a, b) => 
                new Date(b.bedTime).getTime() - new Date(a.bedTime).getTime()
              ));
              
              // 5. 同时调用 hook 的删除方法保持同步（不阻塞）
              removeRecord(record.id).catch(() => {});
              
              // 6. 显示删除成功提示
              showDeleteSuccess();
              
              console.log('[DEBUG] Record deleted successfully:', record.id);
            } catch (error) {
              console.error('[ERROR] Failed to delete record:', error);
              Alert.alert('删除失败', '请重试');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [removeRecord, showDeleteSuccess]);

  // 前往添加记录
  const handleAddRecord = useCallback(() => {
    // @ts-ignore
    navigation.navigate('MainTabs', { screen: 'Add' });
  }, [navigation]);

  // 渲染列表项
  const renderItem = useCallback(({ item }: { item: SleepRecord }) => {
    return (
      <View style={styles.recordItem}>
        <TouchableOpacity
          style={styles.recordContent}
          onPress={() => handleViewRecord(item)}
          onLongPress={() => handleLongPress(item)}
          delayLongPress={400}
          activeOpacity={0.8}
        >
          <SleepCard record={item} compact onPress={() => handleViewRecord(item)} />
        </TouchableOpacity>
        
        {/* 删除按钮 */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleLongPress(item)}
          activeOpacity={0.6}
        >
          <Trash size={18} color={colors.error?.main || '#EF4444'} />
        </TouchableOpacity>
      </View>
    );
  }, [handleViewRecord, handleLongPress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 删除成功提示 */}
      <DeleteToast visible={showDeleteToast} />

      {/* 头部 */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerOpacity },
        ]}
      >
        <View>
          <Text style={styles.headerTitle}>历史记录</Text>
          <Text style={styles.headerSubtitle}>共 {localRecords.length} 条记录</Text>
        </View>
        <View style={styles.headerIcon}>
          <History size={24} color={colors.primary[500]} />
        </View>
      </Animated.View>

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
          extraData={localRecords} // 确保列表在数据变化时重新渲染
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

/**
 * SleepTracker - 导航配置
 * 配置应用的堆栈导航和底部标签导航
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';

// 图标
import {
  Home,
  BarChart3,
  PlusCircle,
  History,
  Settings,
} from 'lucide-react-native';

// 屏幕
import {
  HomeScreen,
  AddRecordScreen,
  StatisticsScreen,
  HistoryScreen,
  SettingsScreen,
} from '../screens';

// 类型
import { MainTabParamList, RootStackParamList } from '../types';

// 样式
import { colors, spacing, fontSize, shadows } from '../styles';

// ==================== 导航器配置 ====================

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();



/**
 * 底部标签导航栏
 */
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        // 禁用 Tab 切换动画，避免与屏幕内动画冲突
        animationEnabled: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          tabBarLabel: '统计',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddRecordScreen}
        options={{
          tabBarLabel: '记录',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: '历史',
          tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '设置',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * 根堆栈导航器
 */
export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.gray[50] },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator}
          options={{
            animationEnabled: true,
            animationTypeForReplace: 'push',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    height: 60,
    paddingBottom: spacing.xs,
    ...shadows.lg,
  },
  tabBarLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary[500],
  },
  addButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonWrapper: {
    position: 'relative',
    marginTop: -20,
  },
  addButtonShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.primary[500] + '40',
    borderRadius: 28,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.gray[50],
    ...shadows.lg,
  },
});

export default AppNavigator;

/**
 * SleepTracker - AboutScreen
 * 关于应用页面（仿微信"关于"风格）
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, Moon, Shield, Smartphone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { colors, spacing, fontSize, borderRadius } from '../styles';
import { RootStackParamList } from '../types';
import AppConfig from '../config';

// App 图标
const appIcon = require('../assets/images/app_icon.png');

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />

      {/* 返回按钮 */}
      <View style={[styles.headerBar, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.6}
        >
          <ArrowLeft size={24} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>

      {/* 顶部 Logo 区域 */}
      <View style={styles.logoArea}>
        <Image source={appIcon} style={styles.appIcon} />
        <Text style={styles.appName}>SleepTracker</Text>
        <Text style={styles.versionText}>Version {AppConfig.APP_VERSION}</Text>
      </View>

      {/* 功能列表 */}
      <View style={styles.listContainer}>
        <TouchableOpacity
          style={styles.listItem}
          activeOpacity={0.5}
          onPress={() => setShowFeatureModal(true)}
        >
          <Text style={styles.listItemText}>功能介绍</Text>
          <ChevronRight size={18} color={colors.gray[400]} />
        </TouchableOpacity>

        <View style={styles.listDivider} />

        <TouchableOpacity
          style={styles.listItem}
          activeOpacity={0.5}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <Text style={styles.listItemText}>隐私政策</Text>
          <ChevronRight size={18} color={colors.gray[400]} />
        </TouchableOpacity>

        <View style={styles.listDivider} />

        <TouchableOpacity
          style={styles.listItem}
          activeOpacity={0.5}
          onPress={() => navigation.navigate('License')}
        >
          <Text style={styles.listItemText}>开源协议</Text>
          <ChevronRight size={18} color={colors.gray[400]} />
        </TouchableOpacity>
      </View>

      {/* 底部备案与版权 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        {AppConfig.APP_ICP_NUMBER ? (
          <Text style={styles.footerText}>
            ICP 备案号：{AppConfig.APP_ICP_NUMBER}
          </Text>
        ) : null}
        {AppConfig.APP_POLICE_RECORD ? (
          <Text style={styles.footerText}>
            {AppConfig.APP_POLICE_RECORD}
          </Text>
        ) : null}
        <Text style={styles.footerText}>
          © 2026 {AppConfig.APP_DEVELOPER_NAME}. Under {AppConfig.APP_LICENSE}.
        </Text>
      </View>

      {/* 功能介绍自定义弹窗 */}
      <Modal
        visible={showFeatureModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFeatureModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFeatureModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <Text style={styles.modalTitle}>功能介绍</Text>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <Moon size={18} color={colors.primary[500]} />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureLabel}>睡眠记录</Text>
                <Text style={styles.featureDesc}>记录入睡与起床时间，追踪每日睡眠质量</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <Smartphone size={18} color={colors.primary[500]} />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureLabel}>统计分析</Text>
                <Text style={styles.featureDesc}>生成统计图表，帮助您建立健康的睡眠习惯</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <Shield size={18} color={colors.primary[500]} />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureLabel}>隐私保护</Text>
                <Text style={styles.featureDesc}>所有数据均存储在本地，保护您的隐私安全</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.7}
              onPress={() => setShowFeatureModal(false)}
            >
              <Text style={styles.modalButtonText}>我知道了</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headerBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoArea: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  versionText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
  },
  listItemText: {
    fontSize: fontSize.md,
    color: colors.gray[800],
  },
  listDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray[200],
    marginLeft: spacing.lg,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    lineHeight: 20,
    textAlign: 'center',
  },
  // 自定义弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gray[800],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    lineHeight: 20,
  },
  modalButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AboutScreen;

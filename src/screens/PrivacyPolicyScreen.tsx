/**
 * SleepTracker - PrivacyPolicyScreen
 * 隐私政策展示页面
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// 样式
import { colors, spacing, fontSize, borderRadius } from '../styles';

// ==================== 隐私政策文本内容 ====================

const PRIVACY_POLICY_SECTIONS: {
  title: string;
  content: string;
  highlight?: boolean;
}[] = [
  {
    title: '前言',
    content:
      'SleepTracker（以下简称"本应用"）是一款由ZKY开发的睡眠记录工具。我们非常重视用户的隐私保护，本政策旨在向您说明本应用如何处理您的信息。\n\n重要说明：本应用为单机版应用。除非您主动联系开发者，本应用不会通过网络收集、传输或共享您的任何个人数据。',
  },
  {
    title: '一、我们如何收集和使用信息',
    content:
      '1. 用户主动输入的信息：为了实现核心功能（记录睡眠），本应用会记录您手动输入的入睡时间、起床时间及睡眠感受。这些数据仅用于在本应用内为您生成睡眠统计图表。\n\n2. 设备权限说明：\n   • 存储权限：我们可能需要读写设备存储空间，用于在您手机本地保存睡眠记录数据库。\n   • 我们不会获取：您的地理位置、通讯录、短信、通话记录、IMEI或任何其他与功能无关的隐私权限。',
  },
  {
    title: '二、我们如何存储信息',
    content:
      '1. 存储位置：您的所有睡眠记录数据均存储在您手机本地的私有目录中。\n\n2. 存储期限：除非您手动删除数据或卸载本应用，否则数据将一直保存在您的设备上。一旦卸载应用，所有存在本地的数据将无法找回。\n\n3. 数据安全性：由于数据不上传至服务器，您的个人隐私安全主要由您的设备安全决定。建议您保护好手机，防止他人未经授权查看。',
  },
  {
    title: '三、我们如何共享、转让、公开披露信息',
    content:
      '1. 共享与转让：我们不会与任何公司、组织或个人共享您的个人信息。\n\n2. 第三方插件：本应用不集成任何第三方广告、统计或分析类 SDK（软件开发工具包），因此不存在第三方收集您信息的情况。',
  },
  {
    title: '四、您如何管理自己的信息',
    content:
      '您可以随时在应用内：\n1. 修改或删除任何一笔睡眠记录。\n2. 通过清理应用缓存或卸载应用来清除所有本地数据。',
  },
  {
    title: '五、未成年人保护',
    content:
      '本应用不对未成年人收集任何特殊信息。如您是未成年人，建议在监护人指导下使用本工具。',
  },
  {
    title: '六、政策的变更',
    content:
      '我们可能会适时更新本隐私政策。当政策发生较大变化时，我们会在应用内通过弹窗或显著位置进行告知。',
  },
  {
    title: '【特别提示：关于本地存储机制】',
    highlight: true,
    content:
      '本应用采用 Android 系统标准的私有目录存储技术（Internal Storage）。根据相关法律法规及系统权限规范，应用在自身私有目录下读写功能产生的必要数据（如睡眠记录数据库）无需调用系统级"存储权限"弹窗。\n\n您点击"同意"即代表您已知悉并授权应用使用其私有目录空间。我们承诺不会扫描、读取、修改您私有目录之外的任何文件（如您的相册、文档或其他应用的数据）。',
  },
  {
    title: '七、如何联系我们',
    content:
      '如果您对本隐私政策或您的个人信息保护有任何疑问，请通过以下方式联系开发者：\n\n邮箱：chefzky@gmail.com',
  },
];

// ==================== 主页面组件 ====================

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 头部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>隐私政策</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* 内容区域 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 标题 */}
        <Text style={styles.policyTitle}>SleepTracker 隐私政策</Text>
        <Text style={styles.policyDate}>生效日期：2025年2月11日</Text>

        {/* 各节内容 */}
        {PRIVACY_POLICY_SECTIONS.map((section, index) => (
          <View key={index} style={[styles.section, section.highlight && styles.sectionHighlight]}>
            <Text style={[styles.sectionTitle, section.highlight && styles.sectionTitleRed]}>{section.title}</Text>
            <Text style={[styles.sectionContent, section.highlight && styles.sectionContentRed]}>{section.content}</Text>
          </View>
        ))}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.gray[800],
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  policyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gray[800],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  policyDate: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  sectionContent: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: 22,
  },
  sectionHighlight: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  sectionTitleRed: {
    color: '#DC2626',
  },
  sectionContentRed: {
    color: '#DC2626',
    fontWeight: '600',
  },
});

export default PrivacyPolicyScreen;

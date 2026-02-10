/**
 * SleepTracker - LicenseScreen
 * 开源协议展示页面
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

import { colors, spacing, fontSize, borderRadius } from '../styles';

export const LicenseScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>开源协议</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.licenseTitle}>GNU General Public License v3.0</Text>
          <Text style={styles.licenseSubtitle}>Version 3, 29 June 2007</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>协议概述</Text>
          <Text style={styles.sectionText}>
            SleepTracker 采用 GNU General Public License v3.0（GPLv3）开源协议发布。这意味着：
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>您可以</Text>
          <Text style={styles.bulletItem}>{'  \u2022  '}自由使用本软件，用于任何目的</Text>
          <Text style={styles.bulletItem}>{'  \u2022  '}自由查看、学习本软件的源代码</Text>
          <Text style={styles.bulletItem}>{'  \u2022  '}自由修改本软件以满足您的需求</Text>
          <Text style={styles.bulletItem}>{'  \u2022  '}自由分发本软件的原始或修改版本</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>您必须</Text>
          <Text style={styles.bulletItem}>{'  \u2022  '}在分发时保留原始版权声明和许可证</Text>
          <Text style={styles.bulletItem}>{'  \u2022  '}以相同的 GPLv3 协议发布修改后的版本</Text>
          <Text style={styles.bulletItem}>{'  \u2022  '}公开修改后版本的完整源代码</Text>
          <Text style={styles.bulletItem}>{'  \u2022  '}明确标注您对原始代码所做的更改</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>免责声明</Text>
          <Text style={styles.sectionText}>
            本软件按"现状"提供，不附带任何明示或暗示的保证，包括但不限于对适销性和特定用途适用性的暗示保证。在任何情况下，版权持有人或贡献者均不对因使用本软件而产生的任何直接、间接、偶然、特殊或后果性损害承担责任。
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>版权信息</Text>
          <Text style={styles.sectionText}>
            Copyright (C) 2026 ZKY-DW-Wait-me{'\n\n'}
            本程序为自由软件：您可以根据自由软件基金会发布的 GNU 通用公共许可证（第3版或更高版本）对其进行再分发和/或修改。{'\n\n'}
            完整的 GPLv3 协议全文请访问：{'\n'}
            https://www.gnu.org/licenses/gpl-3.0.html
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  licenseTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[800],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  licenseSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  sectionText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: 22,
  },
  bulletItem: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: 26,
  },
});

export default LicenseScreen;

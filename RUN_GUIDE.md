# SleepTracker - 运行指南

## 📱 应用介绍

SleepTracker 是一款商业级睡眠管理专家 App，拥有完整的睡眠记录、统计分析和用户管理功能。

## ✅ 第二阶段完成清单

### 核心功能模块

| 模块 | 功能描述 | 状态 |
|------|----------|------|
| App.tsx | 入口文件，含初始化动画和数据库检查 | ✅ |
| 导航配置 | Tab + Stack 导航，5个主要页面 | ✅ |
| 组件库 | SleepCard, QualityRating, StyledButton, ChartWrapper | ✅ |
| HomeScreen | 睡眠圆环、快捷按钮、趋势图 | ✅ |
| AddRecordScreen | 时间选择器、质量评分、标签选择 | ✅ |
| StatisticsScreen | 周/月/季图表、质量分布、最佳记录 | ✅ |
| HistoryScreen | 历史列表、筛选、批量删除 | ✅ |
| SettingsScreen | 目标设置、深色模式、数据导出CSV | ✅ |

## 📁 项目结构

```
src/
├── components/           # UI 组件库 (1,606 行)
│   ├── ChartWrapper.tsx     # 图表包装组件
│   ├── QualityRating.tsx    # 滑动质量评分
│   ├── SleepCard.tsx        # 睡眠记录卡片
│   └── StyledButton.tsx     # 霓虹感按钮
├── screens/             # 页面组件 (3,228 行)
│   ├── AddRecordScreen.tsx  # 添加记录页面
│   ├── HistoryScreen.tsx    # 历史记录页面
│   ├── HomeScreen.tsx       # 首页
│   ├── SettingsScreen.tsx   # 设置页面
│   └── StatisticsScreen.tsx # 统计页面
├── navigation/          # 导航配置 (185 行)
├── store/               # Redux 状态管理 (1,371 行)
├── services/            # 数据库服务 (1,023 行)
├── hooks/               # 自定义 Hooks (605 行)
├── utils/               # 工具函数 (848 行)
├── types/               # 类型定义 (759 行)
└── styles/              # 样式系统 (709 行)
```

## 📊 代码统计

- **总文件数**: 28
- **总代码行数**: 10,040+ 行
- **TypeScript 覆盖率**: 100%

## 🚀 运行步骤

### 1. 安装依赖

```bash
cd SleepTracker
npm install
# 或
yarn install
```

### 2. 安装日期选择器 (重要)

```bash
npm install @react-native-community/datetime-picker
# 对于 iOS 需要额外步骤:
cd ios && pod install
```

### 3. 启动 Metro 服务

```bash
npm start
# 或
yarn start
```

### 4. 运行应用

**Android:**
```bash
npm run android
# 或
yarn android
```

**iOS:**
```bash
npm run ios
# 或
yarn ios
```

## 🎨 功能预览

### 首页 (HomeScreen)
- 🔵 深蓝紫渐变启动页
- 📊 圆形睡眠进度指示器
- 📈 最近7天趋势小图表
- ✨ 快捷记录按钮（霓虹效果）

### 记录页 (AddRecordScreen)
- ⏰ 日期时间选择器
- ⭐ 滑动质量评分（带表情）
- 🏷️ 影响因素标签选择
- 📝 备注输入

### 统计页 (StatisticsScreen)
- 📊 周/月/季切换
- 📈 折线图趋势
- 🥧 睡眠质量分布
- 🏆 最佳记录展示

### 历史页 (HistoryScreen)
- 📋 紧凑列表视图
- 🔍 时间筛选（7天/30天/全部）
- ✔️ 批量选择删除

### 设置页 (SettingsScreen)
- 🎯 睡眠目标设定
- 🌙 深色模式切换
- 💾 CSV 数据导出
- 🗑️ 数据清空/重置

## 🛠 技术栈

- **React Native 0.83.1** - 跨平台框架
- **TypeScript 5.8.3** - 类型安全
- **Redux Toolkit 2.11.2** - 状态管理
- **React Navigation 7.x** - 导航路由
- **SQLite** - 本地数据库存储
- **react-native-chart-kit** - 图表库
- **lucide-react-native** - 图标库

## 📱 界面截图说明

由于无法直接显示截图，以下是各页面关键 UI 元素描述：

**启动页:**
- 深蓝紫渐变背景 (#0F172A)
- 睡眠图标 💤 带呼吸动画
- 进度条加载动画

**首页:**
- 顶部问候语和日期
- 中央圆形进度环（显示今日睡眠时长）
- 底部渐变按钮"记录睡眠"
- 统计卡片网格（平均睡眠、连续达标、记录天数）

**记录页:**
- 两个时间选择卡片（入睡/起床）
- 质量评分滑块（1-10，带5个表情等级）
- 标签网格（10个影响因素）
- 底部固定保存按钮

**统计页:**
- 4个统计卡片（平均睡眠、平均质量、目标达成、记录天数）
- 折线图展示睡眠趋势
- 柱状图展示质量分布
- 最佳记录卡片（深蓝紫渐变）

**设置页:**
- 分组列表样式
- 开关控件（智能提醒、睡眠分析、深色模式、24小时制）
- 危险操作区（红色图标）
- 模态框编辑睡眠目标

## 🔧 故障排除

### Metro 服务无法启动
```bash
npx react-native start --reset-cache
```

### Android 构建失败
```bash
cd android
./gradlew clean
```

### iOS 构建失败
```bash
cd ios
pod deintegrate
pod install
```

### 数据库错误
应用会在启动时自动初始化数据库，如遇问题：
1. 清除应用数据
2. 重新启动应用
3. 检查日志输出

## 📝 更新日志

### v1.0.0 (第二阶段完成)
- ✅ 完成全部 UI 组件和页面
- ✅ 集成 Redux 状态管理
- ✅ 实现 SQLite 数据持久化
- ✅ 添加图表统计功能
- ✅ 支持 CSV 数据导出
- ✅ 深色模式支持
- ✅ 完整的动画效果

## 📄 许可证

MIT License

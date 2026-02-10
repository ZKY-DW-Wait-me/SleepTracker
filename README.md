# 🌙 SleepTracker (睡眠追踪器)

> 您的个人睡眠健康管家，基于 React Native 开发，安全、隐私、无广告。

---

## 📱 给用户的使用指南 (User Guide)

### 🎯 产品介绍
SleepTracker 是一款专注于睡眠记录与分析的工具。我们相信，优质的睡眠始于精准的记录。不同于市面上臃肿的 App，SleepTracker 坚持**数据本地化**，所有记录存储在您手机的加密数据库中，无需联网，保护您的隐私。

### ✨ 核心功能
*   **⚡ 极速记录**：只需几秒即可记录入睡、起床时间及睡眠质量。
*   **📊 深度分析**：自动计算睡眠时长、生成周趋势图表，识别您的睡眠规律。
*   **🏷️ 影响因素**：标记睡前行为（如饮酒、运动、压力），帮您找到失眠元凶。
*   **🌓 昼夜模式**：清爽的日间模式与护眼的夜间模式自动切换。
*   **🔒 数据安全**：内置 SQLite 数据库，数据完全掌握在自己手中。

### 📥 如何安装
1.  下载最新版本的 `.apk` 文件（当前最新：**v1.1.3**）。
2.  在 Android 手机上打开文件并允许安装。
3.  **注意**：版本更新不会丢失数据，可以放心覆盖安装。

---

## 🛠️ 给开发者的文档 (Developer Guide)

### 📋 技术栈
该项目采用现代 React Native 架构开发，注重性能与代码规范。

*   **核心框架**: React Native 0.83.1 (New Architecture Enabled)
*   **语言**: TypeScript 5.8.3
*   **状态管理**: Redux Toolkit (全局状态) + React Redux
*   **数据持久化**: SQLite (本地数据库) + AsyncStorage (轻量配置)
*   **导航**: React Navigation v7 (Native Stack)
*   **UI 组件**: Lucide Icons, SVG Charts, Lottie

### 🚀 快速开始

**环境要求**
*   Node.js >= 20
*   Android Studio / Xcode
*   Java/JDK 17

**安装依赖**
```bash
npm install
# 或
yarn install
```

**运行项目**
```bash
# 启动 Metro 服务
npm start

# 运行 Android
npm run android
```

### 📁 项目结构
```text
src/
├── components/   # 通用 UI 组件 (QualityRating, SleepCard等)
├── screens/      # 页面级组件 (Home, History, Detail, Edit等)
├── navigation/   # 路由配置
├── store/        # Redux Slice 定义
├── services/     # 数据库操作层 (SQLite)
├── hooks/        # 自定义 Hooks (useSleepRecords等)
└── utils/        # 工具函数
```

### 📝 版本历史
请见 [CHANGELOG.md](CHANGELOG.md)

### 🔄 维护说明
**
这是一个长期维护的项目，欢迎大家提出建议和issue反馈。我会长期维护这个项目，修复bug，添加新功能。
本项目早期开发阶段版本迭代较快，自 v1.1.3 起将严格遵守语义化版本规范。
**
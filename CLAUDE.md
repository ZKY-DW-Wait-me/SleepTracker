# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SleepTracker (睡眠追踪器) is a bare React Native mobile app for tracking sleep patterns. All UI text and source code comments are in **Simplified Chinese** — maintain this convention when modifying code.

- React Native 0.83.1, React 19.2.0, TypeScript 5.8.3
- New Architecture enabled (Fabric + TurboModules), Hermes engine
- Package manager: **npm** (no yarn.lock)
- Node.js >= 20, JDK 17

## Commands

```bash
npm start          # Start Metro bundler
npm run android    # Build and run on Android
npm run ios        # Build and run on iOS
npm test           # Run Jest tests
npm run lint       # Run ESLint

# After adding native dependencies:
cd android && ./gradlew clean          # Android
cd ios && bundle exec pod install      # iOS
```

## Architecture

### Data Flow

Screens → Custom Hooks (`useSleepRecords`, `useSettings`) → Redux Async Thunks → SQLite Database Service → Redux State → Components re-render via `useAppSelector`

### Key Layers

- **`src/services/database.ts`** — SQLite service (singleton connection). All operations return `DatabaseQueryResult<T>` with `{ success, data?, error? }`. Always check `success` before accessing data.
- **`src/store/`** — Redux Toolkit store with two slices:
  - `sleepSlice.ts` — sleep records, today's record, statistics, optimistic update actions
  - `settingsSlice.ts` — user preferences, theme, reminders, goals
  - Custom middleware: dev-only logger, error catcher
- **`src/hooks/`** — `useAppDispatch`/`useAppSelector` (typed Redux hooks), `useSleepRecords`, `useSettings` (business logic wrappers)
- **`src/types/index.ts`** — Centralized type definitions (~800 lines). All interfaces live here.
- **`src/navigation/index.tsx`** — Root Stack (MainTabs, SleepDetail, SleepEdit) wrapping a Bottom Tab navigator (Home, Statistics, Add, History, Settings)

### App Initialization

`App.tsx` wraps: `ErrorBoundary > GestureHandlerRootView > SafeAreaProvider > ReduxProvider > AppInitializer > AppNavigator`. The `AppInitializer` component handles database initialization with a loading screen before rendering the main app.

### Database Schema

Three SQLite tables:
1. **`sleep_records`** — 18 columns (id, bed_time, wake_time, quality_score, duration, deep/light/REM sleep, notes, tags as JSON, etc.)
2. **`user_settings`** — Single-row (id=1), JSON columns for nested objects
3. **`statistics_cache`** — Cached statistics with expiration timestamps

Record IDs are generated as `record_{timestamp}_{random9chars}`.

## Conventions

- All comments and UI strings in **Chinese (简体中文)**; variable names in English camelCase
- Functional components only, with hooks
- Barrel exports (`index.ts`) in every module directory
- Database operations must go through async thunks in Redux slices, never called directly from components
- Prettier: single quotes, trailing commas, no parens on single-param arrows
- Use `date-fns` for date manipulation, ISO 8601 for storage
- Use `useNativeDriver: true` for all animations
- When adding native modules, ensure TurboModules/Fabric compatibility (New Architecture)

## Build Notes

- Android uses **Aliyun Maven mirrors** in `android/build.gradle` (for faster builds in China). Switch to default repos if building outside China.
- Android target architectures: armeabi-v7a, arm64-v8a, x86, x86_64
- Gradle JVM: `-Xmx2048m -XX:MaxMetaspaceSize=512m`

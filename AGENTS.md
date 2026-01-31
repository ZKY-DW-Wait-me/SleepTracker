# SleepTracker - AI Agent Documentation

## Project Overview

SleepTracker (睡眠追踪器) is a commercial-grade React Native mobile application for tracking sleep patterns and managing sleep health. The app provides comprehensive sleep recording, statistical analysis, trend visualization, and personalized recommendations.

**Key Characteristics:**
- **Framework**: React Native 0.83.1 with React 19.2.0
- **Language**: TypeScript 5.8.3 (with Chinese comments in source code)
- **Platforms**: Android (API 24+) and iOS
- **Architecture**: New Architecture enabled (Fabric Renderer + TurboModules)
- **JS Engine**: Hermes
- **App Version**: 1.0.1

## Technology Stack

### Core Framework
- React Native 0.83.1
- React 19.2.0
- TypeScript 5.8.3

### State Management
- Redux Toolkit (@reduxjs/toolkit) for global state
- React Redux (react-redux) for React bindings
- Async Storage (@react-native-async-storage/async-storage) for persistence

### Navigation
- React Navigation v7 (@react-navigation/native)
- Bottom Tabs Navigator (@react-navigation/bottom-tabs)
- Stack Navigator (@react-navigation/stack)

### UI Components & Styling
- Lucide React Native (lucide-react-native) for icons
- React Native Vector Icons (react-native-vector-icons)
- React Native Safe Area Context (react-native-safe-area-context)
- React Native Screens (react-native-screens)
- React Native Gesture Handler (react-native-gesture-handler)

### Data & Visualization
- SQLite Storage (react-native-sqlite-storage) for local database
- React Native Chart Kit (react-native-chart-kit) for charts
- React Native SVG (react-native-svg) for SVG support
- date-fns for date manipulation

### Form Components
- React Native Community DateTimePicker (@react-native-community/datetimepicker)

## Project Structure

```
SleepTracker/
├── App.tsx                    # Main application component with ErrorBoundary
├── index.js                   # Entry point
├── app.json                   # App configuration (name: SleepTracker)
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── babel.config.js            # Babel configuration
├── metro.config.js            # Metro bundler configuration
├── jest.config.js             # Jest test configuration
├── .eslintrc.js               # ESLint configuration
├── .prettierrc.js             # Prettier formatting rules
├── android/                   # Android native project
│   ├── app/                   # Android app module
│   ├── build.gradle           # Root build configuration
│   ├── settings.gradle        # Project settings
│   └── gradle.properties      # Build properties (New Arch enabled)
├── ios/                       # iOS native project
│   ├── SleepTracker/          # iOS app source
│   ├── SleepTracker.xcodeproj/# Xcode project
│   └── Podfile                # CocoaPods dependencies
├── __tests__/                 # Test files
│   └── App.test.tsx           # Basic render test
├── .bundle/                   # Bundler configuration
└── src/                       # Source code directory
    ├── assets/                # Static assets
    │   ├── fonts/             # Custom fonts
    │   └── images/            # Image assets
    ├── components/            # Reusable UI components
    │   ├── ChartWrapper.tsx   # Chart components (SleepTrendChart, etc.)
    │   ├── ErrorBoundary.tsx  # Error boundary component
    │   ├── QualityRating.tsx  # Quality rating input component
    │   ├── SleepCard.tsx      # Sleep record card component
    │   ├── StyledButton.tsx   # Button variants (Primary, Secondary, etc.)
    │   └── index.ts           # Barrel export
    ├── hooks/                 # Custom React hooks
    │   ├── useAppDispatch.ts  # Typed dispatch hook
    │   ├── useAppSelector.ts  # Typed selector hook
    │   ├── useSettings.ts     # Settings management hook
    │   ├── useSleepRecords.ts # Sleep records data hook
    │   └── index.ts           # Barrel export
    ├── navigation/            # Navigation configuration
    │   ├── index.tsx          # AppNavigator (Stack + Tab navigators)
    │   └── MainTabNavigator   # Bottom tab navigator (Home, Stats, Add, History, Settings)
    ├── screens/               # Screen components
    │   ├── HomeScreen.tsx     # Home/dashboard screen
    │   ├── AddRecordScreen.tsx# Add sleep record screen
    │   ├── StatisticsScreen.tsx # Statistics visualization screen
    │   ├── HistoryScreen.tsx  # Sleep history list screen
    │   ├── SettingsScreen.tsx # App settings screen
    │   ├── SleepDetailScreen.tsx # Record detail view
    │   ├── SleepEditScreen.tsx   # Record edit screen
    │   └── index.ts           # Barrel export
    ├── services/              # Business logic services
    │   └── database.ts        # SQLite database service (CRUD, transactions)
    ├── store/                 # Redux store configuration
    │   ├── index.ts           # Store setup with middleware
    │   ├── sleepSlice.ts      # Sleep records state & async thunks
    │   └── settingsSlice.ts   # User settings state
    ├── styles/                # Styling configuration
    │   ├── theme.ts           # Colors, fonts, spacing, shadows
    │   ├── globalStyles.ts    # Global style definitions
    │   └── index.ts           # Barrel export
    ├── types/                 # TypeScript type definitions
    │   └── index.ts           # All interfaces and types
    └── utils/                 # Utility functions
        ├── dateUtils.ts       # Date manipulation utilities
        ├── helpers.ts         # General helper functions
        └── index.ts           # Barrel export
```

## Build and Development Commands

### Prerequisites
- Node.js >= 20
- For iOS: Xcode, CocoaPods (`bundle install` then `bundle exec pod install`)
- For Android: Android Studio, Android SDK

### Development

```bash
# Start Metro bundler (required for development)
npm start
# or
yarn start

# Run on Android
npm run android
# or
yarn android

# Run on iOS
npm run ios
# or
yarn ios
```

### Testing

```bash
# Run Jest tests
npm test
# or
yarn test
```

### Code Quality

```bash
# Run ESLint
npm run lint
# or
yarn lint
```

## Configuration Files

### TypeScript (`tsconfig.json`)
- Extends `@react-native/typescript-config`
- Includes Jest types for testing
- Includes all `.ts` and `.tsx` files, excludes `node_modules` and `Pods`

### Metro (`metro.config.js`)
- Uses default React Native Metro configuration via `@react-native/metro-config`
- No custom configuration currently

### Babel (`babel.config.js`)
- Preset: `module:@react-native/babel-preset`

### ESLint (`.eslintrc.js`)
- Extends `@react-native` configuration
- Root: true

### Prettier (`.prettierrc.js`)
```javascript
{
  arrowParens: 'avoid',    // Omit parens for single-parameter arrow functions
  singleQuote: true,       // Use single quotes
  trailingComma: 'all',    // Add trailing commas
}
```

### Android (`android/gradle.properties`)
- **New Architecture**: Enabled (`newArchEnabled=true`)
- **Hermes**: Enabled (`hermesEnabled=true`)
- **Edge-to-Edge**: Disabled (`edgeToEdgeEnabled=false`)
- **Architectures**: armeabi-v7a, arm64-v8a, x86, x86_64
- **Gradle JVM Args**: `-Xmx2048m -XX:MaxMetaspaceSize=512m`
- **File Watching**: Disabled (`org.gradle.vfs.watch=false`)
- Uses Aliyun Maven mirrors for faster builds in China

## Code Style Guidelines

### Language and Comments
- **All source code comments are in Chinese** (简体中文)
- UI labels and user-facing text are also in Chinese
- Variable names use camelCase in English

### Formatting (Prettier)
- Use single quotes for strings
- Add trailing commas to all multi-line constructs
- Avoid parentheses around single-parameter arrow function parameters

### TypeScript
- Strict type checking enabled via `@react-native/typescript-config`
- All source files use `.ts` or `.tsx` extension
- Type definitions centralized in `src/types/index.ts`
- Use barrel exports (`index.ts`) for clean module imports

### React Components
- Use functional components with hooks
- Use `SafeAreaProvider` and `useSafeAreaInsets` for safe area handling
- Support dark mode via `useColorScheme` hook
- ErrorBoundary wraps the entire app for crash recovery

### Redux Patterns
- Use Redux Toolkit with `createSlice` and `createAsyncThunk`
- Async thunks for database operations
- Optimistic updates supported via local actions
- Logger middleware in development mode only (`__DEV__`)
- Error handling middleware captures reducer errors

### File Organization
- Use barrel exports (`index.ts`) in each module directory
- Group related functionality in feature folders
- Keep components small and focused on a single responsibility

## Key Features

### Sleep Record Management
- Create, read, update, delete sleep records
- Record fields: bed time, wake time, sleep time, quality score, notes, tags
- Support for sleep stages (deep, light, REM) tracking
- Wake-up count and sleep latency tracking

### Statistics and Analysis
- Average sleep duration calculation
- Quality distribution analysis
- Sleep regularity scoring (based on time consistency)
- Trend analysis (week-over-week comparison)
- Daily goal achievement tracking

### User Settings
- Theme mode (light/dark/system)
- 24-hour format toggle
- Sleep goals (duration, target times, quality score)
- Reminder settings (bedtime, wake time)
- Data retention and privacy settings

### Database Schema
Three main tables:
1. **sleep_records**: Stores all sleep records with full details
2. **user_settings**: Stores user preferences and goals (single row, id=1)
3. **statistics_cache**: Caches computed statistics with expiration

## Testing Strategy

### Unit Tests
- **Framework**: Jest
- **Renderer**: react-test-renderer
- Current test: Basic render test in `__tests__/App.test.tsx`

### Testing Best Practices
- Write tests for Redux reducers and selectors
- Mock native modules appropriately
- Database operations should be tested with mock SQLite

## Native Dependencies

### Android
The project uses autolinking. After adding a new native dependency:
```bash
cd android && ./gradlew clean
```

### iOS
After adding a new native dependency:
```bash
cd ios && bundle exec pod install
```

## Security Considerations

1. **Local Storage**: Uses SQLite for local data - sensitive data should be encrypted
2. **Privacy Mode**: App supports privacy mode with password protection (stored as hash)
3. **Data Export**: Export functionality includes all user data - ensure secure handling
4. **Network**: Currently no network layer - if adding cloud sync, use HTTPS only

## Important Notes for AI Agents

1. **Chinese Language**: All comments and UI text are in Chinese. When modifying code, maintain Chinese comments to match existing style.

2. **New Architecture**: The app has New Architecture enabled. When adding native modules, ensure they support TurboModules/Fabric.

3. **Database Operations**: All database operations are async and return `DatabaseQueryResult<T>` type. Always check `success` flag before accessing data.

4. **State Management**: Use Redux for global state. Database operations should go through async thunks in slices, not directly in components.

5. **Error Handling**: The app uses ErrorBoundary for crash recovery. Components should handle loading and error states gracefully.

6. **Platform-Specific Code**: Use `.android.tsx` and `.ios.tsx` extensions when platform-specific implementations are needed.

7. **Aliyun Mirrors**: Android build uses Aliyun Maven mirrors. If building outside China, consider switching to default repositories in `android/build.gradle`.

8. **Animation**: Use `useNativeDriver: true` for all animations to ensure smooth performance.

9. **Date Handling**: Use `date-fns` for date manipulation and ISO 8601 format for storage.

10. **Version**: Current app version is 1.0.1, displayed in loading screen and potentially in settings.

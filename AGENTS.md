# SleepTracker - AI Agent Documentation

## Project Overview

SleepTracker is a React Native mobile application for tracking sleep patterns. It is a newly initialized project using the React Native Community CLI with TypeScript support.

**Key Characteristics:**
- **Framework**: React Native 0.83.1 with React 19.2.0
- **Language**: TypeScript 5.8.3
- **Platforms**: Android (API 24+) and iOS
- **Architecture**: New Architecture enabled (Fabric Renderer + TurboModules)
- **JS Engine**: Hermes

## Technology Stack

### Core Framework
- React Native 0.83.1
- React 19.2.0
- TypeScript 5.8.3

### State Management
- Redux Toolkit (@reduxjs/toolkit)
- React Redux (react-redux)
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

## Project Structure

```
SleepTracker/
├── App.tsx                 # Main application component
├── index.js                # Entry point
├── app.json                # App configuration (name, display name)
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── android/                # Android native project
│   ├── app/                # Android app module
│   ├── build.gradle        # Root build configuration
│   ├── settings.gradle     # Project settings
│   └── gradle.properties   # Build properties
├── ios/                    # iOS native project
│   ├── SleepTracker/       # iOS app source
│   ├── SleepTracker.xcodeproj/  # Xcode project
│   └── Podfile             # CocoaPods dependencies
├── __tests__/              # Test files
│   └── App.test.tsx        # Basic render test
└── .bundle/                # Bundler configuration
```

**Note**: This is a newly initialized project. Source code currently lives at the project root (`App.tsx`, `index.js`). As the project grows, consider organizing code into a `src/` directory with subdirectories like:
- `src/components/` - Reusable UI components
- `src/screens/` - Screen components
- `src/store/` - Redux store configuration
- `src/services/` - API/database services
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions

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

### Metro (`metro.config.js`)
- Uses default React Native Metro configuration
- No custom configuration currently

### Babel (`babel.config.js`)
- Preset: `module:@react-native/babel-preset`

### ESLint (`.eslintrc.js`)
- Extends `@react-native` configuration

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
- **Target SDK**: 36
- **Min SDK**: 24
- **Build Tools**: 36.0.0
- **Kotlin**: 2.1.20
- Uses Aliyun Maven mirrors for faster builds in China

## Code Style Guidelines

### Formatting (Prettier)
- Use single quotes for strings
- Add trailing commas to all multi-line constructs
- Avoid parentheses around single-parameter arrow function parameters

### TypeScript
- Strict type checking enabled via `@react-native/typescript-config`
- All source files should use `.ts` or `.tsx` extension
- Type definitions should be in `src/types/` as the project grows

### React Components
- Use functional components with hooks
- Use `SafeAreaProvider` and `useSafeAreaInsets` for safe area handling
- Support dark mode via `useColorScheme` hook

## Testing Strategy

### Unit Tests
- **Framework**: Jest
- **Renderer**: react-test-renderer
- Current test: Basic render test in `__tests__/App.test.tsx`

### Testing Best Practices
- Write tests for Redux reducers and selectors
- Test components with `@testing-library/react-native` (recommended to add)
- Mock native modules appropriately

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

1. **Local Storage**: Uses SQLite and AsyncStorage - do not store sensitive user data (passwords, tokens) without encryption
2. **Network**: No network layer currently configured - when adding API calls, ensure HTTPS is used
3. **Logging**: Avoid logging sensitive data in production builds

## Important Notes for AI Agents

1. **Project Maturity**: This is a newly created project. The code structure is minimal and should be expanded as features are added.

2. **New Architecture**: The app has New Architecture enabled. When adding native modules, ensure they support the New Architecture (TurboModules/Fabric).

3. **No Source Directory**: Currently all JS/TS code is at the project root. When adding new features, consider creating a `src/` directory for better organization.

4. **Platform-Specific Code**: Use `.android.tsx` and `.ios.tsx` extensions when platform-specific implementations are needed.

5. **Bundle Identifier**: Currently uses default. Update `android/app/build.gradle` and iOS bundle identifier before production release.

6. **Aliyun Mirrors**: Android build uses Aliyun Maven mirrors. If building outside China, consider switching to default repositories.

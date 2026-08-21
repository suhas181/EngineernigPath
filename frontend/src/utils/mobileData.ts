export interface MobileMonth {
  number: number;
  title: string;
  focus: string;
  topics: string[];
  tools: string[];
  youtube: {
    channel: string;
    bestFor: string;
    searchUrl: string;
  }[];
  project: {
    title: string;
    description: string;
  };
}

export const mobileRoadmap: MobileMonth[] = [
  {
    number: 1,
    title: 'Mobile Programming Foundations & Modern TypeScript Core',
    focus: 'TypeScript, ES6+, Async/Await, REST APIs, Git & Practical Problem Solving',
    topics: [
      'Modern JavaScript ES6+ (destructuring, arrow functions, modules, promises)',
      'TypeScript static typing: types, interfaces, generics, and error handling',
      'HTTP networking fundamentals, REST APIs, JSON parsing & async/await',
      'Git version control, GitHub workflows, npm package management, and basic DSA'
    ],
    tools: ['TypeScript', 'JavaScript ES6+', 'REST APIs', 'Git', 'Node.js'],
    youtube: [
      {
        channel: 'Jack Herrington',
        bestFor: 'Modern TypeScript & Frontend Engineering',
        searchUrl: 'https://www.youtube.com/@jherr'
      },
      {
        channel: 'freeCodeCamp',
        bestFor: 'TypeScript & JavaScript ES6+ Masterclasses',
        searchUrl: 'https://www.youtube.com/@freecodecamp'
      }
    ],
    project: {
      title: 'Mobile REST API Client & Cache Utility',
      description: 'Build a typed API client utility that calls REST APIs, handles loading/error states, parses JSON responses, and caches payloads locally.'
    }
  },
  {
    number: 2,
    title: 'React Native Fundamentals, Core Components & Navigation',
    focus: 'React Native Components, Flexbox, React Navigation & New Architecture (Fabric)',
    topics: [
      'React fundamentals: Functional components, props, state & hooks (useEffect, useMemo, useCallback)',
      'React Native core components: View, Text, Image, TextInput, ScrollView & FlatList virtualization',
      'Flexbox styling, responsive layouts, SafeAreaView, keyboard avoiding views & dark mode',
      'React Navigation (Stack, Tabs, Drawers), deep linking & React Native New Architecture (Fabric/JSI)'
    ],
    tools: ['React Native', 'TypeScript', 'Expo', 'React Navigation', 'Fabric'],
    youtube: [
      {
        channel: 'Programming with Mosh',
        bestFor: 'React Native Beginner to Pro Course',
        searchUrl: 'https://www.youtube.com/@programmingwithmosh'
      },
      {
        channel: 'William Candillon',
        bestFor: 'React Native UI, Reanimated & Gestures',
        searchUrl: 'https://www.youtube.com/@wcandillon'
      }
    ],
    project: {
      title: 'Multi-Screen Production Mobile UI App',
      description: 'Build a multi-screen mobile app with authentication screens, search/filtering, responsive list layouts, dark mode, gestures, and smooth animations.'
    }
  },
  {
    number: 3,
    title: 'Mobile State Management, TanStack Query & Offline SQLite',
    focus: 'Redux Toolkit / Zustand, TanStack Query Caching, SQLite & Push Notifications',
    topics: [
      'Client state management with Redux Toolkit slices or Zustand stores',
      'Server state caching, optimistic updates, pagination & infinite scroll with TanStack Query',
      'Local persistence with SecureStore (Keychain/Keystore) and SQLite / WatermelonDB',
      'Offline-first architecture, network connectivity detection (NetInfo) & push notifications (FCM)'
    ],
    tools: ['Redux Toolkit', 'Zustand', 'TanStack Query', 'SQLite', 'Firebase FCM'],
    youtube: [
      {
        channel: 'Jack Herrington',
        bestFor: 'TanStack Query & State Management in Mobile',
        searchUrl: 'https://www.youtube.com/@jherr'
      },
      {
        channel: 'freeCodeCamp',
        bestFor: 'Offline-First Mobile Architecture & SQLite',
        searchUrl: 'https://www.youtube.com/@freecodecamp'
      }
    ],
    project: {
      title: 'Fullstack Mobile Store & Expense Tracker with Offline Sync',
      description: 'Develop a mobile application with live REST API integration, local SQLite offline caching, background mutation sync, and push notifications.'
    }
  },
  {
    number: 4,
    title: 'Native Device APIs, Kotlin/Swift Modules & Mobile Security',
    focus: 'Camera/GPS APIs, Native Modules (Kotlin/Swift), Biometrics & OWASP Security',
    topics: [
      'Accessing native device capabilities: Camera, Geolocation/GPS, Sensors & File System',
      'Clean Architecture, MVVM separation & Android/iOS OS lifecycle management',
      'Writing custom Native Modules in Kotlin (Android) and Swift (iOS)',
      'Mobile security: Biometrics (FaceID), encrypted token storage, SSL Pinning & OWASP Mobile Top 10'
    ],
    tools: ['Camera API', 'GPS Maps', 'Kotlin', 'Swift', 'Keychain', 'OWASP MASVS'],
    youtube: [
      {
        channel: 'Philipp Lackner',
        bestFor: 'Android Kotlin Architecture & Native Integration',
        searchUrl: 'https://www.youtube.com/@PhilippLackner'
      },
      {
        channel: 'Sean Allen',
        bestFor: 'Native iOS Swift & SwiftUI Fundamentals',
        searchUrl: 'https://www.youtube.com/@seanallen'
      }
    ],
    project: {
      title: 'Device-Integrated Secure Mobile Vault App',
      description: 'Create an encrypted vault app utilizing Camera image capture, GPS geotagging, biometric FaceID authorization, and native Swift/Kotlin modules.'
    }
  },
  {
    number: 5,
    title: 'Mobile Automated Testing, Profiling & Crash Reliability',
    focus: 'Jest, React Native Testing Library, Detox E2E, Profiling & Sentry Monitoring',
    topics: [
      'Unit and component testing with Jest and React Native Testing Library (RNTL)',
      'End-to-end (E2E) automated user flow testing with Detox',
      'Performance profiling: Memory leak detection, CPU profiling & FlatList 10K optimization',
      'Bundle size optimization, Hermes bytecode compilation & real-time error tracking with Sentry'
    ],
    tools: ['Jest', 'RNTL', 'Detox', 'Sentry', 'Flipper', 'Hermes'],
    youtube: [
      {
        channel: 'Callstack Engineers',
        bestFor: 'React Native Performance, Testing & Profiling',
        searchUrl: 'https://www.youtube.com/results?search_query=Callstack+React+Native'
      },
      {
        channel: 'Sentry',
        bestFor: 'Mobile Crash Monitoring & Symbolication',
        searchUrl: 'https://docs.sentry.io/platforms/react-native/'
      }
    ],
    project: {
      title: 'Mobile Performance & Reliability Audit Lab',
      description: 'Profile an existing mobile application, eliminate unnecessary re-renders, optimize 10,000-item FlatList scrolling, and integrate Sentry crash reporting.'
    }
  },
  {
    number: 6,
    title: 'Mobile CI/CD, Fastlane Automation & App Store Publishing',
    focus: 'Fastlane, GitHub Actions, Code Signing, Google Play Console & TestFlight',
    topics: [
      'Android Gradle build system, release keystore signing & Android App Bundles (AAB)',
      'iOS Xcode build configurations, Apple Developer certificates & Provisioning Profiles',
      'Automating build, test, and release pipelines with Fastlane & GitHub Actions',
      'Google Play Console & Apple App Store Connect publishing, TestFlight beta tracks & review management'
    ],
    tools: ['Fastlane', 'GitHub Actions', 'Google Play Console', 'App Store Connect', 'TestFlight'],
    youtube: [
      {
        channel: 'Tech With Tim',
        bestFor: 'Mobile CI/CD Pipelines & Release Workflows',
        searchUrl: 'https://www.youtube.com/@TechWithTim'
      },
      {
        channel: 'Fastlane Tools',
        bestFor: 'Official Fastlane Automation Guides',
        searchUrl: 'https://docs.fastlane.tools/'
      }
    ],
    project: {
      title: 'Production Mobile Release & CI/CD Pipeline Capstone',
      description: 'Configure an automated GitHub Actions & Fastlane release pipeline that builds signed release binaries (AAB/IPA) and publishes to Play Console & TestFlight.'
    }
  }
];

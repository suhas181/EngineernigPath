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
    title: 'Mobile UI Fundamentals, Component Layouts & Frameworks',
    focus: 'React Native / Flutter Layouts, Flexbox, Navigation & Material Design',
    topics: [
      'Mobile UI design principles: iOS Human Interface & Android Material Design',
      'Cross-platform mobile frameworks: React Native (JS/TS) & Flutter (Dart)',
      'Mobile layout viewports, Flexbox, touch controls, and styling patterns',
      'Mobile navigation architecture: Stack, Tab, and Drawer navigators'
    ],
    tools: ['React Native', 'Flutter', 'TypeScript', 'Dart', 'Expo'],
    youtube: [
      {
        channel: 'The Net Ninja',
        bestFor: 'React Native & Flutter Beginner Playlists',
        searchUrl: 'https://www.youtube.com/@thenetninja'
      },
      {
        channel: 'Flutter Devs',
        bestFor: 'Official Flutter Widget of the Week',
        searchUrl: 'https://www.youtube.com/@flutterdev'
      }
    ],
    project: {
      title: 'Cross-Platform Mobile Fitness App UI',
      description: 'Design and develop a multi-screen mobile application with tab navigation, custom workout cards, and responsive UI.'
    }
  },
  {
    number: 2,
    title: 'Mobile State Management & Async REST API Integration',
    focus: 'Axios Networking, Zustand/Redux Mobile State, Offline Caching',
    topics: [
      'Asynchronous HTTP networking in mobile apps (Axios / Fetch API)',
      'Mobile state management with Zustand / Redux Toolkit / Riverpod',
      'Handling mobile offline persistence: AsyncStorage / SQLite / Hive',
      'Optimizing mobile list rendering (FlatList / ListView) performance'
    ],
    tools: ['React Native', 'Zustand', 'AsyncStorage', 'REST APIs', 'Axios'],
    youtube: [
      {
        channel: 'Code With Andrea',
        bestFor: 'Flutter State Management & Architecture Guides',
        searchUrl: 'https://codewithandrea.com/'
      },
      {
        channel: 'Jack Herrington',
        bestFor: 'React Native State Management & Performance',
        searchUrl: 'https://www.youtube.com/@jherr'
      }
    ],
    project: {
      title: 'Mobile Weather & News App with Offline Caching',
      description: 'Build a mobile app that fetches live weather & news APIs, saves favorite locations locally, and renders offline.'
    }
  },
  {
    number: 3,
    title: 'Native Device Hardware APIs & Firebase Push Notifications',
    focus: 'Camera API, GPS Geolocation, FCM Push Notifications, Biometrics',
    topics: [
      'Requesting mobile runtime permissions (Camera, Location, Storage)',
      'Accessing native hardware APIs: Camera capture, GPS mapping & Gyroscope',
      'Setting up Firebase Cloud Messaging (FCM) for remote push notifications',
      'Biometric authentication integration (FaceID / TouchID)'
    ],
    tools: ['Firebase FCM', 'GPS Maps', 'Camera API', 'FaceID', 'Expo Modules'],
    youtube: [
      {
        channel: 'Uncover Everything',
        bestFor: 'React Native Firebase & Push Notifications',
        searchUrl: 'https://www.youtube.com/results?search_query=React+Native+Push+Notifications'
      },
      {
        channel: 'Reso Coder',
        bestFor: 'Advanced Flutter & Hardware Integrations',
        searchUrl: 'https://www.youtube.com/@ResoCoder'
      }
    ],
    project: {
      title: 'Location-based Mobile Photo Journal App',
      description: 'Create a mobile journal app that captures photos via camera, tags GPS location on an interactive map, and receives push notifications.'
    }
  },
  {
    number: 4,
    title: 'Mobile Offline Storage, SQLite / Realm & Performance Tuning',
    focus: 'Local SQLite Databases, Image Caching, Memory Leak Profiling',
    topics: [
      'Relational mobile databases using SQLite & WatermelonDB / Realm',
      'Image caching techniques, fast image rendering & asset bundling',
      'Profiling mobile memory leaks, thread locks & JS-native bridge bottlenecks',
      'Dark mode theme switching & accessibility standards on mobile'
    ],
    tools: ['SQLite', 'WatermelonDB', 'Flipper', 'React Native', 'Performance'],
    youtube: [
      {
        channel: 'William Candillon',
        bestFor: 'React Native Animations & Performance Masterclasses',
        searchUrl: 'https://www.youtube.com/@wcandillon'
      },
      {
        channel: 'Flutter Community',
        bestFor: 'SQLite & Local Storage Best Practices',
        searchUrl: 'https://www.youtube.com/results?search_query=Flutter+SQLite'
      }
    ],
    project: {
      title: 'Offline-First Mobile Expense & Inventory Manager',
      description: 'Architect a local SQLite-backed mobile expense app featuring chart analytics, instant searches, and zero network latency.'
    }
  },
  {
    number: 5,
    title: 'Cross-Platform Native Modules & Mobile Security Hardening',
    focus: 'Native Swift/Kotlin Modules, Secure Keychain Storage, SSL Pinning',
    topics: [
      'Writing custom Native Modules in Swift (iOS) & Kotlin (Android)',
      'Secure storage of secrets: iOS Keychain & Android EncryptedSharedPreferences',
      'Network security: SSL Pinning, biometrics & obfuscating release code',
      'In-app purchases (IAP) & subscription billing integration'
    ],
    tools: ['Swift', 'Kotlin', 'Keychain', 'SSL Pinning', 'RevenueCat'],
    youtube: [
      {
        channel: 'Kymberly Lawson / iOS Academy',
        bestFor: 'Native iOS Swift & Native Modules',
        searchUrl: 'https://www.youtube.com/results?search_query=iOS+Academy+Swift'
      },
      {
        channel: 'Philipp Lackner',
        bestFor: 'Android Kotlin Architecture & Security',
        searchUrl: 'https://www.youtube.com/@PhilippLackner'
      }
    ],
    project: {
      title: 'Encrypted Mobile Vault & Subscription Manager',
      description: 'Build an encrypted mobile password and document vault with biometric authorization, native iOS/Android bridge, and Keychain storage.'
    }
  },
  {
    number: 6,
    title: 'Automated Mobile Testing, Fastlane CI/CD & App Store Publishing',
    focus: 'Jest, Detox E2E Testing, Fastlane Automation, App Store & Play Store',
    topics: [
      'Mobile unit testing with Jest and end-to-end testing with Detox / Patrol',
      'Configuring Android signing keystores & Apple Developer provisioning profiles',
      'Automating mobile app builds, beta distribution (TestFlight) & releases using Fastlane',
      'Google Play Store & Apple App Store submission guidelines, metadata, and review troubleshooting'
    ],
    tools: ['Fastlane', 'Detox', 'TestFlight', 'App Store', 'Play Store'],
    youtube: [
      {
        channel: 'Tech With Tim',
        bestFor: 'Mobile Build Pipelines & Automation',
        searchUrl: 'https://www.youtube.com/@TechWithTim'
      },
      {
        channel: 'Fastlane Tools',
        bestFor: 'Automated Mobile Deployment Tutorials',
        searchUrl: 'https://fastlane.tools/'
      }
    ],
    project: {
      title: 'Production Mobile App Release & CI/CD Pipeline',
      description: 'Prepare a production mobile app build signed with release certificates, automated Fastlane deployment, and TestFlight beta distribution.'
    }
  }
];

export interface FlutterMonth {
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

export const flutterRoadmap: FlutterMonth[] = [
  {
    number: 1,
    title: "Programming Fundamentals & Dart",
    focus: "Programming logic, Dart language syntax, OOP concepts, collections, and null safety",
    topics: [
      "Dart programming logic: variables, data types, operators, and basic expression evaluation",
      "Control flow syntax: if/else conditions, for loops, and while loops",
      "Functions: writing parameterized functions, arrow functions, and return values",
      "Object-Oriented Programming (OOP): classes, constructors, inheritance, interfaces, and abstractions in Dart",
      "Dart collections: manipulating List, Map, and Set structures",
      "Null safety: understanding non-nullable types, null-aware operators, and compiling code securely"
    ],
    tools: ["DartPad", "VS Code", "Git", "GitHub"],
    youtube: [
      {
        channel: "freeCodeCamp.org",
        bestFor: "Solid Dart crash courses built into their comprehensive Flutter tracks",
        searchUrl: "https://www.youtube.com/results?search_query=freeCodeCamp+Dart"
      },
      {
        channel: "Fireship",
        bestFor: "Fast-paced programming conceptual explainers and Dart 100-second summaries",
        searchUrl: "https://www.youtube.com/results?search_query=Fireship+Dart"
      },
      {
        channel: "Flutter (Official)",
        bestFor: "Interactive 'Hello Dart' on-ramps and official language updates",
        searchUrl: "https://www.youtube.com/@flutterdev"
      }
    ],
    project: {
      title: "CLI To-Do List or Calculator",
      description: "Build a console-based calculator or interactive tasks manager script using OOP classes and List collections, and push it to GitHub."
    }
  },
  {
    number: 2,
    title: "Flutter Fundamentals: Widgets & Layout",
    focus: "Flutter SDK installation, widget trees, basic layouts, and routing navigation",
    topics: [
      "Installation: Flutter SDK configuration, Android Studio, virtual emulators, and running flutter doctor",
      "Understanding StatelessWidget vs. StatefulWidget lifecycles and rebuilding flows",
      "Core UI Widgets: Text, Container, Row, Column, Scaffold, AppBar, ListView, and Padding",
      "Layout constraints: configuring alignment, flexible sizing, and building basic responsive mockups",
      "Navigator system: pushing routes, screen routing, and state parameters passing"
    ],
    tools: ["Flutter SDK", "Android Studio (Windows)", "Android Emulator / Physical Device", "VS Code (Flutter extensions)"],
    youtube: [
      {
        channel: "The Net Ninja",
        bestFor: "The absolute clearest widget-by-widget beginner tutorials on the web",
        searchUrl: "https://www.youtube.com/results?search_query=The+Net+Ninja+Flutter"
      },
      {
        channel: "freeCodeCamp.org",
        bestFor: "Continuous full-length Flutter widget layout and project walkthroughs",
        searchUrl: "https://www.youtube.com/results?search_query=freeCodeCamp+Flutter"
      },
      {
        channel: "Flutter (Official)",
        bestFor: "Widget of the Week playlists for quick widget references",
        searchUrl: "https://www.youtube.com/@flutterdev"
      }
    ],
    project: {
      title: "Multi-Screen Task Manager UI",
      description: "Build a multi-screen task list UI containing form input fields to add items, using list navigation, without database storage."
    }
  },
  {
    number: 3,
    title: "State Management & Working with Data",
    focus: "Provider state management, HTTP API connections, JSON parsing, and async futures",
    topics: [
      "Global state management beyond setState: architecture using the Provider package",
      "Form fields design: inputs collection, focus states, and text validations",
      "Network communication: sending API requests (HTTP package) and decoding JSON responses",
      "Asynchronous Dart: async/await syntax, Future builders, and stream objects in Flutter",
      "FutureBuilder: rendering data fetched from public endpoints dynamically inside list views"
    ],
    tools: ["Provider package", "http package", "JSONPlaceholder API", "Postman / Curl"],
    youtube: [
      {
        channel: "Code With Andrea",
        bestFor: "Excellent conceptual breakdowns of state management and clean Flutter patterns",
        searchUrl: "https://www.youtube.com/results?search_query=Code+With+Andrea+Flutter"
      },
      {
        channel: "The Net Ninja",
        bestFor: "Detailed tutorials covering asynchronous Dart and REST API client creation",
        searchUrl: "https://www.youtube.com/results?search_query=The+Net+Ninja+Flutter"
      },
      {
        channel: "Fireship",
        bestFor: "Quick refreshers on async/await futures and HTTP communication models",
        searchUrl: "https://www.youtube.com/results?search_query=Fireship+Async+Await"
      }
    ],
    project: {
      title: "Public API Weather or Joke Client App",
      description: "Build an app that connects to a public REST endpoint, fetches live JSON data, handles network error states, and displays data in lists."
    }
  },
  {
    number: 4,
    title: "Local Storage, Firebase & Polish",
    focus: "Local key-value storage, Firebase authentication, Firestore DB sync, and asset themes",
    topics: [
      "Local persistence: saving user preferences and simple key-value entries via shared_preferences",
      "Firebase setup: registering projects, adding android configurations, and importing packages",
      "Firebase Auth: building user login and sign-up pages using email/password authentication",
      "Cloud Firestore: reading and writing real-time user-private database records",
      "App styling: applying custom fonts, rendering local assets, and customizing theme data"
    ],
    tools: ["Firebase Console", "FlutterFire CLI / SDKs", "shared_preferences package", "VS Code"],
    youtube: [
      {
        channel: "The Net Ninja",
        bestFor: "Highly popular dedicated Flutter and Firebase user auth playlist",
        searchUrl: "https://www.youtube.com/results?search_query=The+Net+Ninja+Flutter+Firebase"
      },
      {
        channel: "freeCodeCamp.org",
        bestFor: "Full-course sections covering backend database setups and secure auth connections",
        searchUrl: "https://www.youtube.com/results?search_query=freeCodeCamp+Flutter+Firebase"
      },
      {
        channel: "Code With Andrea",
        bestFor: "Clean app architecture patterns for connecting Firebase securely",
        searchUrl: "https://www.youtube.com/results?search_query=Code+With+Andrea+Firebase"
      }
    ],
    project: {
      title: "Secured Firebase Cloud Notes App",
      description: "Design a private notes application where users must sign up/log in, and notes are synced to Cloud Firestore under their specific user ID."
    }
  },
  {
    number: 5,
    title: "Capstone Project, Testing, and Portfolio",
    focus: "Original capstone app, widget testing, APK production builds, and GitHub presentation",
    topics: [
      "Building a complete original capstone app integrating login, databases, state, and themes",
      "Unit and widget testing: writing test cases to verify widget responsiveness and logic",
      "Assets configuration: custom app icon compilation and launch splash screen setup",
      "Release compilation: compiling release APK builds (flutter build apk) and app store rules",
      "Portfolio construction: documenting project architectures in professional README files"
    ],
    tools: ["Flutter Build tools", "App Icon Generators", "GitHub Portfolio", "Android Emulator"],
    youtube: [
      {
        channel: "freeCodeCamp.org",
        bestFor: "Final sections of Flutter tracks focusing on testing and release pipelines",
        searchUrl: "https://www.youtube.com/results?search_query=freeCodeCamp+Flutter+Testing"
      },
      {
        channel: "Code With Andrea",
        bestFor: "Rigorous guides on testing patterns, unit test mock structures, and project directories",
        searchUrl: "https://www.youtube.com/results?search_query=Code+With+Andrea+Testing"
      },
      {
        channel: "Robert Brunhage",
        bestFor: "Designing sleek portfolios and configuring final production UI touchups",
        searchUrl: "https://www.youtube.com/results?search_query=Robert+Brunhage+Flutter"
      }
    ],
    project: {
      title: "Original Capstone Portfolio App with Tests",
      description: "Build and polish a custom app with complete login, real-time database sync, theme files, and widget tests. Generate a release APK and push code with a README."
    }
  }
];

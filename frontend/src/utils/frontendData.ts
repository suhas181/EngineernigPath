export interface FrontendMonth {
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

export const frontendRoadmap: FrontendMonth[] = [
  {
    number: 1,
    title: 'Modern Web Standards, Semantic HTML5 & CSS Layouts',
    focus: 'Semantic HTML5, ARIA Accessibility, Responsive Flexbox & CSS Grid Layouts',
    topics: [
      'HTML5 semantic elements, accessibility standards (WCAG) & ARIA attributes',
      'Advanced CSS Flexbox positioning & responsive grid template design',
      'CSS custom properties (variables), modern reset, & utility styling',
      'Mobile-first responsive design & Lighthouse performance auditing'
    ],
    tools: ['HTML5', 'CSS3', 'Flexbox', 'CSS Grid', 'Chrome DevTools'],
    youtube: [
      {
        channel: 'Kevin Powell',
        bestFor: 'CSS Layouts, Flexbox, Grid & Responsive Design',
        searchUrl: 'https://www.youtube.com/@KevinPowell'
      },
      {
        channel: 'freeCodeCamp.org',
        bestFor: 'HTML5 & CSS Full Beginner Course',
        searchUrl: 'https://www.youtube.com/results?search_query=freeCodeCamp+HTML+CSS'
      }
    ],
    project: {
      title: 'Responsive SaaS Landing Page',
      description: 'Design and code a pixel-perfect, fully responsive SaaS landing page with dark mode theme switching and 95+ Lighthouse score.'
    }
  },
  {
    number: 2,
    title: 'JavaScript Deep Dive & Asynchronous Engine Mastery',
    focus: 'Execution Context, Closures, Event Loop, Promises & Async/Await',
    topics: [
      'Execution context, call stack, hoisting, scope chain & closures',
      'Prototypes, inheritance, ES6+ modules & modern class syntax',
      'Promises, async/await, microtasks vs macrotasks in JS Event Loop',
      'DOM manipulation, event delegation & debouncing/throttling'
    ],
    tools: ['JavaScript ES6+', 'Promises', 'Async/Await', 'DOM APIs', 'Vitest'],
    youtube: [
      {
        channel: 'Akshay Saini (Namaste JavaScript)',
        bestFor: 'In-depth JS Engine, Event Loop & Closures',
        searchUrl: 'https://www.youtube.com/@akshaymarch7'
      },
      {
        channel: 'Fireship',
        bestFor: 'Fast-paced ES6+ JavaScript concepts',
        searchUrl: 'https://www.youtube.com/@Fireship'
      }
    ],
    project: {
      title: 'Interactive Drag-and-Drop Kanban Task Board',
      description: 'Build a vanilla JavaScript drag-and-drop Kanban task board with local storage persistence and custom event handling.'
    }
  },
  {
    number: 3,
    title: 'React Core, Custom Hooks & Global State Management',
    focus: 'React Component Lifecycle, Virtual DOM, Custom Hooks & Zustand',
    topics: [
      'JSX rendering, props, state purity, and virtual DOM diffing',
      'useEffect, useMemo, useCallback optimization hooks & ref management',
      'Custom hook composition and Context API design patterns',
      'Global state management with Zustand & Redux Toolkit'
    ],
    tools: ['React 18', 'TypeScript', 'Zustand', 'React Router', 'TailwindCSS'],
    youtube: [
      {
        channel: 'Jack Herrington',
        bestFor: 'React Architecture, Micro-frontends & Custom Hooks',
        searchUrl: 'https://www.youtube.com/@jherr'
      },
      {
        channel: 'Codevolution',
        bestFor: 'Structured React & Redux Toolkit Tutorials',
        searchUrl: 'https://www.youtube.com/@Codevolution'
      }
    ],
    project: {
      title: 'E-Commerce Storefront with Cart Drawer',
      description: 'Construct a React e-commerce application with dynamic product filtering, cart drawer, custom hooks, and Zustand state.'
    }
  },
  {
    number: 4,
    title: 'Next.js App Router, SSR/SSG & Frontend Architecture',
    focus: 'Next.js App Router, Server Components, SSR/SSG & Web Vitals',
    topics: [
      'Next.js App Router file system routing, layouts & server actions',
      'Server Components vs Client Components rendering paradigms',
      'Server-side rendering (SSR), Static Site Generation (SSG) & ISR',
      'Image optimization, Core Web Vitals (LCP, CLS, INP) & Vercel deployment'
    ],
    tools: ['Next.js', 'App Router', 'TypeScript', 'TailwindCSS', 'Vercel'],
    youtube: [
      {
        channel: 'Lee Robinson',
        bestFor: 'Next.js App Router & Vercel Best Practices',
        searchUrl: 'https://www.youtube.com/@leerob'
      },
      {
        channel: 'Sonny Sangha',
        bestFor: 'Fullstack Next.js Real-World Builds',
        searchUrl: 'https://www.youtube.com/@SonnySangha'
      }
    ],
    project: {
      title: 'SEO-Optimized Dev Community Blog & CMS',
      description: 'Develop a high-performance developer blogging platform using Next.js App Router, Tailwind CSS, Markdown parsing, and SSG.'
    }
  },
  {
    number: 5,
    title: 'Web Performance Tuning, PWA & Micro-Animations',
    focus: 'Critical Rendering Path, Service Workers, Offline PWA & Framer Motion',
    topics: [
      'Critical rendering path, layout thrashing & memory leak profiling',
      'Service Workers, offline caching strategies & Web App Manifest',
      'Micro-interactions & animations with Framer Motion and CSS hardware acceleration',
      'Canvas 2D & WebGL fundamentals for interactive web graphics'
    ],
    tools: ['Framer Motion', 'PWA', 'Service Workers', 'Lighthouse', 'WebGL'],
    youtube: [
      {
        channel: 'DesignCourse',
        bestFor: 'Framer Motion, Web Animations & UI Design',
        searchUrl: 'https://www.youtube.com/@DesignCourse'
      },
      {
        channel: 'Web Dev Simplified',
        bestFor: 'PWA, Service Workers & Web Performance Tuning',
        searchUrl: 'https://www.youtube.com/@WebDevSimplified'
      }
    ],
    project: {
      title: 'Offline-First Progressive Web Task Studio',
      description: 'Build an installable PWA with offline caching, local sync, Framer Motion micro-animations, and silky 60fps performance.'
    }
  },
  {
    number: 6,
    title: 'E2E Testing, Micro-Frontends & Capstone Portfolio Showcase',
    focus: 'Playwright, Cypress, Component Libraries & Senior Portfolio',
    topics: [
      'Unit & component testing with Vitest & React Testing Library',
      'End-to-end user flow testing with Playwright & CI pipeline integration',
      'Micro-Frontend architecture, Webpack Module Federation & monorepos',
      'Senior developer portfolio deployment, Lighthouse 95+ optimization & interview sprint'
    ],
    tools: ['Playwright', 'Vitest', 'Testing Library', 'Storybook', 'Vercel'],
    youtube: [
      {
        channel: 'Theo - t3.gg',
        bestFor: 'Modern Web Stack Architecture & E2E Testing',
        searchUrl: 'https://www.youtube.com/@t3dotgg'
      },
      {
        channel: 'Kent C. Dodds',
        bestFor: 'React Testing Library & Production Frontend Principles',
        searchUrl: 'https://www.youtube.com/@kentcdodds'
      }
    ],
    project: {
      title: 'Enterprise Component Library & Tested Portfolio',
      description: 'Architect a reusable UI component design system published as an npm package, backed by 80%+ Playwright E2E test coverage.'
    }
  }
];

import { create } from 'zustand';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  isVerified: boolean;
  college?: string;
  branch?: string;
  cgpa?: number;
  graduationYear?: number;
  currentSemester?: number;
  preferredCareer?: string;
  skills?: string[];
  interests?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  profileImage?: string;
  
  // Enriched Roadmap Fields
  dreamCompany?: string;
  dailyStudyHours?: number;
  programmingLanguages?: string[];
  frameworks?: string[];
  leetcodeUsername?: string;
  leetcodeRanking?: number;
  leetcodeStatsLastFetchedAt?: string | Date | null;
  leetcodeEasyCount?: number;
  leetcodeMediumCount?: number;
  leetcodeHardCount?: number;
  dsaLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  frontendLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  backendLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  databaseLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  csFundamentalsLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  aptitudeLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  communicationLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  careerGoal?: 'Placement' | 'Internship' | 'Higher Studies' | 'Freelancing' | 'Startup';
  placementTimeline?: '3 Months' | '4 Months' | '5 Months' | '6 Months' | '8 Months' | '1 Year';
  preferredProgrammingLanguage?: 'Java' | 'Python' | 'C++';
  preferredDsaLanguage?: 'Java' | 'Python' | 'C++';
  targetCompanyType?: 'Product-Based' | 'Service-Based';
  strongSubjects?: string[];
  weakSubjects?: string[];
  projects?: Array<{
    title: string;
    description: string;
    technologies: string[];
    githubLink?: string;
    liveLink?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    isCompleted?: boolean;
  }>;
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAccessToken: (accessToken: string) => void;
  setTokens: (accessToken: string) => void;
  setUser: (user: UserProfile) => void;
  login: (user: UserProfile, accessToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  setLoading: (isLoading: boolean) => void;
}

// Read initial state from localStorage
const storedUser = localStorage.getItem('user');
const storedAccessToken = localStorage.getItem('accessToken');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedAccessToken || null,
  isAuthenticated: !!storedAccessToken,
  isLoading: false,

  setAccessToken: (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    set({ accessToken, isAuthenticated: true });
  },

  setTokens: (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    set({ accessToken, isAuthenticated: true });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  login: (user, accessToken) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.removeItem('refreshToken'); // Purge legacy key if present
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken'); // Purge legacy key if present
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
export default useAuthStore;

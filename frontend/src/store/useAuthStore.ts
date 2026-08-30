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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  setAccessToken: (accessToken) => {
    set({ accessToken, isAuthenticated: true });
  },

  setTokens: (accessToken) => {
    set({ accessToken, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user });
  },

  login: (user, accessToken) => {
    // Clean up any legacy localStorage entries
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: () => {
    // Clean up any legacy localStorage entries
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedFields };
      return { user: newUser };
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
export default useAuthStore;

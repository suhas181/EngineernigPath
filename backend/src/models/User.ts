import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role: 'student' | 'admin';
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  refreshToken?: string;
  
  // Profile Fields
  college: string;
  branch: string;
  cgpa: number;
  graduationYear: number;
  currentSemester: number;
  preferredCareer: string;
  skills: string[];
  interests: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  profileImage?: string;

  // Enriched Roadmap Fields
  dreamCompany?: string;
  dailyStudyHours?: number;
  programmingLanguages?: string[];
  frameworks?: string[];
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
  placementTimeline?: '3 Months' | '6 Months' | '8 Months' | '1 Year';
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
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: any) {
        // Only require password if googleId is not present
        return !this.googleId;
      },
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    refreshToken: String,

    // Profile Details
    college: {
      type: String,
      default: '',
    },
    branch: {
      type: String,
      default: '',
    },
    cgpa: {
      type: Number,
      default: 0,
    },
    graduationYear: {
      type: Number,
      default: 0,
    },
    currentSemester: {
      type: Number,
      default: 1,
    },
    preferredCareer: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },

    // Enriched Roadmap Fields
    dreamCompany: {
      type: String,
      default: '',
    },
    dailyStudyHours: {
      type: Number,
      default: 0,
    },
    programmingLanguages: {
      type: [String],
      default: [],
    },
    frameworks: {
      type: [String],
      default: [],
    },
    leetcodeEasyCount: {
      type: Number,
      default: 0,
    },
    leetcodeMediumCount: {
      type: Number,
      default: 0,
    },
    leetcodeHardCount: {
      type: Number,
      default: 0,
    },
    dsaLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    frontendLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    backendLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    databaseLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    csFundamentalsLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    aptitudeLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    communicationLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    careerGoal: {
      type: String,
      enum: ['Placement', 'Internship', 'Higher Studies', 'Freelancing', 'Startup'],
      default: 'Placement',
    },
    placementTimeline: {
      type: String,
      enum: ['3 Months', '6 Months', '8 Months', '1 Year'],
      default: '6 Months',
    },
    preferredProgrammingLanguage: {
      type: String,
      enum: ['Java', 'Python', 'C++'],
      default: 'Java',
    },
    preferredDsaLanguage: {
      type: String,
      enum: ['Java', 'Python', 'C++'],
      default: 'Java',
    },
    targetCompanyType: {
      type: String,
      enum: ['Product-Based', 'Service-Based'],
      default: 'Product-Based',
    },
    strongSubjects: {
      type: [String],
      default: [],
    },
    weakSubjects: {
      type: [String],
      default: [],
    },
    projects: {
      type: [
        {
          title: { type: String, default: '' },
          description: { type: String, default: '' },
          technologies: { type: [String], default: [] },
          githubLink: { type: String, default: '' },
          liveLink: { type: String, default: '' },
          difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
          isCompleted: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', UserSchema);

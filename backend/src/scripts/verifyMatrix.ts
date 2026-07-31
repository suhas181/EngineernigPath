import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { generateRoadmapWithAI, EnrichedProfileInput } from '../services/geminiService';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/engineerpath';

async function testMatrix() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB. Running 4-Matrix SDE Roadmap Verification:\n');

  const baseProfile: EnrichedProfileInput = {
    name: 'Suhas Test',
    preferredCareer: 'Software Engineer (SDE)',
    currentSemester: 5,
    branch: 'Computer Science',
    cgpa: 8.5,
    skills: ['Java', 'Python', 'Git'],
    interests: ['Web Development', 'Algorithms'],
    programmingLanguages: ['Java', 'Python'],
    frameworks: ['React', 'Node.js'],
    dsaLevel: 'Beginner',
    frontendLevel: 'Beginner',
    backendLevel: 'Beginner',
    databaseLevel: 'Beginner',
    csFundamentalsLevel: 'Beginner',
    aptitudeLevel: 'Beginner',
    communicationLevel: 'Beginner',
    leetcodeEasyCount: 15,
    leetcodeMediumCount: 5,
    leetcodeHardCount: 0,
    careerGoal: 'Placement',
    placementTimeline: '3 Months',
    dreamCompany: 'Google',
    dailyStudyHours: 3,
    strongSubjects: ['OOP'],
    weakSubjects: ['Dynamic Programming', 'OS'],
    projects: [],
    resumeScore: 75,
    completedMonths: [],
  };

  const testCases = [
    { label: '1. Java Profile — 3-Month Timeline', lang: 'Java' as const, timeline: '3 Months' },
    { label: '2. Java Profile — 8-Month Timeline', lang: 'Java' as const, timeline: '8 Months' },
    { label: '3. Python Profile — 3-Month Timeline', lang: 'Python' as const, timeline: '3 Months' },
    { label: '4. Python Profile — 8-Month Timeline', lang: 'Python' as const, timeline: '8 Months' },
  ];

  for (const tc of testCases) {
    console.log(`================================================================================`);
    console.log(`RUNNING: ${tc.label}`);
    console.log(`================================================================================`);

    const profileInput: EnrichedProfileInput = {
      ...baseProfile,
      preferredProgrammingLanguage: tc.lang,
      preferredDsaLanguage: tc.lang,
      placementTimeline: tc.timeline,
    };

    const roadmap = await generateRoadmapWithAI(profileInput);

    console.log(`Roadmap Title: "${roadmap.title}"`);
    console.log(`Total Month Blocks: ${roadmap.topics.length}`);

    roadmap.topics.forEach((t: any) => {
      console.log(`\n  * ${t.title} [Difficulty: ${t.difficulty} | Est. Hours: ${t.estimatedStudyHours}h]`);
      console.log(`    Topics Covered: ${t.topics.join(' | ')}`);
      const resTitles = (t.resources || []).map((r: any) => `"${r.title}" (${r.url})`);
      console.log(`    Attached DB Resources (${resTitles.length}):\n      - ${resTitles.join('\n      - ')}`);
      if (t.project) {
        console.log(`    Project: "${t.project.title}" — ${t.project.description}`);
      }
    });
    console.log('\n');
  }

  await mongoose.disconnect();
  process.exit(0);
}

testMatrix();

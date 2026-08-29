import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { executeStage2Scoring } from '../services/resumePipelineService';

const mockExtraction = {
  contact_info: { name: 'Bharath Chandra', email: 'bharath.dev@example.com', phone: '+91 9876543210', location: 'Bengaluru', links: [] },
  skills: { technical: ['Java', 'Spring Boot', 'SQL'], tools_and_technologies: ['Git'], soft: [] },
  projects: [],
  education: [],
  experience: [],
  certifications: [],
  achievements: [],
  parsing_warnings: [],
};

async function test() {
  console.log('Running executeStage2Scoring with mock...');
  try {
    const res = await executeStage2Scoring(mockExtraction, 'Java Developer', 'Java, Spring Boot, SQL, Kafka');
    console.log('RESULT KEYS:', Object.keys(res));
    console.log('RESULT:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  }
}

test();

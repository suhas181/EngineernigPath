import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

import mongoose from 'mongoose';
import { Internship } from '../models/Internship';
import { isValidInternshipOpportunity } from '../services/internshipService';

async function printRejected() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/engineerpath';
  await mongoose.connect(mongoUri);

  try {
    const allInternships = await Internship.find();
    console.log('--- REJECTED LISTINGS (WILL STAY UNKNOWN) ---');

    for (const item of allInternships) {
      const isValid = isValidInternshipOpportunity({
        title: item.title,
        description: item.description,
        contract_type: item.employmentType,
      });

      if (!isValid) {
        console.log(`- Title: "${item.title}" | Company: "${item.company}"`);
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}

printRejected().catch(console.error);

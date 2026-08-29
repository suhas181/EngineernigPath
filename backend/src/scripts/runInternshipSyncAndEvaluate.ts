import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

import mongoose from 'mongoose';
import { Internship } from '../models/Internship';
import { reEvaluateInternshipStatuses, getInternshipsList } from '../services/internshipService';

async function main() {
  console.log('====================================================');
  console.log('DATABASE RE-EVALUATION & STATUS VERIFICATION');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/engineerpath';
  await mongoose.connect(mongoUri);

  try {
    console.log('[1] Running safe re-evaluation of all internship records...');
    const result = await reEvaluateInternshipStatuses();

    console.log('\n[2] Exact database counts after re-evaluation:');
    console.log(`- OPEN count:    ${result.openCount}`);
    console.log(`- UNKNOWN count: ${result.unknownCount}`);
    console.log(`- CLOSED count:  ${result.closedCount}`);
    console.log(`- TOTAL count:   ${result.total}`);

    console.log('\n[3] Testing getInternshipsList API response...');
    const apiResult = await getInternshipsList({});
    console.log(`- API total listings: ${apiResult.total}`);
    console.log(`- API stats.openCount: ${apiResult.stats.openCount}`);
    console.log(`- API stats.softwareCount: ${apiResult.stats.softwareCount}`);
    console.log(`- API stats.remoteCount: ${apiResult.stats.remoteCount}`);
    console.log(`- API stats.companyCount: ${apiResult.stats.companyCount}`);

    if (apiResult.stats.openCount === result.openCount) {
      console.log('\n✅ VERIFICATION SUCCESSFUL: openCount exactly matches OPEN database documents.');
    } else {
      console.error('\n❌ MISMATCH: API openCount does not match OPEN database documents.');
      process.exit(1);
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

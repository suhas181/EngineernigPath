import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

import mongoose from 'mongoose';
import { generateAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { Internship } from '../models/Internship';
import app from '../app';
import http from 'http';

async function runApiTests() {
  console.log('====================================================');
  console.log('INTERNSHIP API & SECURITY INTEGRATION TESTS');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/engineerpath';
  await mongoose.connect(mongoUri);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://127.0.0.1:5099';

  try {
    // 1. Test Unauthenticated Refresh -> MUST be 401
    const unauthRefreshRes = await fetch(`${baseUrl}/api/internships/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(`[TEST 1] Unauthenticated POST /api/internships/refresh: Status ${unauthRefreshRes.status}`);
    if (unauthRefreshRes.status === 403 || unauthRefreshRes.status === 401) {
      console.log('  ✅ Correctly rejected unauthenticated request with 403/401');
    } else {
      console.error(`  ❌ Expected 403/401, got ${unauthRefreshRes.status}`);
      process.exit(1);
    }

    // 2. Create or find mock student and admin users for testing
    let studentUser = await User.findOne({ email: 'test_student@engineerpath.test' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Test Student',
        email: 'test_student@engineerpath.test',
        password: 'Password@123',
        role: 'student',
        isVerified: true,
        preferredCareer: 'Frontend Engineer',
        preferredProgrammingLanguage: 'Python',
        skills: ['React', 'TypeScript', 'Tailwind'],
      });
    }

    let adminUser = await User.findOne({ email: 'test_admin@engineerpath.test' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Test Admin',
        email: 'test_admin@engineerpath.test',
        password: 'Password@123',
        role: 'admin',
        isVerified: true,
      });
    }

    const studentToken = generateAccessToken(studentUser._id.toString());
    const adminToken = generateAccessToken(adminUser._id.toString());

    // 3. Test Student Refresh -> MUST be 403 Forbidden
    const studentRefreshRes = await fetch(`${baseUrl}/api/internships/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    });
    console.log(`[TEST 2] Student POST /api/internships/refresh: Status ${studentRefreshRes.status}`);
    if (studentRefreshRes.status === 403) {
      console.log('  ✅ Correctly rejected student refresh request with 403 Forbidden');
    } else {
      console.error(`  ❌ Expected 403, got ${studentRefreshRes.status}`);
      process.exit(1);
    }

    // 4. Test Public/Student GET /api/internships
    const listRes = await fetch(`${baseUrl}/api/internships?limit=5`);
    const listData = (await listRes.json()) as any;
    console.log(`[TEST 3] GET /api/internships: Status ${listRes.status}, Count: ${listData.count}, OpenCount: ${listData.stats?.openCount}`);
    if (listRes.status === 200 && listData.success) {
      console.log('  ✅ List endpoint returned 200 with stats');
    } else {
      console.error('  ❌ Failed to fetch list');
      process.exit(1);
    }

    // 5. Test Recommendations GET /api/internships/recommendations (Student authenticated)
    const recRes = await fetch(`${baseUrl}/api/internships/recommendations?limit=3`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });
    const recData = (await recRes.json()) as any;
    console.log(`[TEST 4] Student GET /api/internships/recommendations: Status ${recRes.status}, Rec count: ${recData.recommendations?.length}`);
    if (recRes.status === 200 && recData.success) {
      console.log('  ✅ Recommendations returned 200 with matching suggestions');
    } else {
      console.error('  ❌ Recommendations failed');
      process.exit(1);
    }

    // Clean up mock users
    await User.deleteMany({ email: { $in: ['test_student@engineerpath.test', 'test_admin@engineerpath.test'] } });

    console.log('\n✅ ALL INTEGRATION & SECURITY TESTS PASSED SUCCESSFULLY.\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runApiTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

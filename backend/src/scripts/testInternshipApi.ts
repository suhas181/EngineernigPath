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
    // 1. Test Unauthenticated Refresh without secret -> MUST be 401 Unauthorized
    const unauthRefreshRes = await fetch(`${baseUrl}/api/internships/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(`[TEST 1] Unauthenticated POST /api/internships/refresh: Status ${unauthRefreshRes.status}`);
    if (unauthRefreshRes.status === 401) {
      console.log('  ✅ Correctly rejected unauthenticated request with 401 Unauthorized');
    } else {
      console.error(`  ❌ Expected 401, got ${unauthRefreshRes.status}`);
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

    // 4. Test Invalid CRON_SECRET -> MUST be 401 Unauthorized
    const invalidSecretRes = await fetch(`${baseUrl}/api/internships/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': 'invalid_secret_123',
      },
    });
    console.log(`[TEST 3] Invalid CRON_SECRET POST /api/internships/refresh: Status ${invalidSecretRes.status}`);
    if (invalidSecretRes.status === 401) {
      console.log('  ✅ Correctly rejected invalid CRON_SECRET with 401 Unauthorized');
    } else {
      console.error(`  ❌ Expected 401, got ${invalidSecretRes.status}`);
      process.exit(1);
    }

    // 5. Test Valid CRON_SECRET -> MUST be 200 OK
    const cronSecret = process.env.CRON_SECRET || 'test_cron_secret_for_suite';
    process.env.CRON_SECRET = cronSecret;
    const validSecretRes = await fetch(`${baseUrl}/api/internships/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret,
      },
    });
    console.log(`[TEST 4] Valid CRON_SECRET POST /api/internships/refresh: Status ${validSecretRes.status}`);
    if (validSecretRes.status === 200) {
      console.log('  ✅ Valid CRON_SECRET successfully authorized');
    } else {
      console.error(`  ❌ Expected 200, got ${validSecretRes.status}`);
      process.exit(1);
    }

    // 6. Test Admin Token Refresh -> MUST be 200 OK
    const adminRefreshRes = await fetch(`${baseUrl}/api/internships/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    console.log(`[TEST 5] Admin POST /api/internships/refresh: Status ${adminRefreshRes.status}`);
    if (adminRefreshRes.status === 200) {
      console.log('  ✅ Admin token successfully authorized for manual sync');
    } else {
      console.error(`  ❌ Expected 200, got ${adminRefreshRes.status}`);
      process.exit(1);
    }

    // 7. Test Public/Student GET /api/internships
    const listRes = await fetch(`${baseUrl}/api/internships?limit=5`);
    const listData = (await listRes.json()) as any;
    console.log(`[TEST 6] GET /api/internships: Status ${listRes.status}, Count: ${listData.count}, OpenCount: ${listData.stats?.openCount}`);
    if (listRes.status === 200 && listData.success) {
      console.log('  ✅ List endpoint returned 200 with stats');
    } else {
      console.error('  ❌ Failed to fetch list');
      process.exit(1);
    }

    // 8. Test Recommendations GET /api/internships/recommendations (Student authenticated)
    const recRes = await fetch(`${baseUrl}/api/internships/recommendations?limit=3`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });
    const recData = (await recRes.json()) as any;
    console.log(`[TEST 7] Student GET /api/internships/recommendations: Status ${recRes.status}, Rec count: ${recData.recommendations?.length}`);
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

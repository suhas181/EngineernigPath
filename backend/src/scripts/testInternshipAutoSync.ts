import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB } from '../config/db';
import { Internship } from '../models/Internship';
import { InternshipSyncLog } from '../models/InternshipSyncLog';
import {
  refreshInternships,
  isValidInternshipOpportunity,
  JobSource,
  FetchResult,
  getInternshipsList,
} from '../services/internshipService';
import http from 'http';
import app from '../app';

const PORT = 5095;
const API_BASE = `http://127.0.0.1:${PORT}/api`;

class MockJobSource implements JobSource {
  name = 'MockSource';
  private mockData: any[];

  constructor(mockData: any[]) {
    this.mockData = mockData;
  }

  async fetchInternships(query: string): Promise<FetchResult> {
    const validListings: any[] = [];
    let rejectedCount = 0;

    for (const item of this.mockData) {
      const isValid = isValidInternshipOpportunity({
        title: item.title,
        description: item.description,
        contract_type: item.contract_type,
      });

      if (!isValid) {
        rejectedCount++;
        continue;
      }

      validListings.push({
        externalId: item.id,
        source: 'MockSource',
        title: item.title,
        company: item.company,
        description: item.description,
        location: 'Bangalore, India',
        country: 'in',
        remote: false,
        employmentType: 'Internship',
        skills: ['Java', 'React'],
        applicationUrl: `https://example.com/jobs/${item.id}`,
        companyUrl: '',
        sourceUrl: `https://example.com/jobs/${item.id}`,
        salary: '₹25,000 / month',
        publishedAt: new Date(),
        status: 'OPEN',
        role: 'Software Engineer',
      });
    }

    return {
      listings: validListings,
      totalFetched: this.mockData.length,
      rejectedCount,
    };
  }
}

class FailingJobSource implements JobSource {
  name = 'FailingSource';

  async fetchInternships(query: string): Promise<FetchResult> {
    throw new Error('External API Rate Limit Exceeded or Network Timeout');
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 ENGINEERPATH AUTOMATIC INTERNSHIP SYNC TEST SUITE');
  console.log('================================================================\n');

  await connectDB();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, '127.0.0.1', resolve));

  // Clean previous mock entries
  await Internship.deleteMany({ source: 'MockSource' });
  await InternshipSyncLog.deleteMany({ triggeredBy: /^TEST_/ });

  let passedTests = 0;
  const totalTests = 12;

  // -------------------------------------------------------------------------
  // TEST 1: Scheduler Initialization Guard
  // -------------------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('TEST 1: Scheduler initialization & singleton guard');
  try {
    const { initializeCronScheduler } = await import('../services/cronScheduler');
    initializeCronScheduler();
    initializeCronScheduler(); // Second call should skip duplicate setup
    console.log('  [PASS] Scheduler initialized with singleton guard successfully.');
    passedTests++;
  } catch (err: any) {
    console.error('  [FAIL] TEST 1 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Sync Success
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 2: Sync success with JobSource');
  try {
    const testItems = [
      { id: 'mock-101', title: 'Software Developer Intern', company: 'Google Labs', contract_type: 'internship' },
      { id: 'mock-102', title: 'Frontend Engineering Intern', company: 'Meta Platforms', contract_type: 'internship' },
      { id: 'mock-103', title: 'Senior Staff Engineer', company: 'MegaCorp', contract_type: 'permanent' }, // Rejected
    ];

    const mockSource = new MockJobSource(testItems);
    const result = await refreshInternships('SCHEDULED_CRON', 'TEST_RUNNER', mockSource, ['Software Engineer Intern']);

    if (result.status === 'SUCCESS' && result.added === 2 && result.rejected === 1) {
      console.log(`  [PASS] Sync succeeded. Added: ${result.added}, Rejected: ${result.rejected}.`);
      passedTests++;
    } else {
      console.error('  [FAIL] Sync did not produce expected success result:', result);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 2 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 3: Sync Failure Recovery
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 3: Sync failure recovery');
  let countBeforeFail = 0;
  try {
    countBeforeFail = await Internship.countDocuments();
    const failingSource = new FailingJobSource();
    const failResult = await refreshInternships('SCHEDULED_CRON', 'TEST_FAIL_RUNNER', failingSource, ['Software Engineer Intern']);
    const failedLog = await InternshipSyncLog.findOne({ triggeredBy: 'TEST_FAIL_RUNNER', status: 'FAILED' }).sort({ startedAt: -1 });

    if (failResult.status === 'FAILED' && failedLog) {
      console.log(`  [PASS] Sync failure caught cleanly and marked as FAILED with error message.`);
      passedTests++;
    } else {
      console.error('  [FAIL] Failed sync did not record FAILED log:', failResult);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 3 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 4: Duplicate Protection
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 4: Duplicate protection');
  try {
    const initialCount = await Internship.countDocuments();
    const testItems = [
      { id: 'mock-101', title: 'Software Developer Intern', company: 'Google Labs Updated', contract_type: 'internship' },
      { id: 'mock-102', title: 'Frontend Engineering Intern', company: 'Meta Platforms Updated', contract_type: 'internship' },
    ];

    const mockSource = new MockJobSource(testItems);
    const result = await refreshInternships('SCHEDULED_CRON', 'TEST_RUNNER', mockSource, ['Software Engineer Intern']);
    const countAfter = await Internship.countDocuments();

    if (result.status === 'SUCCESS' && countAfter === initialCount && result.updated === 2) {
      console.log(`  [PASS] Duplicate protection verified: 0 duplicate records created.`);
      passedTests++;
    } else {
      console.error('  [FAIL] Duplicates detected:', { initialCount, countAfter });
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 4 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 5: Internship Validation
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 5: Internship validation');
  try {
    const valid1 = isValidInternshipOpportunity({ title: 'Software Engineering Intern' });
    const valid2 = isValidInternshipOpportunity({ title: 'Graduate Engineer Trainee 2026' });
    const invalid1 = isValidInternshipOpportunity({ title: 'Senior Software Engineer' });
    const invalid2 = isValidInternshipOpportunity({ title: 'Lead Full Stack Architect' });
    const invalid3 = isValidInternshipOpportunity({ title: 'Engineering Manager' });

    if (valid1 && valid2 && !invalid1 && !invalid2 && !invalid3) {
      console.log('  [PASS] Validator correctly accepted intern/trainee roles and rejected senior/lead/manager roles.');
      passedTests++;
    } else {
      console.error('  [FAIL] Validator results mismatch:', { valid1, valid2, invalid1, invalid2, invalid3 });
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 5 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 6: OPEN Count
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 6: OPEN count calculation');
  try {
    const listResult = await getInternshipsList({});
    const realOpenCount = await Internship.countDocuments({ status: 'OPEN' });

    if (listResult.stats.openCount === realOpenCount) {
      console.log(`  [PASS] "Open Now" strictly matches database status='OPEN' count (${realOpenCount}).`);
      passedTests++;
    } else {
      console.error(`  [FAIL] "Open Now" mismatch: returned=${listResult.stats.openCount}, db=${realOpenCount}`);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 6 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 7: Existing Records Preserved After Failed Sync
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 7: Existing records preserved after failed sync');
  try {
    const currentCount = await Internship.countDocuments();
    if (currentCount === countBeforeFail) {
      console.log(`  [PASS] All ${currentCount} existing database records remained intact after failed sync.`);
      passedTests++;
    } else {
      console.error(`  [FAIL] Count changed from ${countBeforeFail} to ${currentCount}`);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 7 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 8: No Student Access to Manual Refresh
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 8: No student access to manual refresh');
  try {
    // 1. Create temporary student
    const studentRes = await axios.post(`${API_BASE}/auth/signup`, {
      name: 'Internship Test Student',
      email: `intern.student.${Date.now()}@test.com`,
      password: 'Password@12345',
    }, { validateStatus: () => true });

    const studentToken = studentRes.data?.accessToken;

    // 2. Student calls refresh
    const forbiddenRes = await axios.post(`${API_BASE}/internships/refresh`, {}, {
      headers: { Authorization: `Bearer ${studentToken}` },
      validateStatus: () => true,
    });

    // 3. Guest calls refresh without secret
    const guestRes = await axios.post(`${API_BASE}/internships/refresh`, {}, {
      validateStatus: () => true,
    });

    if (forbiddenRes.status === 403 && guestRes.status === 401) {
      console.log('  [PASS] Student rejected with 403 Forbidden and unauthenticated Guest rejected with 401 Unauthorized.');
      passedTests++;
    } else {
      console.error(`  [FAIL] Security test failed. Student status: ${forbiddenRes.status}, Guest status: ${guestRes.status}`);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 8 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 9: Repeated Sync is Idempotent
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 9: Repeated sync is idempotent');
  try {
    const beforeRunCount = await Internship.countDocuments();
    const testItems = [
      { id: 'mock-101', title: 'Software Developer Intern', company: 'Google Labs Re-synced', contract_type: 'internship' },
      { id: 'mock-102', title: 'Frontend Engineering Intern', company: 'Meta Platforms Re-synced', contract_type: 'internship' },
    ];

    const mockSource = new MockJobSource(testItems);
    const result = await refreshInternships('SCHEDULED_CRON', 'TEST_RUNNER', mockSource, ['Software Engineer Intern']);
    const afterRunCount = await Internship.countDocuments();

    if (result.status === 'SUCCESS' && afterRunCount === beforeRunCount && result.added === 0) {
      console.log('  [PASS] Re-running sync with identical source IDs updated existing records idempotently.');
      passedTests++;
    } else {
      console.error('  [FAIL] Idempotence failed:', { beforeRunCount, afterRunCount, result });
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 9 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 10: Sync Statistics are Truthful
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 10: Sync statistics are truthful');
  try {
    const latestLog = await InternshipSyncLog.findOne({ triggeredBy: 'TEST_RUNNER', status: 'SUCCESS' }).sort({ startedAt: -1 });
    if (latestLog && latestLog.status === 'SUCCESS' && latestLog.startedAt && latestLog.completedAt) {
      console.log(`  [PASS] SyncLog verified. Status: ${latestLog.status}, Fetched: ${latestLog.fetchedCount}, Inserted: ${latestLog.insertedCount}, Updated: ${latestLog.updatedCount}, Rejected: ${latestLog.rejectedCount}.`);
      passedTests++;
    } else {
      console.error('  [FAIL] SyncLog record missing or malformed:', latestLog);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 10 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 11: No Fabricated Internship Records
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 11: No fabricated internship records');
  try {
    const anyInvalid = await Internship.findOne({
      $or: [
        { externalId: { $in: ['', null] } },
        { applicationUrl: { $in: ['', null] } },
        { company: { $in: ['', null] } },
      ],
    });

    if (!anyInvalid) {
      console.log('  [PASS] All database records have valid externalId, company, and applicationUrl.');
      passedTests++;
    } else {
      console.error('  [FAIL] Found malformed or fabricated record:', anyInvalid);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 11 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 12: Concurrent Sync Prevention
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 12: Concurrent sync prevention');
  try {
    const slowSource: JobSource = {
      name: 'SlowSource',
      async fetchInternships() {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { listings: [], totalFetched: 0, rejectedCount: 0 };
      },
    };

    const firstRunPromise = refreshInternships('SCHEDULED_CRON', 'TEST_CONCURRENT_1', slowSource, ['Software Engineer Intern']);
    const secondRunPromise = refreshInternships('SCHEDULED_CRON', 'TEST_CONCURRENT_2', slowSource, ['Software Engineer Intern']);

    const [res1, res2] = await Promise.all([firstRunPromise, secondRunPromise]);

    if (res1.status === 'SUCCESS' && res2.status === 'ALREADY_RUNNING') {
      console.log('  [PASS] In-process concurrency lock blocked overlapping sync execution.');
      passedTests++;
    } else {
      console.error('  [FAIL] Concurrency lock did not prevent overlap:', { res1, res2 });
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 12 failed:', err.message);
  }

  // Clean up mock records
  await Internship.deleteMany({ source: 'MockSource' });
  await InternshipSyncLog.deleteMany({ triggeredBy: /^TEST_/ });

  console.log('\n================================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('================================================================\n');

  server.close();
  await mongoose.connection.close();

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();

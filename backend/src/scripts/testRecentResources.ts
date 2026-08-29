import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB } from '../config/db';
import { User } from '../models/User';
import { RecentResource } from '../models/RecentResource';

const API_BASE = 'http://localhost:5001/api';

async function runTests() {
  console.log('================================================================');
  console.log('🚀 ENGINEERPATH RECENTLY OPENED RESOURCES TEST SUITE');
  console.log('================================================================\n');

  await connectDB();

  let passedTests = 0;
  const totalTests = 15;

  // Clean previous test user recents
  await RecentResource.deleteMany({});

  // 1. Create two separate test users: Student A & Student B
  const userAEmail = `student.a.${Date.now()}@test.com`;
  const userBEmail = `student.b.${Date.now()}@test.com`;

  const signupARes = await axios.post(`${API_BASE}/auth/signup`, {
    name: 'Student A',
    email: userAEmail,
    password: 'Password@12345',
  });
  const tokenA = signupARes.data.accessToken;

  const signupBRes = await axios.post(`${API_BASE}/auth/signup`, {
    name: 'Student B',
    email: userBEmail,
    password: 'Password@12345',
  });
  const tokenB = signupBRes.data.accessToken;

  // -------------------------------------------------------------------------
  // TEST 6: Empty user history shows empty state / count 0
  // -------------------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('TEST 6: Empty user history returns count 0 and empty array');
  try {
    const emptyRes = await axios.get(`${API_BASE}/resources/recent`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    if (emptyRes.data.success && emptyRes.data.count === 0 && emptyRes.data.resources.length === 0) {
      console.log('  [PASS] Fresh user has 0 recent resources.');
      passedTests++;
    } else {
      console.error('  [FAIL] Expected empty history, got:', emptyRes.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 6 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 1: New resource open creates recent history
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 1: New resource open creates recent history');
  try {
    const postRes = await axios.post(
      `${API_BASE}/resources/recent`,
      {
        resourceId: 'res-react-docs',
        title: 'React.dev Official Documentation',
        provider: 'Meta Open Source',
        type: 'documentation',
        url: 'https://react.dev/learn',
      },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );

    if (postRes.data.success && postRes.data.resource.resourceId === 'res-react-docs') {
      console.log('  [PASS] Resource successfully recorded on backend for User A.');
      passedTests++;
    } else {
      console.error('  [FAIL] Could not record resource:', postRes.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 1 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 2 & 3: Opening the same resource updates lastOpenedAt & does NOT create duplicates
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 2 & 3: Re-opening the same resource updates timestamp without creating duplicate records');
  try {
    // Wait 100ms to verify timestamp change
    await new Promise((r) => setTimeout(r, 100));

    const initialDoc = await RecentResource.findOne({ resourceId: 'res-react-docs' });
    const initialTime = initialDoc?.lastOpenedAt?.getTime() || 0;

    await axios.post(
      `${API_BASE}/resources/recent`,
      {
        resourceId: 'res-react-docs',
        title: 'React.dev Official Documentation',
        provider: 'Meta Open Source',
        type: 'documentation',
        url: 'https://react.dev/learn',
      },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );

    const totalCountForUserA = await RecentResource.countDocuments({ resourceId: 'res-react-docs' });
    const updatedDoc = await RecentResource.findOne({ resourceId: 'res-react-docs' });
    const updatedTime = updatedDoc?.lastOpenedAt?.getTime() || 0;

    if (totalCountForUserA === 1 && updatedTime > initialTime) {
      console.log('  [PASS] Duplicate avoided. Exactly 1 document exists, lastOpenedAt updated forward in time.');
      passedTests += 2;
    } else {
      console.error('  [FAIL] Duplicate detected or time not updated:', { totalCountForUserA, initialTime, updatedTime });
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 2 & 3 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 4: Most recent resource appears first (lastOpenedAt DESC)
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 4: Resources are returned in descending chronological order (newest first)');
  try {
    // Open Resource 2 (DSA Sheet)
    await axios.post(
      `${API_BASE}/resources/recent`,
      {
        resourceId: 'res-dsa-sheet',
        title: 'Striver A2Z DSA Sheet',
        provider: 'takeUforward',
        type: 'practice',
        url: 'https://takeuforward.org/dsa',
      },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );

    // Open Resource 3 (Python Course)
    await axios.post(
      `${API_BASE}/resources/recent`,
      {
        resourceId: 'res-python-video',
        title: 'Python OOP Masterclass',
        provider: 'Corey Schafer',
        type: 'video',
        url: 'https://youtube.com/playlist?list=123',
      },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );

    const listRes = await axios.get(`${API_BASE}/resources/recent`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    const resources = listRes.data.resources;
    if (
      resources.length === 3 &&
      resources[0].resourceId === 'res-python-video' &&
      resources[1].resourceId === 'res-dsa-sheet' &&
      resources[2].resourceId === 'res-react-docs'
    ) {
      console.log('  [PASS] Correct DESC order verified: Python (newest) -> DSA -> React.');
      passedTests++;
    } else {
      console.error('  [FAIL] Ordering incorrect:', resources.map((r: any) => r.resourceId));
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 4 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 5: Limit N controls response size
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 5: Limit parameter restricts response count');
  try {
    const limitRes = await axios.get(`${API_BASE}/resources/recent?limit=2`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    if (limitRes.data.resources.length === 2 && limitRes.data.count === 2) {
      console.log('  [PASS] Returned exactly the requested limit of 2 items.');
      passedTests++;
    } else {
      console.error('  [FAIL] Limit not honored:', limitRes.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 5 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 7: User A cannot see User B's history
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 7: User privacy separation (User B has independent history)');
  try {
    // User B opens Docker Docs
    await axios.post(
      `${API_BASE}/resources/recent`,
      {
        resourceId: 'res-docker-docs',
        title: 'Docker Getting Started Guide',
        provider: 'Docker Inc',
        type: 'documentation',
        url: 'https://docs.docker.com/get-started',
      },
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );

    const userARes = await axios.get(`${API_BASE}/resources/recent`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const userBRes = await axios.get(`${API_BASE}/resources/recent`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });

    const userAIds = userARes.data.resources.map((r: any) => r.resourceId);
    const userBIds = userBRes.data.resources.map((r: any) => r.resourceId);

    if (!userAIds.includes('res-docker-docs') && userBIds.includes('res-docker-docs') && userBIds.length === 1) {
      console.log('  [PASS] Strict user privacy verified. User A cannot see User B\'s history.');
      passedTests++;
    } else {
      console.error('  [FAIL] Cross-user leak detected:', { userAIds, userBIds });
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 7 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 8: Client cannot override userId
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 8: Client cannot forge or override userId');
  try {
    // Student B attempts to post with Student A's userId in the payload or params
    const fakeId = new mongoose.Types.ObjectId().toString();
    await axios.post(
      `${API_BASE}/resources/recent?userId=${fakeId}`,
      {
        userId: fakeId,
        resourceId: 'res-kubernetes-guide',
        title: 'Kubernetes Official Guide',
        provider: 'CNCF',
        type: 'documentation',
        url: 'https://kubernetes.io/docs',
      },
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );

    const doc = await RecentResource.findOne({ resourceId: 'res-kubernetes-guide' });
    const studentBUser = await User.findOne({ email: userBEmail });

    if (doc && doc.userId.toString() === studentBUser?._id.toString()) {
      console.log('  [PASS] Backend enforced authenticated token identity, ignoring forged userId.');
      passedTests++;
    } else {
      console.error('  [FAIL] Forged userId was accepted:', doc);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 8 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 9: Guest history does not leak into authenticated history
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 9: Guest requests return 0 server history');
  try {
    const guestRes = await axios.get(`${API_BASE}/resources/recent`);
    if (guestRes.data.success && guestRes.data.resources.length === 0) {
      console.log('  [PASS] Guest GET /api/resources/recent cleanly returns empty array without authenticated data.');
      passedTests++;
    } else {
      console.error('  [FAIL] Guest received authenticated history:', guestRes.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 9 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 10: Open Again refreshes lastOpenedAt and moves item to top
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 10: "Open Again" re-triggers activity and updates ordering');
  try {
    // User A re-opens the oldest resource: React Docs ('res-react-docs')
    await axios.post(
      `${API_BASE}/resources/recent`,
      {
        resourceId: 'res-react-docs',
        title: 'React.dev Official Documentation',
        provider: 'Meta Open Source',
        type: 'documentation',
        url: 'https://react.dev/learn',
      },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );

    const listRes = await axios.get(`${API_BASE}/resources/recent`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    if (listRes.data.resources[0].resourceId === 'res-react-docs') {
      console.log('  [PASS] "Open Again" moved React Docs back to index 0 (most recent).');
      passedTests++;
    } else {
      console.error('  [FAIL] Re-opened resource did not move to index 0:', listRes.data.resources);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 10 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 11: Non-blocking error resilience (Missing token yields 401, but does not crash server)
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 11: API error handling resilience');
  try {
    const unauthPost = await axios.post(
      `${API_BASE}/resources/recent`,
      {
        resourceId: 'res-fail-test',
        title: 'Fail Test',
        url: 'https://example.com',
      },
      { validateStatus: () => true }
    );

    if (unauthPost.status === 401) {
      console.log('  [PASS] Unauthenticated POST rejected with 401 without crashing.');
      passedTests++;
    } else {
      console.error('  [FAIL] Unexpected response status:', unauthPost.status);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 11 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 12: No hard-coded demo resources in DB
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 12: No hardcoded demo resources injected by default');
  try {
    const userCRes = await axios.post(`${API_BASE}/auth/signup`, {
      name: 'Student C',
      email: `student.c.${Date.now()}@test.com`,
      password: 'Password@12345',
    });
    const tokenC = userCRes.data.accessToken;

    const userCList = await axios.get(`${API_BASE}/resources/recent`, {
      headers: { Authorization: `Bearer ${tokenC}` },
    });

    if (userCList.data.resources.length === 0) {
      console.log('  [PASS] Brand new user has zero fake/hardcoded default resources.');
      passedTests++;
    } else {
      console.error('  [FAIL] Found unwanted demo resources:', userCList.data.resources);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 12 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 13: Multiple resource types work (video, article, doc, practice, project)
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 13: Multiple resource types supported');
  try {
    const types = ['video', 'playlist', 'documentation', 'practice', 'project', 'course'];
    for (const t of types) {
      await axios.post(
        `${API_BASE}/resources/recent`,
        {
          resourceId: `type-test-${t}`,
          title: `Sample ${t} resource`,
          provider: 'TestProvider',
          type: t,
          url: `https://example.com/${t}`,
        },
        { headers: { Authorization: `Bearer ${tokenA}` } }
      );
    }

    const typeDocs = await RecentResource.find({ resourceId: /^type-test-/ });
    if (typeDocs.length === types.length) {
      console.log(`  [PASS] All ${types.length} resource types successfully stored.`);
      passedTests++;
    } else {
      console.error('  [FAIL] Type test count mismatch:', typeDocs.length);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 13 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 14: Truthful timestamps
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 14: Real timestamps attached to records');
  try {
    const sample = await RecentResource.findOne({ resourceId: 'res-react-docs' });
    const now = Date.now();
    const diff = Math.abs(now - (sample?.lastOpenedAt?.getTime() || 0));

    if (sample && diff < 60000) {
      console.log(`  [PASS] Valid timestamp verified within recent window (${Math.round(diff / 1000)}s ago).`);
      passedTests++;
    } else {
      console.error('  [FAIL] Malformed or stale timestamp:', sample?.lastOpenedAt);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 14 failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 15: Invalid resource URLs rejected safely
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 15: Invalid/malformed URLs handled safely');
  try {
    const invalidUrlRes = await axios.post(
      `${API_BASE}/resources/recent`,
      {
        resourceId: 'res-invalid-url',
        title: 'Invalid URL Test',
        url: 'not-a-valid-url',
      },
      {
        headers: { Authorization: `Bearer ${tokenA}` },
        validateStatus: () => true,
      }
    );

    if (invalidUrlRes.status === 400 && !invalidUrlRes.data.success) {
      console.log('  [PASS] Invalid URL rejected with 400 Validation Error.');
      passedTests++;
    } else {
      console.error('  [FAIL] Invalid URL was unexpectedly accepted:', invalidUrlRes.status, invalidUrlRes.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] TEST 15 failed:', err.message);
  }

  // Clean up test data
  await RecentResource.deleteMany({});
  await User.deleteMany({ email: { $in: [userAEmail, userBEmail] } });

  console.log('\n================================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('================================================================\n');

  await mongoose.connection.close();

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();

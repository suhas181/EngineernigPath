import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import http from 'http';
import app from '../app';

const PORT = 5098;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function runHealthAndReliabilityTests() {
  console.log('================================================================');
  console.log('🩺 ENGINEERPATH PRODUCTION HEALTH & RELIABILITY TEST SUITE');
  console.log('================================================================\n');

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/engineerpath';
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri);
  }

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, '127.0.0.1', resolve));

  let passed = 0;
  const total = 5;

  // ── TEST 1: Liveness Endpoint (/health/live) ─────────────────────────────
  console.log('TEST 1: Liveness probe confirms process is running');
  try {
    const res = await axios.get(`${BASE_URL}/health/live`);
    if (res.status === 200 && res.data.status === 'live' && typeof res.data.uptime === 'number') {
      console.log(`  [PASS] /health/live returned HTTP 200 OK (uptime: ${res.data.uptime}s)`);
      passed++;
    } else {
      console.error('  [FAIL] Unexpected liveness response:', res.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] Liveness probe error:', err.message);
  }

  // ── TEST 2: Readiness Endpoint (/health/ready) ───────────────────────────
  console.log('\nTEST 2: Readiness probe confirms MongoDB dependency is ready');
  try {
    const res = await axios.get(`${BASE_URL}/health/ready`);
    if (res.status === 200 && res.data.status === 'ready' && res.data.database === 'connected') {
      console.log(`  [PASS] /health/ready returned HTTP 200 OK with database 'connected'`);
      passed++;
    } else {
      console.error('  [FAIL] Unexpected readiness response:', res.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] Readiness probe error:', err.message);
  }

  // ── TEST 3: Comprehensive Health Endpoint (/health) ───────────────────────
  console.log('\nTEST 3: Comprehensive /health endpoint reports overall health & checks');
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    if (
      res.status === 200 &&
      res.data.status === 'healthy' &&
      res.data.checks?.database === 'connected' &&
      res.data.checks?.liveness === 'ok'
    ) {
      console.log(`  [PASS] /health returned HTTP 200 OK with comprehensive health checks.`);
      passed++;
    } else {
      console.error('  [FAIL] Unexpected health response:', res.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] Health check error:', err.message);
  }

  // ── TEST 4: No Sensitive Infrastructure / Secrets Exposure in Probes ─────
  console.log('\nTEST 4: Health probes do not expose secrets, credentials, or internal IPs');
  try {
    const [liveRes, readyRes, healthRes] = await Promise.all([
      axios.get(`${BASE_URL}/health/live`),
      axios.get(`${BASE_URL}/health/ready`),
      axios.get(`${BASE_URL}/health`),
    ]);

    const combinedStr = JSON.stringify([liveRes.data, readyRes.data, healthRes.data]);
    const forbiddenPatterns = [
      /mongodb(\+srv)?:\/\//i,
      /password/i,
      /secret/i,
      /apikey/i,
      /token/i,
    ];

    const leaked = forbiddenPatterns.some((pattern) => pattern.test(combinedStr));
    if (!leaked) {
      console.log('  [PASS] Zero secrets or connection strings detected in health responses.');
      passed++;
    } else {
      console.error('  [FAIL] Health probe leaked sensitive pattern in response:', combinedStr);
    }
  } catch (err: any) {
    console.error('  [FAIL] Test 4 error:', err.message);
  }

  // ── TEST 5: Base API Info Endpoints (/, /api) ────────────────────────────
  console.log('\nTEST 5: Root API information endpoints return online state');
  try {
    const res = await axios.get(`${BASE_URL}/api`);
    if (res.status === 200 && res.data.name && res.data.livenessProbe && res.data.readinessProbe) {
      console.log(`  [PASS] /api returned root system metadata.`);
      passed++;
    } else {
      console.error('  [FAIL] Unexpected /api response:', res.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] Base API info error:', err.message);
  }

  console.log('\n================================================================');
  console.log(`🏁 HEALTH AUDIT RESULTS: ${passed} / ${total} PASSED`);
  console.log('================================================================\n');

  server.close();
  await mongoose.disconnect();

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runHealthAndReliabilityTests();

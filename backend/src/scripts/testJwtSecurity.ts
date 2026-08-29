import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getJwtSecret,
  getJwtRefreshSecret,
  validateJwtEnvironment,
} from '../utils/jwt';

async function runJwtTests() {
  console.log('================================================================');
  console.log('🔐 ENGINEERPATH JWT SECURITY & SECRETS AUDIT TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  const total = 4;

  const originalSecret = process.env.JWT_SECRET;
  const originalRefreshSecret = process.env.JWT_REFRESH_SECRET;

  // -------------------------------------------------------------------------
  // TEST 1: Missing JWT_SECRET throws clear error
  // -------------------------------------------------------------------------
  console.log('TEST 1: Missing JWT_SECRET fails explicitly with security error');
  try {
    delete process.env.JWT_SECRET;
    try {
      getJwtSecret();
      console.error('  [FAIL] Did not throw on missing JWT_SECRET');
    } catch (err: any) {
      if (err.message.includes('Missing required environment variable: JWT_SECRET')) {
        console.log('  [PASS] Successfully threw explicit error on missing JWT_SECRET.');
        passed++;
      } else {
        console.error('  [FAIL] Unexpected error message:', err.message);
      }
    }
  } finally {
    process.env.JWT_SECRET = originalSecret;
  }

  // -------------------------------------------------------------------------
  // TEST 2: Missing JWT_REFRESH_SECRET throws clear error
  // -------------------------------------------------------------------------
  console.log('\nTEST 2: Missing JWT_REFRESH_SECRET fails explicitly with security error');
  try {
    delete process.env.JWT_REFRESH_SECRET;
    try {
      getJwtRefreshSecret();
      console.error('  [FAIL] Did not throw on missing JWT_REFRESH_SECRET');
    } catch (err: any) {
      if (err.message.includes('Missing required environment variable: JWT_REFRESH_SECRET')) {
        console.log('  [PASS] Successfully threw explicit error on missing JWT_REFRESH_SECRET.');
        passed++;
      } else {
        console.error('  [FAIL] Unexpected error message:', err.message);
      }
    }
  } finally {
    process.env.JWT_REFRESH_SECRET = originalRefreshSecret;
  }

  // -------------------------------------------------------------------------
  // TEST 3: Startup validator passes with valid environment
  // -------------------------------------------------------------------------
  console.log('\nTEST 3: Startup validator executes cleanly when secrets are configured');
  try {
    validateJwtEnvironment();
    console.log('  [PASS] validateJwtEnvironment() succeeded without errors.');
    passed++;
  } catch (err: any) {
    console.error('  [FAIL] validateJwtEnvironment failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 4: Token generation and verification works with configured secrets
  // -------------------------------------------------------------------------
  console.log('\nTEST 4: Token generation and verification functionality');
  try {
    const testUserId = 'user-test-123456';
    const accessToken = generateAccessToken(testUserId);
    const refreshToken = generateRefreshToken(testUserId);

    const decodedAccess = verifyAccessToken(accessToken);
    const decodedRefresh = verifyRefreshToken(refreshToken);

    if (decodedAccess.id === testUserId && decodedRefresh.id === testUserId) {
      console.log('  [PASS] Both access and refresh tokens signed and verified successfully.');
      passed++;
    } else {
      console.error('  [FAIL] Decoded token payload mismatch:', { decodedAccess, decodedRefresh });
    }
  } catch (err: any) {
    console.error('  [FAIL] Token generation/verification error:', err.message);
  }

  console.log('\n================================================================');
  console.log(`🏁 JWT AUDIT RESULTS: ${passed} / ${total} PASSED`);
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runJwtTests();

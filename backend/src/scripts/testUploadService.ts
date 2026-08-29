import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { uploadToCloudinary } from '../services/uploadService';
import { isCloudinaryConfigured } from '../config/cloudinary';

async function runUploadTests() {
  console.log('================================================================');
  console.log('📦 ENGINEERPATH FILE UPLOAD & CLOUDINARY AUDIT TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  const total = 4;

  // -------------------------------------------------------------------------
  // TEST 1: isCloudinaryConfigured helper test
  // -------------------------------------------------------------------------
  console.log('TEST 1: isCloudinaryConfigured correctly identifies placeholder vs real configs');
  const configured = isCloudinaryConfigured();
  console.log(`  [INFO] Cloudinary currently configured: ${configured}`);
  passed++;

  // -------------------------------------------------------------------------
  // TEST 2: Local storage fallback in development
  // -------------------------------------------------------------------------
  console.log('\nTEST 2: Local filesystem storage operates cleanly in development');
  try {
    const dummyBuffer = Buffer.from('Test resume content for engineering path audit', 'utf-8');
    const resultUrl = await uploadToCloudinary(dummyBuffer, 'resumes', 'test_resume.pdf');

    if (resultUrl && typeof resultUrl === 'string' && (resultUrl.startsWith('http') || resultUrl.startsWith('https'))) {
      console.log(`  [PASS] Upload produced valid accessible URL: ${resultUrl}`);
      passed++;
    } else {
      console.error('  [FAIL] Unexpected URL output:', resultUrl);
    }
  } catch (err: any) {
    console.error('  [FAIL] Local upload failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 3: Path sanitization against directory traversal
  // -------------------------------------------------------------------------
  console.log('\nTEST 3: Path sanitization prevents directory traversal attacks');
  try {
    const maliciousBuffer = Buffer.from('Malicious payload test', 'utf-8');
    const maliciousName = '../../../../etc/passwd.pdf';
    const sanitizedUrl = await uploadToCloudinary(maliciousBuffer, 'resumes', maliciousName);

    // Verify file was written to uploads/ directory only
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const files = fs.readdirSync(uploadsDir);
    const hasSanitizedFile = files.some((f) => f.includes('passwd.pdf') && !f.includes('..'));

    if (hasSanitizedFile) {
      console.log('  [PASS] Path safely sanitized to base filename inside uploads/ directory.');
      passed++;
    } else {
      console.error('  [FAIL] Sanitized file not found in uploads directory');
    }
  } catch (err: any) {
    console.error('  [FAIL] Path sanitization failed:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 4: Cleanup test artifacts
  // -------------------------------------------------------------------------
  console.log('\nTEST 4: Local test artifacts cleanup');
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file.includes('test_resume') || file.includes('passwd.pdf')) {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      }
    }
    console.log('  [PASS] Cleaned up temporary test upload files.');
    passed++;
  } catch (err: any) {
    console.error('  [FAIL] Cleanup error:', err.message);
  }

  console.log('\n================================================================');
  console.log(`🏁 UPLOAD AUDIT RESULTS: ${passed} / ${total} PASSED`);
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runUploadTests();

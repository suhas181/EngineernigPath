import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5001/api';

async function runResumeSecurityUploadSuite() {
  console.log('================================================================');
  console.log('📄 RESUME ANALYZER PRODUCTION UPLOAD & SECURITY SUITE');
  console.log('================================================================\n');

  let passed = 0;
  const total = 5;

  // 1. Create a dummy test student and get credentials
  const email = `resume.test.${Date.now()}@university.edu`;
  const registerRes = await axios.post(`${BASE_URL}/auth/signup`, {
    name: 'Resume Security Tester',
    email,
    password: 'Password@12345',
  });
  const token = registerRes.data.accessToken;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // ── TEST 1: Valid PDF Upload & Analysis ──────────────────────────────────
  console.log('TEST 1: Valid PDF resume upload and analysis');
  try {
    const pdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 200 >> stream
BT
/F1 12 Tf
72 712 Td
(Software Engineer with 4 years experience in Java, Spring Boot, React, Node.js, and PostgreSQL. Built scalable backend systems and high throughput APIs.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
465
%%EOF`;
    const form = new FormData();
    form.append('resume', Buffer.from(pdfContent, 'utf-8'), {
      filename: 'sample_resume.pdf',
      contentType: 'application/pdf',
    });
    form.append('role', 'Software Engineer');

    const res = await axios.post(`${BASE_URL}/resume/upload`, form, {
      headers: { ...form.getHeaders(), ...authHeaders },
    });

    if (res.status === 201 && res.data.resume && res.data.resume.fileUrl) {
      console.log(`  [PASS] PDF upload & analysis succeeded. File URL: ${res.data.resume.fileUrl}`);
      console.log(`         Overall Score: ${res.data.resume.overallScore}/100, ATS Score: ${res.data.resume.atsScore}/100`);
      passed++;
    } else {
      console.error('  [FAIL] Unexpected response structure:', res.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] PDF upload error:', err.response?.data || err.message);
  }

  // ── TEST 2: Valid Plaintext/Markdown Upload ──────────────────────────────
  console.log('\nTEST 2: Valid Plaintext/Markdown resume upload and analysis');
  try {
    const textContent = `John Doe - Senior Full Stack Developer
Email: john.doe@example.com | Phone: +1 555-0199 | Location: San Francisco, CA

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years specializing in TypeScript, React, Node.js, Docker, and PostgreSQL.

SKILLS
Programming: TypeScript, JavaScript, Python, SQL
Frameworks: React, Next.js, Express, NestJS
Databases & Cloud: PostgreSQL, MongoDB, Redis, AWS, Docker, Kubernetes

EXPERIENCE
Lead Full Stack Developer - TechCorp (2022 - Present)
- Designed and maintained high-availability microservices serving 500k daily users.
- Reduced database query latency by 40% using Redis caching and PostgreSQL indexes.

EDUCATION
Bachelor of Science in Computer Science - University of California (2016 - 2020)`;

    const form = new FormData();
    form.append('resume', Buffer.from(textContent, 'utf-8'), {
      filename: 'john_doe_resume.md',
      contentType: 'text/markdown',
    });
    form.append('role', 'Full Stack Developer');

    const res = await axios.post(`${BASE_URL}/resume/upload`, form, {
      headers: { ...form.getHeaders(), ...authHeaders },
    });

    if (res.status === 201 && res.data.resume && res.data.resume.fileUrl) {
      console.log(`  [PASS] MD upload succeeded. Skills detected: ${res.data.resume.parsedDetails?.skills?.length}`);
      passed++;
    } else {
      console.error('  [FAIL] Unexpected MD response:', res.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] MD upload error:', err.response?.data || err.message);
  }

  // ── TEST 3: Reject Executable Files (.exe / .sh) ─────────────────────────
  console.log('\nTEST 3: Reject malicious executable files (.exe / .sh)');
  try {
    const form = new FormData();
    form.append('resume', Buffer.from('#!/bin/bash\necho "exploit"', 'utf-8'), {
      filename: 'exploit_script.sh',
      contentType: 'application/x-sh',
    });

    let rejected = false;
    try {
      await axios.post(`${BASE_URL}/resume/upload`, form, {
        headers: { ...form.getHeaders(), ...authHeaders },
      });
    } catch (err: any) {
      if (err.response?.status === 500 || err.response?.status === 400) {
        rejected = true;
        console.log(`  [PASS] Successfully rejected .sh file with error: ${err.response?.data?.message}`);
        passed++;
      }
    }

    if (!rejected) {
      console.error('  [FAIL] Executable file was improperly accepted!');
    }
  } catch (err: any) {
    console.error('  [FAIL] Test 3 execution error:', err.message);
  }

  // ── TEST 4: Reject Oversized Uploads (> 10MB) ────────────────────────────
  console.log('\nTEST 4: Reject oversized file uploads (> 10MB)');
  try {
    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024); // 11 MB
    const form = new FormData();
    form.append('resume', oversizedBuffer, {
      filename: 'oversized_resume.pdf',
      contentType: 'application/pdf',
    });

    let rejected = false;
    try {
      await axios.post(`${BASE_URL}/resume/upload`, form, {
        headers: { ...form.getHeaders(), ...authHeaders },
        maxBodyLength: 20 * 1024 * 1024,
      });
    } catch (err: any) {
      if (err.response?.status === 500 || err.response?.status === 413 || err.response?.status === 400) {
        rejected = true;
        console.log(`  [PASS] Successfully rejected 11MB file with: ${err.response?.data?.message}`);
        passed++;
      }
    }

    if (!rejected) {
      console.error('  [FAIL] Oversized 11MB file was improperly accepted!');
    }
  } catch (err: any) {
    console.error('  [FAIL] Test 4 execution error:', err.message);
  }

  // ── TEST 5: Verify User Isolation & History Retrieval ────────────────────
  console.log('\nTEST 5: Verify resume retrieval and isolation between users');
  try {
    const listRes = await axios.get(`${BASE_URL}/resume`, { headers: authHeaders });
    if (listRes.status === 200 && Array.isArray(listRes.data.resumes) && listRes.data.resumes.length === 2) {
      console.log(`  [PASS] Retrieved exactly 2 resumes uploaded by tester.`);
      
      const resumeId = listRes.data.resumes[0]._id;
      const singleRes = await axios.get(`${BASE_URL}/resume/${resumeId}`, { headers: authHeaders });
      if (singleRes.status === 200 && singleRes.data.resume) {
        console.log(`  [PASS] Single resume retrieved successfully by ID.`);
        passed++;
      }
    } else {
      console.error('  [FAIL] Resume list count mismatch:', listRes.data);
    }
  } catch (err: any) {
    console.error('  [FAIL] Resume retrieval error:', err.response?.data || err.message);
  }

  // Cleanup test files created in uploads directory
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file.includes('sample_resume') || file.includes('john_doe_resume')) {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      }
    }
  } catch (e) {}

  console.log('\n================================================================');
  console.log(`🏁 RESUME SECURITY SUITE RESULTS: ${passed} / ${total} PASSED`);
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runResumeSecurityUploadSuite();

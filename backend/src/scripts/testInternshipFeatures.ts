import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

import { isValidInternshipOpportunity } from '../services/internshipService';

console.log('====================================================');
console.log('INTERNSHIP VALIDATION UNIT TESTS');
console.log('====================================================\n');

const testCases = [
  // POSITIVE CASES (Should be ACCEPTED as internships)
  { title: 'Software Engineer Intern', description: 'Looking for a summer intern.', expected: true },
  { title: 'Frontend Developer Trainee', description: '6-month training program for fresh graduates.', expected: true },
  { title: 'Graduate Engineer Trainee - Full Stack', description: 'For batch 2026/2025 engineering graduates.', expected: true },
  { title: 'Co-op Student - Software Development', description: '4-month co-op term.', expected: true },
  { title: 'AI / ML Research Intern', description: 'Hands-on internship in deep learning.', expected: true },
  { title: 'Cybersecurity Apprentice', description: 'Apprenticeship program with stipend.', expected: true },
  { title: 'Software Developer', description: 'Internship duration: 6 months. Stipend: 25k/month.', expected: true },

  // NEGATIVE CASES (Should be REJECTED as normal full-time / senior roles)
  { title: 'Senior Software Engineer', description: '5+ years experience required.', expected: false },
  { title: 'Engineering Manager', description: 'Manage a team of 8 developers.', expected: false },
  { title: 'Staff Engineer', description: 'Lead architecture across teams.', expected: false },
  { title: 'Software Engineer II', description: 'Mid-level role with 3 years experience.', expected: false },
  { title: 'Lead Backend Developer', description: 'Will mentor junior engineers and interns.', expected: false },
  { title: 'Principal Architect', description: 'Design enterprise cloud systems.', expected: false },
  { title: 'Senior Developer - React', description: 'Great opportunity, will supervise interns.', expected: false },
  { title: 'Software Engineer', description: 'Standard full-time role at multinational corporation.', expected: false },
];

let passedCount = 0;

testCases.forEach((tc, idx) => {
  const result = isValidInternshipOpportunity({ title: tc.title, description: tc.description });
  const passed = result === tc.expected;
  if (passed) passedCount++;

  console.log(
    `[${passed ? 'PASS' : 'FAIL'}] Case ${idx + 1}: "${tc.title}" -> Result: ${result} (Expected: ${tc.expected})`
  );
});

console.log(`\nResults: ${passedCount}/${testCases.length} tests passed.`);
if (passedCount === testCases.length) {
  console.log('✅ ALL VALIDATOR TEST CASES PASSED SUCCESSFULLY.\n');
} else {
  console.error('❌ SOME TEST CASES FAILED.\n');
  process.exit(1);
}

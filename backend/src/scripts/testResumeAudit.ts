import {
  computeExtractionMetadata,
  determineAnalysisConfidence,
  getFallbackExtraction,
  getFallbackScoring,
  normalizeKeyword,
  computeOverallScore,
} from '../services/resumePipelineService';
import { detectPlaceholders } from '../controllers/resumeController';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING RESUME ANALYZER AUDIT & COMPLIANCE TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Placeholder Detection
  console.log('--- Test 1: Placeholder Detection ---');
  const sampleWithPlaceholders = `
    Software Engineer at <company>
    - Improved API latency by [number]% improvement
    - Handled [number] users across distributed servers
    - TODO: add achievements
    - XXX: review dates
    - Lorem ipsum dolor sit amet
  `;
  const placeholders = detectPlaceholders(sampleWithPlaceholders);
  assert(placeholders.length >= 5, `Expected >= 5 placeholders, found ${placeholders.length}`);
  const hasNumberPercent = placeholders.some((p) => p.text.includes('[number]%'));
  const hasTodo = placeholders.some((p) => p.text === 'TODO');
  const hasCompany = placeholders.some((p) => p.text === '<company>');
  assert(hasNumberPercent, 'Detected [number]% placeholder');
  assert(hasTodo, 'Detected TODO placeholder');
  assert(hasCompany, 'Detected <company> placeholder');

  // Test 2: Pipe Separator vs Table False Positive Check
  console.log('\n--- Test 2: Pipe Separator Layout Detection (No False Positive) ---');
  const resumeWithPipes = `
    John Doe
    john@example.com | +1 555-0199 | Austin, TX
    Software Engineer | Backend Systems | May 2022 - Present
    Built high-throughput services using Java and Spring Boot.
    Education: BS Computer Science | University of Texas | 2018 - 2022
  `;
  const metaWithPipes = computeExtractionMetadata(resumeWithPipes);
  assert(metaWithPipes.tablesDetected === false, 'Pipe separator headers must NOT be flagged as tables');
  assert(metaWithPipes.multiColumnSuspected === false, 'Normal text lines must NOT be flagged as multi-column');

  // Test 3: Genuine Markdown Table Detection
  console.log('\n--- Test 3: Markdown Table Layout Detection ---');
  const resumeWithRealTable = `
    | Skill Area | Technologies | Proficiency |
    |---|---|---|
    | Languages | Java, Python, TypeScript | Advanced |
    | Frameworks | Spring Boot, React, Node.js | Proficient |
    | Databases | PostgreSQL, MongoDB, Redis | Proficient |
  `;
  const metaWithRealTable = computeExtractionMetadata(resumeWithRealTable);
  assert(metaWithRealTable.tablesDetected === true, 'Markdown tables must be accurately detected');

  // Test 4: Normal Bullet Indentation (No False Positive Multi-Column)
  console.log('\n--- Test 4: Bullet Indentation (No False Positive Multi-Column) ---');
  const resumeWithIndentation = `
    Senior Software Engineer
        * Designed and implemented distributed microservices in Go.
        * Reduced p99 latency by 45% using Redis caching.
        * Mentored 4 junior engineers on clean architecture.
  `;
  const metaWithIndentation = computeExtractionMetadata(resumeWithIndentation);
  assert(metaWithIndentation.multiColumnSuspected === false, 'Indented bullets must NOT be flagged as multi-column');

  // Test 5: Zero-Fabrication Fallback Extraction Check
  console.log('\n--- Test 5: Zero-Fabrication Fallback Extraction ---');
  const sparseResume = `
    Alice Smith
    alice.smith@devmail.org
    Skills: Python, Docker, AWS, PostgreSQL
  `;
  const fallbackExtracted = getFallbackExtraction(sparseResume);
  assert(fallbackExtracted.contact_info.email === 'alice.smith@devmail.org', 'Extracted real email');
  assert(fallbackExtracted.education.length === 0, 'Education must be empty [] (NO fabricated universities)');
  assert(fallbackExtracted.experience.length === 0, 'Experience must be empty [] (NO fabricated companies)');
  assert(fallbackExtracted.skills.technical.includes('Python'), 'Extracted real Python skill');
  assert(!fallbackExtracted.skills.technical.includes('JavaScript'), 'Did NOT fabricate JavaScript');
  assert(fallbackExtracted.parsing_warnings.length > 0, 'Reported missing section warnings');

  // Test 6: Keyword Alias & Acronym Normalization
  console.log('\n--- Test 6: Keyword Normalization ---');
  assert(normalizeKeyword('JS') === 'javascript', 'JS normalized to javascript');
  assert(normalizeKeyword('K8s') === 'kubernetes', 'K8s normalized to kubernetes');
  assert(normalizeKeyword('Postgres') === 'postgresql', 'Postgres normalized to postgresql');
  assert(normalizeKeyword('AWS') === 'amazon web services', 'AWS normalized to amazon web services');
  assert(normalizeKeyword('CI/CD') === 'continuous integration / continuous deployment', 'CI/CD normalized');

  // Test 7: JD Matcher with Acronyms & Context
  console.log('\n--- Test 7: JD Matcher with Aliases & Context ---');
  const candidateWithAliases = {
    contact_info: { name: 'Bob', email: 'bob@example.com' },
    skills: { technical: ['JS', 'K8s', 'Postgres', 'Docker'], tools_and_technologies: ['Git'], soft: [] },
    experience: [{ company: 'Cloud Corp', role: 'DevOps Engineer', responsibilities: ['Deployed microservices with Kubernetes and AWS CI/CD pipelines'] }],
    education: [{ institution: 'State Univ', degree: 'BS CS' }],
    projects: [],
  };
  const jd = 'Seeking engineer with JavaScript, Kubernetes, Amazon Web Services, and CI/CD experience.';
  const scoringResult = getFallbackScoring(candidateWithAliases, 'DevOps Engineer', jd);
  assert(scoringResult.job_match_score !== null && scoringResult.job_match_score >= 70, `JD match score expected >= 70, got ${scoringResult.job_match_score}`);
  assert(scoringResult.matched_keywords.length >= 3, `Matched keywords expected >= 3, got ${scoringResult.matched_keywords.length}`);

  // Test 8: Empty Resume Handling & Low Confidence
  console.log('\n--- Test 8: Empty Resume Handling ---');
  const emptyMeta = computeExtractionMetadata('');
  const emptyExtracted = getFallbackExtraction('');
  const emptyConfidence = determineAnalysisConfidence(emptyExtracted, emptyMeta, 0);
  assert(emptyConfidence === 'LOW', 'Empty text must result in LOW confidence');
  assert(emptyExtracted.skills.technical.length === 0, 'No synthetic skills on empty resume');

  // Test 9: Deterministic Overall Score Formula
  console.log('\n--- Test 9: Deterministic Score Computation ---');
  const scoreWithJd = computeOverallScore({
    job_match_score: 80,
    content_quality_score: 70,
    ats_compatibility_score: 90,
  });
  // 90*0.20 (18) + 70*0.20 (14) + 80*0.25 (20) + 70*0.15 (10.5) + 70*0.10 (7) + 90*0.10 (9) = 78.5 -> 79
  assert(scoreWithJd === 79, `Expected weighted score 79, got ${scoreWithJd}`);

  const scoreWithoutJd = computeOverallScore({
    content_quality_score: 80,
    ats_compatibility_score: 90,
  });
  // 90*0.25 (22.5) + 80*0.25 (20) + 80*0.20 (16) + 80*0.15 (12) + 90*0.15 (13.5) = 84
  assert(scoreWithoutJd === 84, `Expected weighted score 84, got ${scoreWithoutJd}`);

  console.log('\n====================================================');
  console.log('ALL RESUME ANALYZER AUDIT & COMPLIANCE TESTS PASSED!');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

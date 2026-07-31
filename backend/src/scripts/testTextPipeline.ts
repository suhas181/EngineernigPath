import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import {
  executeStage1Extraction,
  executeStage2Scoring,
  computeOverallScore,
} from '../services/resumePipelineService';

const sampleTextResume = `
BHARATH CHANDRA
Email: bharath.dev@example.com | Phone: +91 9876543210 | Location: Bengaluru, India
GitHub: github.com/bharath-dev | LinkedIn: linkedin.com/in/bharath-dev

SUMMARY
Results-driven Java Backend Developer with 3+ years of experience designing scalable microservices, RESTful APIs, and cloud-native backend systems. Proficient in Core Java, Spring Boot, Hibernate, SQL, and Git.

TECHNICAL SKILLS
- Core Languages: Java, Core Java, SQL, TypeScript, JavaScript
- Frameworks & Libraries: Spring Boot, Spring MVC, Hibernate, Node.js, React
- Databases: PostgreSQL, MongoDB, MySQL
- Tools & Utilities: Git, Maven, Postman, Linux, JIRA

WORK EXPERIENCE
Software Engineer | Tech Solutions Pvt Ltd | Jan 2024 – Present
- Engineered 15+ REST API endpoints using Java & Spring Boot, handling over 500,000 daily requests.
- Optimized PostgreSQL database queries, reducing average API response latency by 35%.
- Implemented JWT-based authentication and role-based access control across 4 microservices.

Junior Java Developer | Cloud Systems Inc | Jun 2022 – Dec 2023
- Built automated data processing pipelines in Core Java, processing 200GB+ log files daily.
- Collaborated with frontend teams to integrate REST APIs into React web dashboards.

PROJECTS
E-Commerce Microservices Engine
- Designed a modular microservices architecture utilizing Spring Boot and Spring Cloud.
- Technologies: Java, Spring Boot, PostgreSQL, Docker, Git

EDUCATION
Bachelor of Technology in Computer Science & Engineering | PES University | 2018 – 2022
CGPA: 8.7/10.0
`;

const targetRole = 'Senior Java Developer';
const sampleJobDescription = `
We are seeking a Senior Java Developer to lead backend services.
Requirements:
- Strong expertise in Core Java, Java 17+, and Spring Boot
- Practical experience with Apache Kafka message brokers
- Hands-on deployment using Kubernetes and Docker containerization
- Microservices design patterns & CI/CD deployment automation
`;

async function runTextPipelineTest() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING ATS RESUME PIPELINE TEST (TEXT FORMAT)');
  console.log('==================================================\n');

  console.log('📄 Input Resume Format: PLAIN TEXT (.txt / .md)');
  console.log('🎯 Target Role:', targetRole);
  console.log('💼 Job Description:', sampleJobDescription.trim().replace(/\n+/g, ' '));
  console.log('\n--------------------------------------------------');
  console.log('⚡ STEP 1: EXECUTING STAGE 1 EXTRACTION (Reasoning: OFF, temp: 0)...');
  console.log('--------------------------------------------------');

  const startTime1 = Date.now();
  const extractionResult = await executeStage1Extraction(sampleTextResume);
  const duration1 = Date.now() - startTime1;

  console.log(`✅ Stage 1 Complete (${duration1}ms)`);
  console.log('   Extracted Name:', extractionResult.contact_info?.name || 'N/A');
  console.log('   Extracted Email:', extractionResult.contact_info?.email || 'N/A');
  console.log('   Extracted Technical Skills:', (extractionResult.skills?.technical || []).join(', '));
  console.log('   Projects Count:', extractionResult.projects?.length || 0);
  console.log('   Experience Count:', extractionResult.experience?.length || 0);
  console.log('   Parsing Warnings:', extractionResult.parsing_warnings?.length || 0);

  console.log('\n--------------------------------------------------');
  console.log('⚡ STEP 2: EXECUTING STAGE 2 SCORING (Reasoning: ON, temp: 0.6)...');
  console.log('--------------------------------------------------');

  const startTime2 = Date.now();
  const scoringResult = await executeStage2Scoring(extractionResult, targetRole, sampleJobDescription);
  const duration2 = Date.now() - startTime2;

  console.log(`✅ Stage 2 Complete (${duration2}ms)`);

  const overallScore = computeOverallScore(scoringResult);

  console.log('\n==================================================');
  console.log('📊 WELL-FORMATTED RESUME ANALYSIS REPORT');
  console.log('==================================================\n');

  const formattedReport = `
============================================================
           ATS RESUME EVALUATION REPORT
============================================================
TARGET ROLE  : ${targetRole}
CANDIDATE    : ${extractionResult.contact_info?.name || 'Candidate'}
FILE FORMAT  : PLAIN TEXT (.txt)

------------------------------------------------------------
SCORE BREAKDOWN
------------------------------------------------------------
[OVERALL SCORE]            : ${overallScore} / 100
[JOB MATCH SCORE]          : ${scoringResult.job_match_score ?? 'N/A'} / 100
[CONTENT QUALITY SCORE]    : ${scoringResult.content_quality_score} / 100
[ATS COMPATIBILITY SCORE]  : ${scoringResult.ats_compatibility_score} / 100

------------------------------------------------------------
EVALUATION SUMMARY
------------------------------------------------------------
${scoringResult.summary}

------------------------------------------------------------
KEYWORD GAP ANALYSIS
------------------------------------------------------------
✅ MATCHED KEYWORDS:
   ${(scoringResult.matched_keywords || []).join(', ') || 'None'}

❌ MISSING KEYWORDS (REQUIRED BY JOB):
   ${(scoringResult.missing_keywords || []).join(', ') || 'None'}

------------------------------------------------------------
ACTIONABLE IMPROVEMENT RECOMMENDATIONS
------------------------------------------------------------
${
  (scoringResult.improvement_suggestions || [])
    .map(
      (s: any, idx: number) => `
[RECOMMENDATION #${idx + 1}]
  • SECTION    : ${s.section}
  • PRIORITY   : [${(s.priority || 'MED').toUpperCase()}]
  • REFERENCE  : "${s.reference || 'N/A'}"
  • ISSUE      : ${s.issue}
  • ACTION     : ${s.suggestion}`
    )
    .join('\n') || '  No critical issues detected.'
}

------------------------------------------------------------
STRENGTHS & AREAS FOR GROWTH
------------------------------------------------------------
💪 KEY STRENGTHS:
   ${(scoringResult.strengths || []).map((s: string) => `• ${s}`).join('\n   ')}

⚠️ AREAS FOR GROWTH:
   ${(scoringResult.weaknesses || []).map((w: string) => `• ${w}`).join('\n   ')}
============================================================
`;

  console.log(formattedReport);

  // Assertions for test validation
  if (overallScore > 0 && scoringResult.content_quality_score > 0) {
    console.log('✅ TEST PASSED: Stage 1 & Stage 2 completed successfully for text format resume!');
    process.exit(0);
  } else {
    console.error('❌ TEST FAILED: Pipeline returned invalid scores.');
    process.exit(1);
  }
}

runTextPipelineTest().catch((err) => {
  console.error('❌ TEST SCRIPT ERROR:', err);
  process.exit(1);
});

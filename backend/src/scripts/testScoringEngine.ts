import {
  computeMultiDimensionalScore,
  calculateAtsCompatibilityScore,
  calculateJdMatchScore,
  calculateExperienceEvidenceScore,
  calculateProjectQualityScore,
  calculateCompletenessScore,
  detectPlaceholders,
  computeOverallScore,
} from '../services/resumePipelineService';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log('====================================================');
console.log('STARTING RESUME SCORING ENGINE AUDIT TEST SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// FIXTURES
// ----------------------------------------------------

const EXCELLENT_RESUME_TEXT = `
Alex Morgan
alex.morgan@techdev.io | (555) 234-5678 | San Francisco, CA
linkedin.com/in/alexmorgan | github.com/alexmorgan

SUMMARY
Senior Fullstack Engineer with 5+ years of experience architecting distributed cloud systems, high-throughput React applications, and microservices in Node.js, TypeScript, and PostgreSQL.

SKILLS
Programming Languages: JavaScript, TypeScript, Python, SQL, HTML, CSS
Frameworks & Libraries: React, Node.js, Express, Next.js, Redux, Tailwind CSS
Databases: PostgreSQL, MongoDB, Redis
Cloud & DevOps: Docker, Kubernetes, AWS, CI/CD, Git, Linux, REST API, GraphQL

WORK EXPERIENCE
Senior Fullstack Engineer | Stripe Systems | 2021 - Present
- Architected high-throughput payment checkout pipeline in Node.js and TypeScript handling 50,000 requests/minute with 99.99% uptime.
- Optimized PostgreSQL database query execution and Redis caching layers, reducing API latency by 45%.
- Led migration of legacy monolith to Kubernetes microservices on AWS, reducing cloud infrastructure costs by $120,000 annually.
- Spearheaded adoption of CI/CD automated test pipelines, increasing team deployment frequency by 300%.

Software Engineer | Acme Software | 2018 - 2021
- Developed responsive React customer dashboard used by 250,000 active monthly enterprise users.
- Built secure RESTful API endpoints with JWT authentication and rate limiting.
- Automated end-to-end testing with Jest and Cypress, reducing production bug reports by 35%.

PROJECTS
Cloud Infrastructure Health Visualizer | React, TypeScript, Docker, AWS | github.com/alexmorgan/cloud-health
- Built real-time cloud resource monitoring dashboard tracking 1,000+ Kubernetes cluster nodes.
- Integrated WebSocket streaming pipeline reducing event propagation delay to under 50ms.

Distributed Transaction Cache | Go, Redis, PostgreSQL | github.com/alexmorgan/dist-cache
- Engineered high-concurrency memory cache supporting 10,000 operations/sec with automated failover.

EDUCATION
BS in Computer Science | Stanford University | 2014 - 2018 | 3.9 GPA
`;

const AVERAGE_RESUME_TEXT = `
Jordan Lee
jordan@email.com | (555) 987-6543
linkedin.com/in/jordanlee

SKILLS
JavaScript, React, HTML, CSS, Git, Webpack

EXPERIENCE
Junior Web Developer | Tech Solutions | 2022 - Present
- Worked on client web applications using React and CSS.
- Handled bug fixes and developed UI components for landing pages.
- Assisted team with code reviews and Git version control.

PROJECTS
E-Commerce Storefront
- Built an online store using React and CSS with shopping cart features.

EDUCATION
BS in Information Technology | State University | 2018 - 2022
`;

const WEAK_RESUME_TEXT = `
John Doe
[insert email] | [insert phone]

SKILLS
Worked with some computers and web design.

EXPERIENCE
Company: <company> | Role: Developer | 2023
- Worked on tasks assigned by manager.
- Handled website updates.
- Achieved [number]% improvement in performance.
- TODO: add more achievements.

PROJECTS
Website
- Built a website using React.

EDUCATION
College | Degree
`;

const FRESHER_RESUME_TEXT = `
Priya Sharma
priya.sharma@college.edu | (555) 345-6789 | Bangalore, India
github.com/priyasharma | linkedin.com/in/priyasharma

EDUCATION
B.Tech in Computer Science & Engineering | National Institute of Technology | 2020 - 2024 | 8.8 CGPA

SKILLS
Languages: Java, Python, JavaScript, TypeScript, SQL
Frameworks: React, Spring Boot, Node.js, Express
Databases: PostgreSQL, MySQL, MongoDB
Tools: Docker, Git, Linux, REST API

INTERNSHIPS
Software Engineering Intern | TechCorp India | Jan 2024 - June 2024
- Built REST APIs in Spring Boot and PostgreSQL supporting 10,000 daily user transactions.
- Designed responsive React frontend modules, reducing page load times by 28%.
- Integrated JUnit automated test suites achieving 92% code coverage.

PROJECTS
Smart Campus Management System | React, Node.js, MongoDB, Docker | github.com/priyasharma/campus-mgr
- Architected comprehensive student management portal handling 5,000 concurrent student logins.
- Designed JWT role-based authentication and real-time attendance tracking via WebSockets.
- Deployed microservices using Docker containers on AWS EC2.

Algorithmic Trading Bot | Python, Pandas, REST API | github.com/priyasharma/algo-trader
- Developed quantitative trading simulation engine analyzing 50,000 historical stock ticks.
- Implemented moving average convergence algorithms achieving 18% annualized simulated returns.

ACHIEVEMENTS & CERTIFICATIONS
- AWS Certified Cloud Practitioner (2023)
- Finalist, Smart India Hackathon (2023)
`;

const TARGET_JD = `
We are looking for a Senior Fullstack Engineer with strong proficiency in React, TypeScript, Node.js, PostgreSQL, Docker, and AWS.
Responsibilities:
- Build and scale high-throughput REST APIs and microservices.
- Design responsive, modern React frontend interfaces.
- Work with cloud deployment, CI/CD, and Docker containers.
- Optimize database queries in PostgreSQL.
`;

const MISMATCHED_JD = `
We are looking for an Embedded Firmware Engineer with expertise in C, C++, ARM Cortex Microcontrollers, RTOS, I2C, SPI, and PCB Circuit Debugging.
`;

const DEFAULT_METADATA = {
  garbledTextRatio: 0,
  tablesDetected: false,
  multiColumnSuspected: false,
  extractionConfidence: 1.0,
};

// ----------------------------------------------------
// TEST 1: Excellent Resume Score Range
// ----------------------------------------------------
console.log('--- Test 1: Excellent Senior Resume Scoring ---');
const extExcellent = {
  contact_info: { name: 'Alex Morgan', email: 'alex.morgan@techdev.io', phone: '(555) 234-5678', linkedin: 'linkedin.com/in/alexmorgan', github: 'github.com/alexmorgan' },
  skills: {
    technical: ['JavaScript', 'TypeScript', 'Python', 'SQL', 'React', 'Node.js', 'Express', 'Next.js', 'Redux', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Git', 'REST API', 'GraphQL'],
    programming_languages: ['JavaScript', 'TypeScript', 'Python', 'SQL'],
    frameworks: ['React', 'Next.js', 'Express', 'Redux'],
    databases: ['PostgreSQL', 'MongoDB', 'Redis'],
    cloud_and_tools: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Git'],
  },
  experience: [
    {
      company: 'Stripe Systems',
      role: 'Senior Fullstack Engineer',
      duration: '2021 - Present',
      responsibilities: [
        'Architected high-throughput payment checkout pipeline in Node.js and TypeScript handling 50,000 requests/minute with 99.99% uptime.',
        'Optimized PostgreSQL database query execution and Redis caching layers, reducing API latency by 45%.',
        'Led migration of legacy monolith to Kubernetes microservices on AWS, reducing cloud infrastructure costs by $120,000 annually.',
        'Spearheaded adoption of CI/CD automated test pipelines, increasing team deployment frequency by 300%.',
      ],
    },
    {
      company: 'Acme Software',
      role: 'Software Engineer',
      duration: '2018 - 2021',
      responsibilities: [
        'Developed responsive React customer dashboard used by 250,000 active monthly enterprise users.',
        'Built secure RESTful API endpoints with JWT authentication and rate limiting.',
        'Automated end-to-end testing with Jest and Cypress, reducing production bug reports by 35%.',
      ],
    },
  ],
  projects: [
    {
      name: 'Cloud Infrastructure Health Visualizer',
      technologies: ['React', 'TypeScript', 'Docker', 'AWS'],
      description: ['Built real-time cloud resource monitoring dashboard tracking 1,000+ Kubernetes cluster nodes.', 'Integrated WebSocket streaming pipeline reducing event propagation delay to under 50ms.'],
      link: 'github.com/alexmorgan/cloud-health',
    },
    {
      name: 'Distributed Transaction Cache',
      technologies: ['Go', 'Redis', 'PostgreSQL'],
      description: ['Engineered high-concurrency memory cache supporting 10,000 operations/sec with automated failover.'],
      link: 'github.com/alexmorgan/dist-cache',
    },
  ],
  education: [{ institution: 'Stanford University', degree: 'BS in Computer Science', duration: '2014 - 2018', score: '3.9 GPA' }],
  certifications: [],
  achievements: [],
  parsing_warnings: [],
};

const scoreExcellent = computeMultiDimensionalScore(extExcellent, DEFAULT_METADATA, EXCELLENT_RESUME_TEXT, 'Fullstack Engineer', TARGET_JD);
console.log('Excellent Resume Scores:', {
  overall: scoreExcellent.overall_score,
  ats: scoreExcellent.ats_compatibility_score,
  contentQuality: scoreExcellent.content_quality_score,
  jdMatch: scoreExcellent.job_match_score,
  experience: scoreExcellent.experience_evidence_score,
  projects: scoreExcellent.projects_quality_score,
  completeness: scoreExcellent.completeness_score,
});

assert(scoreExcellent.overall_score >= 80 && scoreExcellent.overall_score <= 98, `Excellent resume should score 80-98, got ${scoreExcellent.overall_score}`);
assert(scoreExcellent.job_match_score !== null && scoreExcellent.job_match_score >= 80, `Excellent JD match should be >= 80, got ${scoreExcellent.job_match_score}`);
assert(scoreExcellent.experience_evidence_score >= 80, `Experience evidence score should be >= 80, got ${scoreExcellent.experience_evidence_score}`);

// ----------------------------------------------------
// TEST 2: Average Resume Scoring
// ----------------------------------------------------
console.log('\n--- Test 2: Average Resume Scoring ---');
const AVERAGE_MATCHING_JD = `
We are looking for a Junior Web Developer with proficiency in React, JavaScript, HTML, CSS, Git, and Webpack to build user interfaces.
`;

const extAverage = {
  contact_info: { name: 'Jordan Lee', email: 'jordan@email.com', phone: '(555) 987-6543', linkedin: 'linkedin.com/in/jordanlee' },
  skills: {
    technical: ['JavaScript', 'React', 'HTML', 'CSS', 'Git', 'Webpack'],
    programming_languages: ['JavaScript', 'HTML', 'CSS'],
    frameworks: ['React'],
    cloud_and_tools: ['Git'],
  },
  experience: [
    {
      company: 'Tech Solutions',
      role: 'Junior Web Developer',
      duration: '2022 - Present',
      responsibilities: [
        'Worked on client web applications using React and CSS.',
        'Handled bug fixes and developed UI components for landing pages.',
        'Assisted team with code reviews and Git version control.',
      ],
    },
  ],
  projects: [
    {
      name: 'E-Commerce Storefront',
      technologies: ['React', 'CSS'],
      description: ['Built an online store using React and CSS with shopping cart features.'],
    },
  ],
  education: [{ institution: 'State University', degree: 'BS in Information Technology', duration: '2018 - 2022' }],
  parsing_warnings: [],
};

const scoreAverageMatching = computeMultiDimensionalScore(extAverage, DEFAULT_METADATA, AVERAGE_RESUME_TEXT, 'Web Developer', AVERAGE_MATCHING_JD);
console.log('Average Resume (with matching Junior JD):', {
  overall: scoreAverageMatching.overall_score,
  ats: scoreAverageMatching.ats_compatibility_score,
  contentQuality: scoreAverageMatching.content_quality_score,
  jdMatch: scoreAverageMatching.job_match_score,
  experience: scoreAverageMatching.experience_evidence_score,
  projects: scoreAverageMatching.projects_quality_score,
  completeness: scoreAverageMatching.completeness_score,
});

assert(scoreAverageMatching.overall_score >= 55 && scoreAverageMatching.overall_score <= 75, `Average resume with matching JD should score 55-75, got ${scoreAverageMatching.overall_score}`);
assert(scoreAverageMatching.overall_score < scoreExcellent.overall_score - 15, `Average resume score (${scoreAverageMatching.overall_score}) must be distinctly lower than excellent resume (${scoreExcellent.overall_score})`);

// ----------------------------------------------------
// TEST 3: Weak Resume with Placeholders
// ----------------------------------------------------
console.log('\n--- Test 3: Weak Resume with Placeholders ---');
const extWeak = {
  contact_info: { name: 'John Doe', email: null, phone: null },
  skills: { technical: ['React'] },
  experience: [
    {
      company: '<company>',
      role: 'Developer',
      duration: '2023',
      responsibilities: [
        'Worked on tasks assigned by manager.',
        'Handled website updates.',
        'Achieved [number]% improvement in performance.',
        'TODO: add more achievements.',
      ],
    },
  ],
  projects: [
    {
      name: 'Website',
      technologies: ['React'],
      description: ['Built a website using React.'],
    },
  ],
  education: [{ institution: 'College', degree: 'Degree' }],
  parsing_warnings: ['Missing contact details.'],
};

const scoreWeak = computeMultiDimensionalScore(extWeak, DEFAULT_METADATA, WEAK_RESUME_TEXT, 'Fullstack Engineer', TARGET_JD);
console.log('Weak Resume Scores:', {
  overall: scoreWeak.overall_score,
  ats: scoreWeak.ats_compatibility_score,
  contentQuality: scoreWeak.content_quality_score,
  jdMatch: scoreWeak.job_match_score,
  placeholderPenalty: scoreWeak.placeholder_penalty,
});

assert(scoreWeak.overall_score >= 10 && scoreWeak.overall_score <= 50, `Weak resume should score 10-50, got ${scoreWeak.overall_score}`);
assert(scoreWeak.placeholder_penalty >= 10, `Weak resume must have placeholder penalty >= 10, got ${scoreWeak.placeholder_penalty}`);
assert(scoreWeak.overall_score < scoreAverageMatching.overall_score - 15, `Weak resume score (${scoreWeak.overall_score}) must be distinctly lower than average resume (${scoreAverageMatching.overall_score})`);

// ----------------------------------------------------
// TEST 4: Fresher Resume (Not Unfairly Penalized)
// ----------------------------------------------------
console.log('\n--- Test 4: Fresher Resume Adaptive Scoring ---');
const extFresher = {
  contact_info: { name: 'Priya Sharma', email: 'priya.sharma@college.edu', phone: '(555) 345-6789', github: 'github.com/priyasharma', linkedin: 'linkedin.com/in/priyasharma' },
  skills: {
    technical: ['Java', 'Python', 'JavaScript', 'TypeScript', 'SQL', 'React', 'Spring Boot', 'Node.js', 'Express', 'PostgreSQL', 'MySQL', 'MongoDB', 'Docker', 'Git', 'Linux', 'REST API'],
    programming_languages: ['Java', 'Python', 'JavaScript', 'TypeScript', 'SQL'],
    frameworks: ['React', 'Spring Boot', 'Express'],
    databases: ['PostgreSQL', 'MySQL', 'MongoDB'],
    cloud_and_tools: ['Docker', 'Git', 'Linux'],
  },
  experience: [],
  internships: [
    {
      company: 'TechCorp India',
      role: 'Software Engineering Intern',
      duration: 'Jan 2024 - June 2024',
      responsibilities: [
        'Built REST APIs in Spring Boot and PostgreSQL supporting 10,000 daily user transactions.',
        'Designed responsive React frontend modules, reducing page load times by 28%.',
        'Integrated JUnit automated test suites achieving 92% code coverage.',
      ],
    },
  ],
  projects: [
    {
      name: 'Smart Campus Management System',
      technologies: ['React', 'Node.js', 'MongoDB', 'Docker'],
      description: [
        'Architected comprehensive student management portal handling 5,000 concurrent student logins.',
        'Designed JWT role-based authentication and real-time attendance tracking via WebSockets.',
        'Deployed microservices using Docker containers on AWS EC2.',
      ],
      link: 'github.com/priyasharma/campus-mgr',
    },
    {
      name: 'Algorithmic Trading Bot',
      technologies: ['Python', 'Pandas', 'REST API'],
      description: [
        'Developed quantitative trading simulation engine analyzing 50,000 historical stock ticks.',
        'Implemented moving average convergence algorithms achieving 18% annualized simulated returns.',
      ],
      link: 'github.com/priyasharma/algo-trader',
    },
  ],
  education: [{ institution: 'National Institute of Technology', degree: 'B.Tech in Computer Science', duration: '2020 - 2024', score: '8.8 CGPA' }],
  certifications: [{ name: 'AWS Certified Cloud Practitioner' }],
  achievements: [{ title: 'Finalist, Smart India Hackathon' }],
  parsing_warnings: [],
};

const scoreFresher = computeMultiDimensionalScore(extFresher, DEFAULT_METADATA, FRESHER_RESUME_TEXT, 'Software Engineer', TARGET_JD);
console.log('Fresher Resume Scores:', {
  overall: scoreFresher.overall_score,
  ats: scoreFresher.ats_compatibility_score,
  contentQuality: scoreFresher.content_quality_score,
  experience: scoreFresher.experience_evidence_score,
  projects: scoreFresher.projects_quality_score,
  completeness: scoreFresher.completeness_score,
});

assert(scoreFresher.overall_score >= 68 && scoreFresher.overall_score <= 85, `Fresher with strong projects & internships should score 68-85, got ${scoreFresher.overall_score}`);
assert(scoreFresher.experience_evidence_score >= 50, `Fresher experience evidence should adapt and be >= 50, got ${scoreFresher.experience_evidence_score}`);

// ----------------------------------------------------
// TEST 5: Same Resume Against Matching JD vs Mismatched JD
// ----------------------------------------------------
console.log('\n--- Test 5: JD Differentiation on Same Resume ---');
const scoreMatchingJd = computeMultiDimensionalScore(extExcellent, DEFAULT_METADATA, EXCELLENT_RESUME_TEXT, 'Fullstack Engineer', TARGET_JD);
const scoreMismatchedJd = computeMultiDimensionalScore(extExcellent, DEFAULT_METADATA, EXCELLENT_RESUME_TEXT, 'Firmware Engineer', MISMATCHED_JD);

console.log('Matching JD Score:', scoreMatchingJd.job_match_score, 'Overall:', scoreMatchingJd.overall_score);
console.log('Mismatched JD Score:', scoreMismatchedJd.job_match_score, 'Overall:', scoreMismatchedJd.overall_score);

assert((scoreMatchingJd.job_match_score as number) >= 80, `Matching JD match score must be >= 80, got ${scoreMatchingJd.job_match_score}`);
assert((scoreMismatchedJd.job_match_score as number) <= 25, `Mismatched JD match score must be <= 25, got ${scoreMismatchedJd.job_match_score}`);
assert(scoreMatchingJd.overall_score > scoreMismatchedJd.overall_score + 15, `Overall score must differ significantly between matching and mismatched JD`);

// ----------------------------------------------------
// TEST 6: Same Resume With vs Without JD
// ----------------------------------------------------
console.log('\n--- Test 6: No-JD Baseline Handling ---');
const scoreNoJd = computeMultiDimensionalScore(extExcellent, DEFAULT_METADATA, EXCELLENT_RESUME_TEXT, 'Fullstack Engineer', null);
console.log('No-JD Job Match Score (should be null):', scoreNoJd.job_match_score, 'Overall:', scoreNoJd.overall_score);

assert(scoreNoJd.job_match_score === null, 'No-JD job match score must be null');
assert(scoreNoJd.overall_score >= 80, `No-JD overall score for strong resume must be >= 80, got ${scoreNoJd.overall_score}`);

// ----------------------------------------------------
// TEST 7: Determinism Test (100 Iterations)
// ----------------------------------------------------
console.log('\n--- Test 7: Strict Determinism Verification (100 Runs) ---');
const baseline = computeMultiDimensionalScore(extExcellent, DEFAULT_METADATA, EXCELLENT_RESUME_TEXT, 'Fullstack Engineer', TARGET_JD);

for (let i = 0; i < 100; i++) {
  const run = computeMultiDimensionalScore(extExcellent, DEFAULT_METADATA, EXCELLENT_RESUME_TEXT, 'Fullstack Engineer', TARGET_JD);
  if (
    run.overall_score !== baseline.overall_score ||
    run.ats_compatibility_score !== baseline.ats_compatibility_score ||
    run.content_quality_score !== baseline.content_quality_score ||
    run.job_match_score !== baseline.job_match_score ||
    run.experience_evidence_score !== baseline.experience_evidence_score ||
    run.projects_quality_score !== baseline.projects_quality_score ||
    run.completeness_score !== baseline.completeness_score
  ) {
    assert(false, `Non-deterministic output detected on run ${i}`);
  }
}
console.log('✅ PASSED: 100/100 identical runs confirmed (exact determinism).');

// ----------------------------------------------------
// TEST 8: Edge Cases (Empty, Short, Education-Only)
// ----------------------------------------------------
console.log('\n--- Test 8: Edge Cases ---');
const scoreEmpty = computeMultiDimensionalScore({}, DEFAULT_METADATA, '', 'Developer', null);
console.log('Empty Resume Score:', scoreEmpty.overall_score);
assert(scoreEmpty.overall_score <= 20, `Empty resume must score <= 20, got ${scoreEmpty.overall_score}`);

const scoreEduOnly = computeMultiDimensionalScore(
  {
    contact_info: { name: 'Student', email: 'student@edu.com' },
    education: [{ institution: 'Tech College', degree: 'BS' }],
    skills: { technical: [] },
  },
  DEFAULT_METADATA,
  'Student\nstudent@edu.com\nEducation: Tech College BS',
  'Developer',
  null
);
console.log('Education-Only Resume Score:', scoreEduOnly.overall_score);
assert(scoreEduOnly.overall_score >= 18 && scoreEduOnly.overall_score <= 45, `Education-only resume should score 18-45, got ${scoreEduOnly.overall_score}`);

console.log('\n====================================================');
console.log('ALL 8 SCORING ENGINE AUDIT TEST SUITES PASSED!');
console.log('====================================================');

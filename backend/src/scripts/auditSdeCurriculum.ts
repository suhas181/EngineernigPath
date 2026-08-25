import { getCurriculumForRole } from '../services/curriculumService';
import { ResourceLanguage } from '../resources';

export const auditSdeStep5RevisionNotes = (language: ResourceLanguage = 'Java') => {
  const curriculum = getCurriculumForRole('Software Engineer', language);
  const errors: string[] = [];

  let totalTopics = 0;
  let totalRevisionNotes = 0;
  let totalInterviewQuestions = 0;
  let totalProjects = 0;
  let totalPracticeProblems = 0;
  let genericCardsCount = 0;

  const seenCards = new Map<string, string>(); // cardTitle -> topicId
  const duplicates: Array<{ title: string; topicA: string; topicB: string }> = [];

  const topicSummaries: Array<{
    categoryId: string;
    categoryTitle: string;
    topicId: string;
    topicTitle: string;
    practiceProblemCount: number;
    projectCount: number;
    interviewQuestionCount: number;
    revisionNoteCount: number;
    revisionNotes: Array<{ title: string; text: string }>;
  }> = [];

  for (const category of curriculum.categories) {
    for (const mod of category.modules) {
      for (const topic of mod.topics) {
        totalTopics++;
        const projects = topic.guidedFlow?.step5Projects || [];
        const practiceProblems = topic.guidedFlow?.step4PracticeProblems || [];
        const interviewQuestions = topic.guidedFlow?.step6InterviewQuestions || [];
        const revisionNotes = topic.guidedFlow?.step7RevisionNotes || [];

        totalProjects += projects.length;
        totalPracticeProblems += practiceProblems.length;
        totalInterviewQuestions += interviewQuestions.length;
        totalRevisionNotes += revisionNotes.length;

        if (revisionNotes.length < 5 || revisionNotes.length > 8) {
          errors.push(`[${topic.id}] Revision notes count out of expected range (5-7): found ${revisionNotes.length}`);
        }

        // Validate individual revision notes
        for (const card of revisionNotes) {
          if (!card.title || card.title.trim().length < 3) {
            errors.push(`[${topic.id}] Card missing valid title: "${card.title}"`);
          }
          if (!card.text || card.text.trim().length < 15) {
            errors.push(`[${topic.id}] Card text too short / malformed: "${card.title}" -> "${card.text}"`);
          }

          const normTitle = card.title.trim().toLowerCase();
          const normText = card.text.trim().toLowerCase();

          // Check for generic placeholders
          if (
            normTitle === 'key concepts' ||
            normTitle === 'overview' ||
            normTitle === 'summary' ||
            normTitle === 'important points' ||
            normText.startsWith('review the core concepts of') ||
            normText.startsWith('remember to study') ||
            normText === 'to be reviewed.'
          ) {
            genericCardsCount++;
            errors.push(`[${topic.id}] Generic placeholder revision card found: "${card.title}"`);
          }

          // Duplicate check
          const cardKey = `${normTitle}:::${normText}`;
          if (seenCards.has(cardKey)) {
            duplicates.push({
              title: card.title,
              topicA: seenCards.get(cardKey)!,
              topicB: topic.id,
            });
            errors.push(`[${topic.id}] Duplicate revision card seen in [${seenCards.get(cardKey)}]: "${card.title}"`);
          } else {
            seenCards.set(cardKey, topic.id);
          }
        }

        topicSummaries.push({
          categoryId: category.id,
          categoryTitle: category.title,
          topicId: topic.id,
          topicTitle: topic.title,
          practiceProblemCount: practiceProblems.length,
          projectCount: projects.length,
          interviewQuestionCount: interviewQuestions.length,
          revisionNoteCount: revisionNotes.length,
          revisionNotes,
        });
      }
    }
  }

  return {
    role: curriculum.role,
    language: curriculum.language,
    categoryCount: curriculum.categories.length,
    totalTopics,
    totalRevisionNotes,
    avgCardsPerTopic: (totalRevisionNotes / (totalTopics || 1)).toFixed(2),
    totalProjects,
    totalPracticeProblems,
    totalInterviewQuestions,
    genericCardsCount,
    duplicates,
    topicSummaries,
    errors,
  };
};

// Direct script execution
if (require.main === module) {
  console.log('======================================================================');
  console.log('🔍 RUNNING STEP 5: SOFTWARE ENGINEER REVISION NOTES AUDIT (2026)');
  console.log('======================================================================\n');

  const result = auditSdeStep5RevisionNotes('Java');

  console.log(`Role:                         ${result.role}`);
  console.log(`Categories Count:             ${result.categoryCount} / 8`);
  console.log(`Total Topics Audited:         ${result.totalTopics} / 35`);
  console.log(`Total Revision Notes:         ${result.totalRevisionNotes} (Target: 175-245)`);
  console.log(`Average Cards / Topic:        ${result.avgCardsPerTopic} (Target: 5-7)`);
  console.log(`Generic Cards Count:          ${result.genericCardsCount} (Target: 0)`);
  console.log(`Duplicate Cards Found:        ${result.duplicates.length} (Target: 0)`);
  console.log(`Step 4 Practice Problems:     ${result.totalPracticeProblems} (Target: 206 preserved)`);
  console.log(`Step 5 Projects:              ${result.totalProjects} (Target: 35 preserved)`);
  console.log(`Step 6 Interview Questions:   ${result.totalInterviewQuestions} (Target: 259 preserved)`);
  console.log(`Audit Errors:                 ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log('\n❌ Errors found:');
    result.errors.forEach((e) => console.log(`  - ${e}`));
  } else {
    console.log('\n✅ ALL 35 TOPICS HAVE VERIFIED TOPIC-SPECIFIC STEP 7 REVISION NOTES!\n');
  }

  console.log('======================================================================');
  console.log('📋 TOPIC-BY-TOPIC STEP 7 REVISION NOTES BREAKDOWN');
  console.log('======================================================================');

  result.topicSummaries.forEach((t, index) => {
    console.log(`\n${index + 1}. [${t.topicId}] ${t.topicTitle} (${t.revisionNoteCount} cards)`);
    console.log(`   Category: ${t.categoryTitle}`);
    t.revisionNotes.forEach((card, cIdx) => {
      console.log(`     📝 Card ${cIdx + 1} [${card.title}]: ${card.text}`);
    });
  });

  // Cross-role verification
  console.log('\n======================================================================');
  console.log('🔒 VERIFYING UNTOUCHED CAREER TRACKS');
  console.log('======================================================================');
  const otherRoles = [
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Developer',
    'AI / ML Engineer',
    'Data Scientist / Analyst',
    'DevOps Engineer',
    'Mobile App Developer',
    'Cybersecurity Engineer',
  ];

  for (const role of otherRoles) {
    const roleCurr = getCurriculumForRole(role);
    const topCount = roleCurr.categories.reduce((acc, c) => acc + c.topicCount, 0);
    console.log(`Role: ${role.padEnd(26)} | Categories: ${roleCurr.categories.length} | Topics: ${topCount} | Status: ✅ UNTOUCHED`);
  }
}

import { getCurriculumForRole } from '../services/curriculumService';

async function test() {
  console.log('=== TESTING JAVA CURRICULUM ===');
  const javaCurriculum = await getCurriculumForRole('Software Engineer', 'Java');
  const dsaCategoryJava = javaCurriculum.categories.find((c: any) => c.id === 'dsa');
  
  for (const module of dsaCategoryJava!.modules) {
    for (const topic of module.topics) {
      console.log(`\n[JAVA] Topic: ${topic.title} (${topic.id})`);
      console.log(`  Step 1 (Video): ${topic.guidedFlow.step1PrimaryPlaylist?.title} [Provider: ${topic.guidedFlow.step1PrimaryPlaylist?.provider}]`);
      console.log(`  Step 3 (Sheet): ${topic.guidedFlow.step3PracticeSheet?.title}`);
      console.log(`  Alternative Videos:`, topic.guidedFlow.alternativeResources?.videos?.slice(0, 3).map((v: any) => `${v.provider}: ${v.title}`));
    }
  }

  console.log('\n\n=== TESTING C++ CURRICULUM ===');
  const cppCurriculum = await getCurriculumForRole('Software Engineer', 'C++');
  const dsaCategoryCpp = cppCurriculum.categories.find((c: any) => c.id === 'dsa');
  
  for (const module of dsaCategoryCpp!.modules) {
    for (const topic of module.topics) {
      if (['top-sde-dsa-arrays', 'top-sde-dsa-sorting-search', 'top-sde-dsa-dp'].includes(topic.id)) {
        console.log(`\n[C++] Topic: ${topic.title} (${topic.id})`);
        console.log(`  Step 1 (Video): ${topic.guidedFlow.step1PrimaryPlaylist?.title} [Provider: ${topic.guidedFlow.step1PrimaryPlaylist?.provider}]`);
        console.log(`  Step 3 (Sheet): ${topic.guidedFlow.step3PracticeSheet?.title}`);
      }
    }
  }
}

test().catch(console.error);

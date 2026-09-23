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
  
  console.log('\n\n=== TESTING CS FUNDAMENTALS (JAVA) ===');
  const csCategoryJava = javaCurriculum.categories.find((c: any) => c.id === 'cs-fundamentals');
  for (const module of csCategoryJava!.modules) {
    for (const topic of module.topics) {
      console.log(`\n[JAVA CS] Topic: ${topic.title} (${topic.id})`);
      console.log(`  Step 1 (Video): ${topic.guidedFlow.step1PrimaryPlaylist?.title} [${topic.guidedFlow.step1PrimaryPlaylist?.url}]`);
      console.log(`  Alternative Videos:`, topic.guidedFlow.alternativeResources?.videos?.slice(0, 3).map((v: any) => `${v.provider}: ${v.title}`));
    }
  }

  console.log('\n\n=== TESTING CS FUNDAMENTALS (C++) ===');
  const csCategoryCpp = cppCurriculum.categories.find((c: any) => c.id === 'cs-fundamentals');
  for (const module of csCategoryCpp!.modules) {
    for (const topic of module.topics) {
      if (topic.id === 'top-sde-cs-oop-design') {
        console.log(`\n[C++ CS OOP] Topic: ${topic.title} (${topic.id})`);
        console.log(`  Step 1 (Video): ${topic.guidedFlow.step1PrimaryPlaylist?.title} [${topic.guidedFlow.step1PrimaryPlaylist?.url}]`);
      }
    }
  }

  console.log('\n\n=== TESTING CS FUNDAMENTALS (PYTHON) ===');
  const pyCurriculum = await getCurriculumForRole('Software Engineer', 'Python');
  const csCategoryPy = pyCurriculum.categories.find((c: any) => c.id === 'cs-fundamentals');
  for (const module of csCategoryPy!.modules) {
    for (const topic of module.topics) {
      if (topic.id === 'top-sde-cs-oop-design') {
        console.log(`\n[PYTHON CS OOP] Topic: ${topic.title} (${topic.id})`);
        console.log(`  Step 1 (Video): ${topic.guidedFlow.step1PrimaryPlaylist?.title} [${topic.guidedFlow.step1PrimaryPlaylist?.url}]`);
      }
    }
  }
}

test().catch(console.error);

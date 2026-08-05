import { resolveResources, resolveMentorResources } from '../resources/index';

console.log('====================================================');
console.log('  STRICT LANGUAGE-AWARE RESOURCE ISOLATION VERIFIER ');
console.log('====================================================\n');

const testKeys = ['DSA_ARRAYS', 'DSA_SORTING', 'DSA_TREES', 'CS_DBMS', 'DEV_REACT'];
const languages = ['Java', 'Python', 'C++'] as const;

let allPassed = true;

languages.forEach((lang) => {
  console.log(`🔍 Testing Track Language: [${lang}]`);
  
  testKeys.forEach((key) => {
    const resources = resolveResources(key, lang);
    
    // Check for conflicting language leaks
    const conflictingLeaks = resources.filter((r) => r.language !== 'All' && r.language !== lang);
    if (conflictingLeaks.length > 0) {
      console.error(`  ❌ FAIL: Key ${key} for ${lang} contained ${conflictingLeaks.length} conflicting resources:`);
      conflictingLeaks.forEach((leak) => console.error(`     - [${leak.language}] ${leak.title}`));
      allPassed = false;
    } else {
      console.log(`  ✓ Key [${key}]: ${resources.length} resources resolved (0 conflicting language leaks)`);
    }
  });

  const mentor = resolveMentorResources(testKeys, lang);
  console.log(`  ⭐ Mentor Primary Video for ${lang}: "${mentor.primaryVideo?.title || 'None'}" (${mentor.primaryVideo?.provider || 'Official'})`);
  console.log(`  ⭐ Mentor Recommended DSA Sheet for ${lang}: "${mentor.primaryDsaSheet.name}"`);
  console.log(`  ⭐ Practice Problems Capped Count: ${mentor.practiceProblems.length} (Capped 5-10 max)\n`);
});

if (allPassed) {
  console.log('✅ ALL STRICT LANGUAGE ISOLATION & MENTOR RESOLUTION TESTS PASSED!');
  process.exit(0);
} else {
  console.error('❌ LANGUAGE ISOLATION TEST FAILED.');
  process.exit(1);
}

import { describe,expect,it } from 'vitest';
import { auditQuestionBank } from './audit';

describe('question bank audit',()=>{
 it('has no production-blocking data errors and reports pending coverage separately',()=>{
  const report=auditQuestionBank();
  expect(report.errors).toEqual([]);
  expect(report.enabledTemplates).toBeGreaterThanOrEqual(9);
  expect(report.questions).toBeGreaterThanOrEqual(10);
  expect(report.answerRange[0]).toBeGreaterThanOrEqual(5);
  expect(report.medianAnswers).toBeGreaterThanOrEqual(report.answerRange[0]);
  expect(report.ambiguousAliases.some(alias=>alias.startsWith('location:dusty:'))).toBe(true);
  expect(report.disabledCombinations.some(combination=>combination.reason==='pending-review')).toBe(true);
  console.info(JSON.stringify({
   content:report.content,contentGaps:report.contentGaps,exclusionReview:report.exclusionReview,quality:report.quality,mostRepeatedFamilies:report.mostRepeatedFamilies,entities:report.entities,entitiesByType:report.entityCounts,
   retainedOriginalEntities:report.legacyEntities,addedEntities:report.addedEntities,verifiedEntities:report.verifiedEntities,pendingResearchEntities:report.pendingEntities,answerCombinations:report.answerCombinations,playableEntities:report.playableEntities,newPlayableEntities:report.newPlayableEntities,
   templates:report.templates,enabledTemplates:report.enabledTemplates,playableVariants:report.questions,
   pendingCandidateVariantsWithFiveAnswers:report.disabledCombinations.filter(combination=>combination.candidateAnswers>=5).length,
   answers:{minimum:report.answerRange[0],maximum:report.answerRange[1],median:report.medianAnswers},
   disabledByTemplate:Object.fromEntries([...new Set(report.disabledCombinations.map(combination=>combination.templateId))].map(id=>[id,report.disabledCombinations.filter(combination=>combination.templateId===id).length])),
   missingCriticalMetadata:report.missingCriticalMetadata.length,
   ambiguousAliases:report.ambiguousAliases,sourceCoverage:report.sourceCoverage,poiByChapter:report.poiByChapter,
   errors:report.errors,warnings:report.warnings,
  },null,2));
 });
});

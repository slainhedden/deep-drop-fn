import type { AnswerResult, GeneratedQuestion } from '../domain/types';
import { answerCandidates } from './candidates';
import { templates } from '../data/templates';
import { estimatedFrequency, rarityTier, scoreFrequency } from './scoring';
import { resolveAnswer } from './resolve';

export function validateAnswer(question: GeneratedQuestion, submitted: string, timedOut = false): AnswerResult {
  if (timedOut || !submitted.trim()) return { submitted, correct:false, timedOut, points:0, explanation:timedOut ? 'Time expired before an answer was locked in.' : 'No answer was submitted.' };
  const valid = answerCandidates(question);
  const resolution = resolveAnswer(submitted,valid);
  const answer = resolution.entity;
  if (!answer) return { submitted, correct:false, timedOut:false, points:0, explanation:resolution.ambiguous?'That name could match more than one answer. Try the full name.':'No match for this question. Try another name.' };
  const frequency = estimatedFrequency(answer, valid);
  const points = scoreFrequency(frequency);
  const template = templates.find((candidate)=>candidate.id === question.templateId)!;
  return { submitted, canonicalAnswer:answer.name, answerId:answer.id, correct:true, timedOut:false, points, tier:rarityTier(points), explanation:template.explanation(answer, question.parameters), frequencySource:'estimated', estimatedFrequency:frequency, matchedVia:resolution.via, correctedFrom:resolution.correctedFrom };
}

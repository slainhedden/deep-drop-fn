import type { AnswerResult, GeneratedQuestion } from '../domain/types';
import { validateAnswer } from './validation';

export interface RoundSubmission { playerId:string; questionId:string; answer:string; receivedAt:number }

/** Server-compatible round gate. Persistence adapters can wrap this class later. */
export class RoundGate {
  private submissions = new Map<string,AnswerResult>();
  constructor(readonly question:GeneratedQuestion, readonly deadline:number) {}

  submit(input:RoundSubmission):AnswerResult {
    const prior = this.submissions.get(input.playerId);
    if (prior) return prior;
    const result = validateAnswer(this.question,input.answer,input.receivedAt > this.deadline);
    this.submissions.set(input.playerId,result);
    return result;
  }

  hasSubmitted(playerId:string):boolean { return this.submissions.has(playerId); }
}

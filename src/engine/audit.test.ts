import { describe,expect,it } from 'vitest';
import { auditQuestionBank } from './audit';

describe('question bank audit',()=>{
  it('has no production-blocking data errors',()=>{
    const report=auditQuestionBank();
    expect(report.errors).toEqual([]);
    expect(report.templates).toBeGreaterThanOrEqual(6);
    expect(report.questions).toBeGreaterThanOrEqual(10);
  });
});

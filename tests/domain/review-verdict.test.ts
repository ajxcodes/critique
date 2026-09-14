import { describe, test, expect } from 'vitest';
import {
  ReviewVerdict,
  VERDICT_APPROVED,
  VERDICT_CHANGES_REQUESTED,
  TOKEN_REVIEW_STATUS,
  TOKEN_REVIEW_SUMMARY,
  TOKEN_UNFULFILLED_AC,
  TOKEN_REMEDIATION_GUIDANCE,
  ReviewerSubagentError,
  ValidationError,
  AiReviewReport,
  AiReviewFinding,
  ReviewConfidence
} from '../../src/domain';

describe('ReviewVerdict Value Object', () => {
  test('creates valid APPROVED verdict', () => {
    const verdict = ReviewVerdict.create({
      status: VERDICT_APPROVED,
      summary: 'All checks passed cleanly.'
    });

    expect(verdict.status).toBe(VERDICT_APPROVED);
    expect(verdict.summary).toBe('All checks passed cleanly.');
    expect(verdict.isApproved()).toBe(true);
    expect(verdict.isChangesRequested()).toBe(false);
    expect([...verdict.unfulfilledCriteria]).toEqual([]);
    expect([...verdict.remediationGuidance]).toEqual([]);
  });

  test('creates valid CHANGES_REQUESTED verdict with unfulfilled criteria & guidance', () => {
    const verdict = ReviewVerdict.create({
      status: VERDICT_CHANGES_REQUESTED,
      summary: 'Two acceptance criteria were unfulfilled.',
      unfulfilledCriteria: ['- Missing unit test for edge case', '* Error handling not implemented'],
      remediationGuidance: ['1. Add unit test in tests/foo.test.ts', '- Implement try/catch in src/foo.ts']
    });

    expect(verdict.status).toBe(VERDICT_CHANGES_REQUESTED);
    expect(verdict.isApproved()).toBe(false);
    expect(verdict.isChangesRequested()).toBe(true);
    expect([...verdict.unfulfilledCriteria]).toEqual([
      'Missing unit test for edge case',
      'Error handling not implemented'
    ]);
    expect([...verdict.remediationGuidance]).toEqual([
      'Add unit test in tests/foo.test.ts',
      'Implement try/catch in src/foo.ts'
    ]);
  });

  test('filters out "None", "none", and "N/A" values', () => {
    const verdict = ReviewVerdict.create({
      status: VERDICT_APPROVED,
      summary: 'Clean review',
      unfulfilledCriteria: ['None', 'none.', 'N/A', '   '],
      remediationGuidance: ['None', 'no unfulfilled criteria', '']
    });

    expect([...verdict.unfulfilledCriteria]).toEqual([]);
    expect([...verdict.remediationGuidance]).toEqual([]);
  });

  test('validates inputs and throws ValidationError on invalid props', () => {
    expect(() => new ReviewVerdict(null as any)).toThrow(ValidationError);
    expect(() => new ReviewVerdict({ status: 'INVALID' as any, summary: 'foo' })).toThrow(ValidationError);
    expect(() => new ReviewVerdict({ status: VERDICT_APPROVED, summary: '   ' })).toThrow(ValidationError);
  });

  test('formats structured tokens correctly', () => {
    const verdict = ReviewVerdict.create({
      status: VERDICT_CHANGES_REQUESTED,
      summary: 'Regression detected',
      unfulfilledCriteria: ['AC 1: Must handle timeout'],
      remediationGuidance: ['Add AbortController in fetch helper']
    });

    const tokens = verdict.formatStructuredTokens();
    expect(tokens).toContain(`${TOKEN_REVIEW_STATUS}: ${VERDICT_CHANGES_REQUESTED}`);
    expect(tokens).toContain(`${TOKEN_REVIEW_SUMMARY}: Regression detected`);
    expect(tokens).toContain(`${TOKEN_UNFULFILLED_AC}:`);
    expect(tokens).toContain('- AC 1: Must handle timeout');
    expect(tokens).toContain(`${TOKEN_REMEDIATION_GUIDANCE}:`);
    expect(tokens).toContain('- Add AbortController in fetch helper');
  });

  test('formatSelfCorrectionPayload formats actionable remediation block', () => {
    const verdict = ReviewVerdict.create({
      status: VERDICT_CHANGES_REQUESTED,
      summary: 'Missing input validation',
      unfulfilledCriteria: ['AC 2: Reject negative numbers'],
      remediationGuidance: ['Add throw new ValidationError if n < 0']
    });

    const payload = verdict.formatSelfCorrectionPayload();
    expect(payload).toContain('### Critique Reviewer Self-Correction Remediation Guidance:');
    expect(payload).toContain('**Review Summary**: Missing input validation');
    expect(payload).toContain('**Unfulfilled Acceptance Criteria**:');
    expect(payload).toContain('- AC 2: Reject negative numbers');
    expect(payload).toContain('**Required Remediation Actions**:');
    expect(payload).toContain('- Add throw new ValidationError if n < 0');
  });

  test('formatSelfCorrectionPayload returns empty string when approved', () => {
    const verdict = ReviewVerdict.create({
      status: VERDICT_APPROVED,
      summary: 'All standards satisfied'
    });

    expect(verdict.formatSelfCorrectionPayload()).toBe('');
  });

  test('parses structured APPROVED tokens from text', () => {
    const text = `
Here is my review:

REVIEW_STATUS: APPROVED
REVIEW_SUMMARY: Clean diff adhering strictly to clean architecture guidelines.
UNFULFILLED_AC:
- None
REMEDIATION_GUIDANCE:
- None
`;
    const verdict = ReviewVerdict.parse(text);
    expect(verdict.status).toBe(VERDICT_APPROVED);
    expect(verdict.summary).toBe('Clean diff adhering strictly to clean architecture guidelines.');
    expect(verdict.unfulfilledCriteria.length).toBe(0);
    expect(verdict.remediationGuidance.length).toBe(0);
  });

  test('parses structured CHANGES_REQUESTED with multi-line lists from text', () => {
    const text = `
REVIEW_STATUS: CHANGES_REQUESTED
REVIEW_SUMMARY: Identified 2 unfulfilled criteria in domain value objects.
UNFULFILLED_AC:
- AC 1: Missing boundary validation on negative integers
- AC 2: Missing unit test for corrupted JSON string
REMEDIATION_GUIDANCE:
- Step 1: Add check in constructor of FooValueObject
- Step 2: Add test case in tests/domain/foo.test.ts
`;
    const verdict = ReviewVerdict.parse(text);
    expect(verdict.status).toBe(VERDICT_CHANGES_REQUESTED);
    expect(verdict.summary).toBe('Identified 2 unfulfilled criteria in domain value objects.');
    expect([...verdict.unfulfilledCriteria]).toEqual([
      'AC 1: Missing boundary validation on negative integers',
      'AC 2: Missing unit test for corrupted JSON string'
    ]);
    expect([...verdict.remediationGuidance]).toEqual([
      'Step 1: Add check in constructor of FooValueObject',
      'Step 2: Add test case in tests/domain/foo.test.ts'
    ]);
  });

  test('throws ReviewerSubagentError when verdict status cannot be extracted', () => {
    expect(() => ReviewVerdict.parse('')).toThrow(ReviewerSubagentError);
    expect(() => ReviewVerdict.parse('Just some random text with no status token.')).toThrow(ReviewerSubagentError);
  });

  test('bridges from AiReviewReport instance', () => {
    const passingReport = new AiReviewReport({
      summary: 'All automated reviewer checks passed.',
      confidence: ReviewConfidence.high('Comprehensive diff coverage.'),
      findings: [
        new AiReviewFinding({
          path: 'src/foo.ts',
          line: 10,
          severity: 'info',
          body: 'Consider adding a JSDoc comment.'
        })
      ]
    });

    const approvedVerdict = ReviewVerdict.fromAiReviewReport(passingReport);
    expect(approvedVerdict.isApproved()).toBe(true);
    expect(approvedVerdict.status).toBe(VERDICT_APPROVED);
    expect(approvedVerdict.confidenceLevel).toBe('High');

    const failingReport = new AiReviewReport({
      summary: 'Blocking error detected.',
      confidence: ReviewConfidence.medium('Found critical path defect.'),
      findings: [
        new AiReviewFinding({
          path: 'src/bar.ts',
          line: 42,
          severity: 'critical',
          body: 'Potential null pointer dereference.'
        })
      ]
    });

    const rejectedVerdict = ReviewVerdict.fromAiReviewReport(failingReport);
    expect(rejectedVerdict.isChangesRequested()).toBe(true);
    expect(rejectedVerdict.status).toBe(VERDICT_CHANGES_REQUESTED);
    expect(rejectedVerdict.unfulfilledCriteria.length).toBe(1);
    expect(rejectedVerdict.unfulfilledCriteria[0]).toContain('Potential null pointer dereference.');
    expect(rejectedVerdict.remediationGuidance.length).toBe(1);
  });
});

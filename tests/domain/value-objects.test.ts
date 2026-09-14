import { describe, test, expect } from 'vitest';
import {
  ReviewConfidence,
  AiReviewFinding,
  AiReviewReport,
  ValidationError,
  AiReviewerError,
  CONFIDENCE_HIGH,
  CONFIDENCE_MEDIUM,
  CONFIDENCE_LOW,
} from '../../src/domain';

describe('ReviewConfidence Value Object', () => {
  test('creates valid confidence instances and normalizes case', () => {
    const high = ReviewConfidence.create('high', 'Diff is small and clean');
    expect(high.level).toBe(CONFIDENCE_HIGH);
    expect(high.explanation).toBe('Diff is small and clean');
    expect(high.isHigh()).toBe(true);
    expect(high.isMedium()).toBe(false);
    expect(high.isLow()).toBe(false);

    const med = ReviewConfidence.medium('Moderate complexity');
    expect(med.level).toBe(CONFIDENCE_MEDIUM);
    expect(med.isMedium()).toBe(true);

    const low = ReviewConfidence.low('Large diff with unknown areas');
    expect(low.level).toBe(CONFIDENCE_LOW);
    expect(low.isLow()).toBe(true);
  });

  test('validates equality and formatting', () => {
    const c1 = ReviewConfidence.create('High', 'Reason');
    const c2 = ReviewConfidence.create('high', 'Reason');
    const c3 = ReviewConfidence.create('High', 'Other');

    expect(c1.equals(c2)).toBe(true);
    expect(c1.equals(c3)).toBe(false);
    expect(c1.equals(null)).toBe(false);
    expect(c1.toString()).toBe('High - Reason');
  });

  test('rejects invalid confidence levels', () => {
    expect(() => new ReviewConfidence('invalid')).toThrow(ValidationError);
    expect(() => new ReviewConfidence('')).toThrow(ValidationError);
  });

  test('tryFrom handles objects, strings, and invalid inputs', () => {
    const fromStr = ReviewConfidence.tryFrom('high');
    expect(fromStr?.isHigh()).toBe(true);

    const fromObj = ReviewConfidence.tryFrom({
      confidenceLevel: 'Low',
      confidenceExplanation: 'Complex logic'
    });
    expect(fromObj?.isLow()).toBe(true);
    expect(fromObj?.explanation).toBe('Complex logic');

    expect(ReviewConfidence.tryFrom(null)).toBeNull();
    expect(ReviewConfidence.tryFrom('invalid_level')).toBeNull();
  });
});

describe('AiReviewFinding Value Object', () => {
  test('creates finding and identifies severities and blocking status', () => {
    const crit = new AiReviewFinding({
      path: 'src/domain/constants.ts',
      line: 42,
      severity: 'critical',
      body: 'Memory leak detected'
    });
    expect(crit.isBlocking()).toBe(true);
    expect(crit.isCritical()).toBe(true);
    expect(crit.isError()).toBe(true);
    expect(crit.isWarning()).toBe(false);
    expect(crit.getIcon()).toBe('🔴');

    const warn = new AiReviewFinding({
      path: 'src/ports/ai-reviewer.ts',
      line: 10,
      severity: 'warning',
      body: 'Consider making this property optional'
    });
    expect(warn.isBlocking()).toBe(false);
    expect(warn.isWarning()).toBe(true);
    expect(warn.getIcon()).toBe('⚠️');

    const info = new AiReviewFinding({
      path: 'README.md',
      line: 1,
      severity: 'info',
      body: 'Documentation updated'
    });
    expect(info.isInfo()).toBe(true);
    expect(info.isBlocking()).toBe(false);
    expect(info.getIcon()).toBe('ℹ️');
  });

  test('formats markdown representation correctly', () => {
    const finding = new AiReviewFinding({
      path: 'src/app.ts',
      line: 15,
      severity: 'warning',
      body: 'Variable might be undefined'
    });
    const md = finding.formatMarkdown();
    expect(md).toContain('### ⚠️ src/app.ts (Line 15)');
    expect(md).toContain('Variable might be undefined');
  });

  test('rejects invalid finding inputs', () => {
    expect(() => new AiReviewFinding({ path: '', line: 10, severity: 'warning', body: 'Body' })).toThrow(ValidationError);
    expect(() => new AiReviewFinding({ path: 'a.ts', line: -1, severity: 'warning', body: 'Body' })).toThrow(ValidationError);
    expect(() => new AiReviewFinding({ path: 'a.ts', line: 10, severity: 'unknown_sev', body: 'Body' })).toThrow(ValidationError);
    expect(() => new AiReviewFinding({ path: 'a.ts', line: 10, severity: 'warning', body: '' })).toThrow(ValidationError);
  });

  test('tryFrom extracts valid finding or returns null', () => {
    const valid = AiReviewFinding.tryFrom({
      path: 'test.ts',
      line: 5,
      severity: 'error',
      body: 'Type error'
    });
    expect(valid).toBeDefined();
    expect(valid?.path).toBe('test.ts');
    expect(valid?.isError()).toBe(true);

    expect(AiReviewFinding.tryFrom(null)).toBeNull();
    expect(AiReviewFinding.tryFrom({ path: 123 })).toBeNull();
  });
});

describe('AiReviewReport Value Object & Parser', () => {
  test('parses raw JSON response into structured AiReviewReport', () => {
    const rawJson = JSON.stringify({
      summary: 'High-level PR summary.\n\n- Feat A\n- Feat B',
      confidenceLevel: 'High',
      confidenceExplanation: 'Clear isolated diff',
      resolvedThreads: ['thread-1', 'thread-2'],
      comments: [
        {
          path: 'src/ports/ai-reviewer.ts',
          line: 12,
          severity: 'warning',
          body: 'Consider adding JSDoc comments.'
        }
      ]
    });

    const report = AiReviewReport.parse(rawJson, 'gemini-3.5-flash');
    expect(report.summary).toContain('High-level PR summary.');
    expect(report.confidence.isHigh()).toBe(true);
    expect(report.findings.length).toBe(1);
    expect(report.findings[0].path).toBe('src/ports/ai-reviewer.ts');
    expect(report.findings[0].isWarning()).toBe(true);
    expect(report.warningCount()).toBe(1);
    expect(report.errorCount()).toBe(0);
    expect(report.hasBlockingIssues()).toBe(false);
    expect(report.isPassing()).toBe(true);
    expect(report.resolvedThreads).toEqual(['thread-1', 'thread-2']);
    expect(report.modelUsed).toBe('gemini-3.5-flash');
  });

  test('parses JSON embedded inside markdown codeblock', () => {
    const markdownResponse = `Here is my review:
\`\`\`json
{
  "summary": "Clean pull request.",
  "confidenceLevel": "High",
  "confidenceExplanation": "Simple changes",
  "comments": []
}
\`\`\`
Hope this helps!`;

    const report = AiReviewReport.parse(markdownResponse);
    expect(report.confidence.isHigh()).toBe(true);
    expect(report.findings.length).toBe(0);
    expect(report.isPassing()).toBe(true);
  });

  test('detects blocking issues and prevents passing verdict', () => {
    const report = new AiReviewReport({
      summary: 'Changes with issues',
      confidence: ReviewConfidence.high('Good diff coverage'),
      findings: [
        new AiReviewFinding({
          path: 'src/main.ts',
          line: 25,
          severity: 'critical',
          body: 'Security SQL injection hazard'
        })
      ]
    });

    expect(report.hasBlockingIssues()).toBe(true);
    expect(report.errorCount()).toBe(1);
    expect(report.isPassing()).toBe(false);
  });

  test('handles empty diff and bypassed report factories', () => {
    const emptyReport = AiReviewReport.empty();
    expect(emptyReport.findings.length).toBe(0);
    expect(emptyReport.confidence.isHigh()).toBe(true);
    expect(emptyReport.bypassed).toBe(false);

    const bypassed = AiReviewReport.bypassed('GEMINI_API_KEY missing');
    expect(bypassed.bypassed).toBe(true);
    expect(bypassed.isPassing()).toBe(false);
    expect(bypassed.diagnosticMessage).toBe('GEMINI_API_KEY missing');
  });

  test('throws AiReviewerError on unparseable JSON', () => {
    expect(() => AiReviewReport.parse('This is not json { [')).toThrow(AiReviewerError);
    expect(() => AiReviewReport.parse('')).toThrow(AiReviewerError);
  });
});

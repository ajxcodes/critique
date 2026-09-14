import { describe, test, expect } from 'vitest';
import {
  runCritiqueEngine,
  buildCritiquePrompt
} from '../../src/application/run-critique';
import { CommandExecutorPort } from '../../src/ports/command-executor';
import { MSG_CLEAN_DIFF_REVIEW } from '../../src/domain/constants';

class MockExecutor implements CommandExecutorPort {
  public diffOutput: string = '';

  public async execute(_command: string): Promise<any> {
    return {
      exitCode: 0,
      stdout: this.diffOutput,
      stderr: ''
    };
  }
}

describe('buildCritiquePrompt Helper', () => {
  test('assembles prompt with diff, standards, and previous threads', () => {
    const prompt = buildCritiquePrompt(
      'diff --git a/a.ts b/a.ts\n+const x = 1;',
      '# Standard 1: No any types allowed.',
      JSON.stringify([{ threadId: 't1', body: 'Fix any type' }])
    );

    expect(prompt).toContain('Repository Standards & Guidelines to Enforce:');
    expect(prompt).toContain('No any types allowed.');
    expect(prompt).toContain('Unresolved previous AI review threads on this PR:');
    expect(prompt).toContain('Fix any type');
    expect(prompt).toContain('diff --git a/a.ts b/a.ts');
  });
});

describe('runCritiqueEngine Application Service', () => {
  test('returns bypassed report when bypass flag is true', async () => {
    const report = await runCritiqueEngine({ bypass: true });
    expect(report.bypassed).toBe(true);
    expect(report.summary).toContain('Bypassed by option');
  });

  test('returns empty report when diff is clean', async () => {
    const executor = new MockExecutor();
    executor.diffOutput = '';

    const report = await runCritiqueEngine(
      { env: { GEMINI_API_KEY: 'test-fake-key' } },
      { commandExecutor: executor }
    );

    expect(report.summary).toBe(MSG_CLEAN_DIFF_REVIEW);
    expect(report.findings.length).toBe(0);
    expect(report.isPassing()).toBe(true);
  });

  test('queries Gemini and returns parsed report', async () => {
    const executor = new MockExecutor();
    executor.diffOutput = 'diff --git a/index.ts b/index.ts\n+const hello = "world";';

    const mockResponsePayload = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  summary: 'Added greeting constant.',
                  confidenceLevel: 'High',
                  confidenceExplanation: 'Straightforward variable declaration.',
                  comments: [
                    {
                      path: 'index.ts',
                      line: 1,
                      severity: 'info',
                      body: 'Consider exporting greeting function instead.'
                    }
                  ]
                })
              }
            ]
          }
        }
      ]
    };

    const mockFetch = async () =>
      new Response(JSON.stringify(mockResponsePayload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    const report = await runCritiqueEngine(
      { staged: true, env: { GEMINI_API_KEY: 'test-fake-key' } },
      { commandExecutor: executor, fetchFn: mockFetch as any }
    );

    expect(report.summary).toBe('Added greeting constant.');
    expect(report.confidence.isHigh()).toBe(true);
    expect(report.findings.length).toBe(1);
    expect(report.findings[0].severity).toBe('info');
    expect(report.isPassing()).toBe(true);
  });
});

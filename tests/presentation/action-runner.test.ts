import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import * as core from '@actions/core';
import { runGitHubAction } from '../../src/presentation/action-runner';
import { GeminiClient } from '../../src/infrastructure/gemini-client';
import { DiffProvider } from '../../src/infrastructure/diff-provider';
import { StandardsResolver } from '../../src/infrastructure/standards-resolver';
import { GitHubActionsAdapter } from '../../src/infrastructure/github-actions-adapter';

vi.mock('@actions/core');
vi.mock('@actions/github', () => ({
  context: {
    payload: {
      pull_request: {
        number: 42,
        base: { ref: 'main' }
      }
    },
    repo: {
      owner: 'ajxcodes',
      repo: 'critique'
    }
  }
}));
vi.mock('../../src/infrastructure/gemini-client');
vi.mock('../../src/infrastructure/diff-provider');
vi.mock('../../src/infrastructure/standards-resolver');
vi.mock('../../src/infrastructure/github-actions-adapter');

describe('runGitHubAction', () => {
  const inputs: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(inputs)) {
      delete inputs[key];
    }

    vi.mocked(core.getInput).mockImplementation((name: string) => inputs[name] || '');

    // Default mock diff provider
    vi.mocked(DiffProvider.prototype.getDiff).mockResolvedValue(
      'diff --git a/test.ts b/test.ts\n+const x = 1;'
    );

    // Default mock standards resolver
    vi.mocked(StandardsResolver.prototype.resolve).mockReturnValue({
      content: '',
      path: null
    });

    // Default mock gh adapter
    vi.mocked(GitHubActionsAdapter.prototype.getUnresolvedThreads).mockResolvedValue([]);
    vi.mocked(GitHubActionsAdapter.prototype.getPullRequest).mockResolvedValue({
      title: 'Test PR',
      body: 'PR Body',
      headSha: 'abc1234',
      baseRef: 'main'
    });
    vi.mocked(GitHubActionsAdapter.prototype.createReviewComment).mockResolvedValue({ id: 1 } as any);
    vi.mocked(GitHubActionsAdapter.prototype.createIssueComment).mockResolvedValue({ id: 2 } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setupGeminiResponse = (comments: Array<{ path: string; line: number; severity: string; body: string }>) => {
    vi.mocked(GeminiClient.prototype.query).mockResolvedValue({
      text: JSON.stringify({
        summary: 'Review summary',
        confidenceLevel: 'High',
        confidenceExplanation: 'High confidence',
        resolvedThreads: [],
        comments
      }),
      modelUsed: 'gemini-2.5-pro'
    });
  };

  test('fail_on_severity: "error" fails step when error findings exist', async () => {
    inputs['gemini_api_key'] = 'fake-key';
    inputs['fail_on_severity'] = 'error';

    setupGeminiResponse([
      { path: 'src/index.ts', line: 10, severity: 'error', body: 'Syntax error' }
    ]);

    await runGitHubAction();

    expect(core.setFailed).toHaveBeenCalledWith(
      "Critique review failed with 1 finding(s) meeting severity threshold 'error'."
    );
  });

  test('fail_on_severity: "error" fails step when critical findings exist', async () => {
    inputs['gemini_api_key'] = 'fake-key';
    inputs['fail_on_severity'] = 'error';

    setupGeminiResponse([
      { path: 'src/index.ts', line: 10, severity: 'critical', body: 'Critical vulnerability' }
    ]);

    await runGitHubAction();

    expect(core.setFailed).toHaveBeenCalledWith(
      "Critique review failed with 1 finding(s) meeting severity threshold 'error'."
    );
  });

  test('fail_on_severity: "critical" does NOT fail when only warning or error findings exist', async () => {
    inputs['gemini_api_key'] = 'fake-key';
    inputs['fail_on_severity'] = 'critical';

    setupGeminiResponse([
      { path: 'src/index.ts', line: 10, severity: 'warning', body: 'Unused var' },
      { path: 'src/service.ts', line: 15, severity: 'error', body: 'Unhandled exception' }
    ]);

    await runGitHubAction();

    expect(core.setFailed).not.toHaveBeenCalled();
  });

  test('fail_on_severity: "critical" fails step when critical findings exist', async () => {
    inputs['gemini_api_key'] = 'fake-key';
    inputs['fail_on_severity'] = 'critical';

    setupGeminiResponse([
      { path: 'src/index.ts', line: 10, severity: 'warning', body: 'Unused var' },
      { path: 'src/auth.ts', line: 20, severity: 'critical', body: 'Auth bypass' }
    ]);

    await runGitHubAction();

    expect(core.setFailed).toHaveBeenCalledWith(
      "Critique review failed with 1 finding(s) meeting severity threshold 'critical'."
    );
  });

  test('fail_on_severity: "warning" fails step when warning findings exist', async () => {
    inputs['gemini_api_key'] = 'fake-key';
    inputs['fail_on_severity'] = 'warning';

    setupGeminiResponse([
      { path: 'src/index.ts', line: 10, severity: 'warning', body: 'Consider renaming' }
    ]);

    await runGitHubAction();

    expect(core.setFailed).toHaveBeenCalledWith(
      "Critique review failed with 1 finding(s) meeting severity threshold 'warning'."
    );
  });

  test('fail_on_severity: "warning" includes breakdown when both errors and warnings exist', async () => {
    inputs['gemini_api_key'] = 'fake-key';
    inputs['fail_on_severity'] = 'warning';

    setupGeminiResponse([
      { path: 'src/index.ts', line: 10, severity: 'warning', body: 'Consider renaming' },
      { path: 'src/service.ts', line: 20, severity: 'error', body: 'Missing check' }
    ]);

    await runGitHubAction();

    expect(core.setFailed).toHaveBeenCalledWith(
      "Critique review failed with 2 finding(s) meeting severity threshold 'warning' (1 error(s), 1 warning(s))."
    );
  });

  test('fail_on_severity: "none" passes even with critical/error findings', async () => {
    inputs['gemini_api_key'] = 'fake-key';
    inputs['fail_on_severity'] = 'none';

    setupGeminiResponse([
      { path: 'src/index.ts', line: 10, severity: 'critical', body: 'Critical vulnerability' },
      { path: 'src/index.ts', line: 12, severity: 'error', body: 'Error found' }
    ]);

    await runGitHubAction();

    expect(core.setFailed).not.toHaveBeenCalled();
  });

  test('strict: "true" fails when blocking issues exist regardless of default fail_on_severity message', async () => {
    inputs['gemini_api_key'] = 'fake-key';
    inputs['strict'] = 'true';
    inputs['fail_on_severity'] = 'none'; // strict takes precedence

    setupGeminiResponse([
      { path: 'src/index.ts', line: 10, severity: 'error', body: 'Blocking error' }
    ]);

    await runGitHubAction();

    expect(core.setFailed).toHaveBeenCalledWith(
      'Critique review failed with 1 blocking error(s).'
    );
  });

  test('defaults to fail_on_severity: "error" when input is omitted', async () => {
    inputs['gemini_api_key'] = 'fake-key';

    setupGeminiResponse([
      { path: 'src/index.ts', line: 10, severity: 'error', body: 'Standard error' }
    ]);

    await runGitHubAction();

    expect(core.setFailed).toHaveBeenCalledWith(
      "Critique review failed with 1 finding(s) meeting severity threshold 'error'."
    );
  });
});

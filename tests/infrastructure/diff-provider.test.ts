import { describe, test, expect } from 'vitest';
import { DiffProvider } from '../../src/infrastructure/diff-provider';
import { CommandExecutorPort, CommandExecutionResult } from '../../src/ports/command-executor';

class MockExecutor implements CommandExecutorPort {
  public executedCommands: string[] = [];
  public responseStdout: string = '';
  public exitCode: number = 0;

  public async execute(command: string): Promise<CommandExecutionResult> {
    this.executedCommands.push(command);
    return {
      exitCode: this.exitCode,
      stdout: this.responseStdout,
      stderr: ''
    };
  }
}

describe('DiffProvider', () => {
  test('uses git diff --cached when staged option is true', async () => {
    const executor = new MockExecutor();
    executor.responseStdout = 'diff --git a/foo.ts b/foo.ts\n+const x = 1;';
    const provider = new DiffProvider(executor);

    const diff = await provider.getDiff({ staged: true });
    expect(diff).toContain('const x = 1;');
    expect(executor.executedCommands[0]).toContain('git diff --cached');
  });

  test('uses git diff <baseRef>...HEAD when baseRef is specified', async () => {
    const executor = new MockExecutor();
    executor.responseStdout = 'diff --git a/bar.ts b/bar.ts\n+const y = 2;';
    const provider = new DiffProvider(executor);

    const diff = await provider.getDiff({ baseRef: 'origin/main' });
    expect(diff).toContain('const y = 2;');
    expect(executor.executedCommands[0]).toContain('git diff origin/main...HEAD');
  });

  test('uses gh pr diff <number> when prNumber is specified', async () => {
    const executor = new MockExecutor();
    executor.responseStdout = 'diff --git a/pr.ts b/pr.ts\n+const z = 3;';
    const provider = new DiffProvider(executor);

    const diff = await provider.getDiff({ prNumber: 42 });
    expect(diff).toContain('const z = 3;');
    expect(executor.executedCommands[0]).toBe('gh pr diff 42');
  });

  test('truncates diff when exceeding maxChars', async () => {
    const executor = new MockExecutor();
    executor.responseStdout = 'a'.repeat(200);
    const provider = new DiffProvider(executor);

    const diff = await provider.getDiff({ staged: true, maxChars: 50 });
    expect(diff.length).toBeLessThan(200);
    expect(diff).toContain('[Diff truncated due to size limit of 50 chars]');
  });
});

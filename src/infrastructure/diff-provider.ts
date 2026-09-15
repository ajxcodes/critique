/**
 * critique - DiffProvider (Infrastructure Layer)
 *
 * Extracts git diffs across working trees, staged indices, base refs, and PRs via gh CLI.
 * Filters out large binaries/lockfiles and enforces size thresholds.
 */

import { CommandExecutorPort } from '../ports/command-executor';
import { ProcessCommandExecutor } from './process-command-executor';
import { AI_REVIEWER_MAX_DIFF_CHARS } from '../domain/constants';

export interface DiffProviderOptions {
  readonly cwd?: string;
  readonly staged?: boolean;
  readonly baseRef?: string;
  readonly prNumber?: number;
  readonly maxChars?: number;
  readonly commitRange?: string;
}

const EXCLUDE_FLAGS = "':(exclude)*.lock' ':(exclude)*-lock.json' ':(exclude)*.lockb' ':(exclude)*.png' ':(exclude)*.jpg' ':(exclude)*.svg' ':(exclude)*.jar' ':(exclude)*.bin' ':(exclude)*.map'";

export class DiffProvider {
  private readonly executor: CommandExecutorPort;

  constructor(executor: CommandExecutorPort = new ProcessCommandExecutor()) {
    this.executor = executor;
  }

  public async getDiff(options: DiffProviderOptions = {}): Promise<string> {
    const cwd = options.cwd || process.cwd();
    const maxChars = options.maxChars || AI_REVIEWER_MAX_DIFF_CHARS;

    // 1. If PR number provided, use GitHub CLI `gh pr diff <number>`
    if (options.prNumber) {
      const prRes = await this.executor.execute(`gh pr diff ${options.prNumber}`, { cwd });
      if (prRes.exitCode === 0 && prRes.stdout.trim()) {
        return this.truncate(prRes.stdout, maxChars);
      }
    }

    // 2. If staged flag passed
    if (options.staged) {
      const res = await this.executor.execute(`git diff --cached -- . ${EXCLUDE_FLAGS}`, { cwd });
      return this.truncate(res.stdout, maxChars);
    }

    // 3. If explicit commit range passed
    if (options.commitRange) {
      const res = await this.executor.execute(`git diff ${options.commitRange} -- . ${EXCLUDE_FLAGS}`, { cwd });
      return this.truncate(res.stdout, maxChars);
    }

    // 4. If baseRef passed
    if (options.baseRef) {
      const res = await this.executor.execute(`git diff ${options.baseRef}...HEAD -- . ${EXCLUDE_FLAGS}`, { cwd });
      return this.truncate(res.stdout, maxChars);
    }

    // 5. Default: check working tree diff (unstaged + staged)
    const headRes = await this.executor.execute(`git diff HEAD -- . ${EXCLUDE_FLAGS}`, { cwd });
    if (headRes.stdout.trim()) {
      return this.truncate(headRes.stdout, maxChars);
    }

    // 6. Fallback to origin/main...HEAD
    const originMainRes = await this.executor.execute(`git diff origin/main...HEAD -- . ${EXCLUDE_FLAGS}`, { cwd });
    if (originMainRes.exitCode === 0 && originMainRes.stdout.trim()) {
      return this.truncate(originMainRes.stdout, maxChars);
    }

    // 7. Fallback to origin/master...HEAD
    const originMasterRes = await this.executor.execute(`git diff origin/master...HEAD -- . ${EXCLUDE_FLAGS}`, { cwd });
    if (originMasterRes.exitCode === 0 && originMasterRes.stdout.trim()) {
      return this.truncate(originMasterRes.stdout, maxChars);
    }

    return '';
  }

  private truncate(diffText: string, maxChars: number): string {
    const trimmed = diffText.trim();
    if (trimmed.length > maxChars) {
      return `${trimmed.substring(0, maxChars)}\n\n[Diff truncated due to size limit of ${maxChars} chars]`;
    }
    return trimmed;
  }
}

"use strict";
/**
 * critique - DiffProvider (Infrastructure Layer)
 *
 * Extracts git diffs across working trees, staged indices, base refs, and PRs via gh CLI.
 * Filters out large binaries/lockfiles and enforces size thresholds.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffProvider = void 0;
const process_command_executor_1 = require("./process-command-executor");
const constants_1 = require("../domain/constants");
const EXCLUDE_FLAGS = "':(exclude)*.lock' ':(exclude)*-lock.json' ':(exclude)*.lockb' ':(exclude)*.png' ':(exclude)*.jpg' ':(exclude)*.svg' ':(exclude)*.jar' ':(exclude)*.bin'";
class DiffProvider {
    executor;
    constructor(executor = new process_command_executor_1.ProcessCommandExecutor()) {
        this.executor = executor;
    }
    async getDiff(options = {}) {
        const cwd = options.cwd || process.cwd();
        const maxChars = options.maxChars || constants_1.AI_REVIEWER_MAX_DIFF_CHARS;
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
    truncate(diffText, maxChars) {
        const trimmed = diffText.trim();
        if (trimmed.length > maxChars) {
            return `${trimmed.substring(0, maxChars)}\n\n[Diff truncated due to size limit of ${maxChars} chars]`;
        }
        return trimmed;
    }
}
exports.DiffProvider = DiffProvider;
//# sourceMappingURL=diff-provider.js.map
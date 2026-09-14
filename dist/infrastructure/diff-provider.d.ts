/**
 * critique - DiffProvider (Infrastructure Layer)
 *
 * Extracts git diffs across working trees, staged indices, base refs, and PRs via gh CLI.
 * Filters out large binaries/lockfiles and enforces size thresholds.
 */
import { CommandExecutorPort } from '../ports/command-executor';
export interface DiffProviderOptions {
    readonly cwd?: string;
    readonly staged?: boolean;
    readonly baseRef?: string;
    readonly prNumber?: number;
    readonly maxChars?: number;
    readonly commitRange?: string;
}
export declare class DiffProvider {
    private readonly executor;
    constructor(executor?: CommandExecutorPort);
    getDiff(options?: DiffProviderOptions): Promise<string>;
    private truncate;
}

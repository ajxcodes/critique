/**
 * critique - StandardsResolver (Infrastructure Layer)
 *
 * Implements the 6-tier discovery cascade for project review standards:
 * 1. .github/critique.md
 * 2. .critique.md
 * 3. .github/ai-reviewer-standards.md (legacy fallback)
 * 4. AGENTS.md
 * 5. STANDARDS.md
 * 6. CONTRIBUTING.md
 */
export interface StandardsDiscoveryResult {
    readonly path: string | null;
    readonly content: string | null;
}
export declare class StandardsResolver {
    resolve(cwd?: string, customPath?: string | null): StandardsDiscoveryResult;
}

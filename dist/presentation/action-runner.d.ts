/**
 * critique - ActionRunner Presentation Layer
 *
 * Coordinates execution when running as a native GitHub Action.
 * Extracts PR context, queries unresolved bot threads, runs review engine,
 * resolves fixed threads, posts inline comments, and updates PR summary.
 */
export declare function runGitHubAction(): Promise<void>;

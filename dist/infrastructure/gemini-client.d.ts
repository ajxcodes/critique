/**
 * critique - GeminiClient (Infrastructure Layer)
 *
 * Handles Gemini REST API queries with automatic model fallback cascade:
 * gemini-3.5-flash-lite -> gemini-3.5-flash -> gemini-2.5-flash -> gemini-2.5-pro
 * Supports retry on 503, environment .env resolution, and secondary GitHub Copilot fallback.
 */
export interface GeminiClientDependencies {
    readonly fetchFn?: typeof fetch;
    readonly sleepFn?: (ms: number) => Promise<void>;
    readonly timeoutMs?: number;
}
export declare function loadEnvironmentFile(filePath: string): Record<string, string>;
export declare function resolveGeminiApiKey(cwd?: string, explicitEnv?: Readonly<Record<string, string | undefined>>): string | null;
export declare function resolveGitHubToken(cwd?: string, explicitEnv?: Readonly<Record<string, string | undefined>>): string | null;
export interface GeminiQueryResult {
    readonly text: string;
    readonly modelUsed: string;
}
export declare class GeminiClient {
    private readonly fetchClient;
    private readonly sleep;
    constructor(dependencies?: GeminiClientDependencies);
    query(prompt: string, apiKey: string, options?: {
        timeoutMs?: number;
        githubTokenFallback?: string | null;
    }): Promise<GeminiQueryResult>;
    private queryCopilotFallback;
}

/**
 * critique - RunCritique Application Service
 *
 * Coordinates standards discovery, diff generation, prompt assembly,
 * Gemini API querying with model fallback cascade, and report parsing.
 */
import { AiReviewReport } from '../domain/value-objects/ai-review-report';
import { AiReviewOptions } from '../ports/ai-reviewer';
import { CommandExecutorPort } from '../ports/command-executor';
import { StandardsResolver } from '../infrastructure/standards-resolver';
import { DiffProvider } from '../infrastructure/diff-provider';
import { GeminiClient } from '../infrastructure/gemini-client';
export interface CritiqueEngineDependencies {
    readonly commandExecutor?: CommandExecutorPort;
    readonly standardsResolver?: StandardsResolver;
    readonly diffProvider?: DiffProvider;
    readonly geminiClient?: GeminiClient;
    readonly fetchFn?: typeof fetch;
    readonly sleepFn?: (ms: number) => Promise<void>;
}
export declare function buildCritiquePrompt(diffText: string, standardsContent?: string | null, previousThreadsText?: string | null): string;
export declare function runCritiqueEngine(options?: AiReviewOptions, dependencies?: CritiqueEngineDependencies): Promise<AiReviewReport>;

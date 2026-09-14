/**
 * critique - Strongly-typed Domain Error Hierarchy
 */
export declare abstract class CritiqueError extends Error {
    abstract readonly code: string;
    readonly details?: Record<string, unknown>;
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class ValidationError extends CritiqueError {
    readonly code = "ERR_VALIDATION";
    readonly field: string;
    readonly value: unknown;
    constructor(field: string, value: unknown, reason: string);
}
export declare class AiReviewerError extends CritiqueError {
    readonly code = "ERR_AI_REVIEWER";
    readonly operation: string;
    readonly reason: string;
    constructor(operation: string, reason: string, details?: Record<string, unknown>, cause?: unknown);
}
export declare class ReviewerSubagentError extends CritiqueError {
    readonly code = "ERR_REVIEWER_PARSER";
    readonly operation: string;
    readonly reason: string;
    constructor(operation: string, reason: string, details?: Record<string, unknown>, cause?: unknown);
}
export declare class GitHubApiError extends CritiqueError {
    readonly code = "ERR_GITHUB_API";
    readonly operation: string;
    constructor(operation: string, details?: Record<string, unknown>, cause?: unknown);
}
export declare class CommandExecutionError extends CritiqueError {
    readonly code = "ERR_COMMAND_EXECUTION";
    readonly command: string;
    readonly exitCode: number;
    readonly stderr: string;
    constructor(command: string, exitCode: number, stderr?: string);
}

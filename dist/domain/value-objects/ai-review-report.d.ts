/**
 * critique - AiReviewReport Value Object
 *
 * Immutable representation of a complete AI PR Review report.
 * Provides structured diagnostic parsing, severity queries, and markdown formatting.
 * Pure domain value object: 100% free of external I/O or child processes.
 */
import { ReviewConfidence } from './review-confidence';
import { AiReviewFinding } from './ai-review-finding';
export interface AiReviewReportProps {
    readonly summary: string;
    readonly confidence: ReviewConfidence;
    readonly findings: readonly AiReviewFinding[];
    readonly resolvedThreads?: readonly string[];
    readonly bypassed?: boolean;
    readonly diagnosticMessage?: string;
    readonly rawOutput?: string;
    readonly modelUsed?: string;
}
export declare class AiReviewReport {
    readonly summary: string;
    readonly confidence: ReviewConfidence;
    readonly findings: readonly AiReviewFinding[];
    readonly resolvedThreads: readonly string[];
    readonly bypassed: boolean;
    readonly diagnosticMessage?: string;
    readonly rawOutput?: string;
    readonly modelUsed?: string;
    constructor(props: AiReviewReportProps);
    isPassing(): boolean;
    hasBlockingIssues(): boolean;
    hasFindings(): boolean;
    errorCount(): number;
    warningCount(): number;
    suggestionCount(): number;
    infoCount(): number;
    formatMarkdownReport(): string;
    toJSON(): Record<string, unknown>;
    static create(props: AiReviewReportProps): AiReviewReport;
    static empty(customMessage?: string): AiReviewReport;
    static bypassed(reason: string): AiReviewReport;
    static parse(rawText: string, modelUsed?: string): AiReviewReport;
}

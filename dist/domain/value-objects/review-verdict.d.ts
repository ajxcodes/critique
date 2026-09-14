/**
 * critique - ReviewVerdict Value Object
 *
 * Immutable, self-validating value object representing the outcome of the AI Review stage.
 * Emits and parses machine-readable REVIEW_* tokens, Markdown self-correction context,
 * and bridges AI PR review reports to orchestrator lifecycles.
 *
 * Pure domain value object: 100% free of filesystem, child processes, or network I/O.
 */
import { ReviewVerdictState } from '../constants';
import { AiReviewReport } from './ai-review-report';
import { AiReviewFinding } from './ai-review-finding';
export interface ReviewVerdictProps {
    readonly status: ReviewVerdictState;
    readonly summary: string;
    readonly unfulfilledCriteria?: readonly string[];
    readonly remediationGuidance?: readonly string[];
    readonly confidenceLevel?: string | null;
    readonly findings?: readonly AiReviewFinding[];
}
export interface ReviewVerdictSerialized {
    readonly status: ReviewVerdictState;
    readonly summary: string;
    readonly unfulfilledCriteria: readonly string[];
    readonly remediationGuidance: readonly string[];
    readonly confidenceLevel: string | null;
    readonly findingsCount: number;
}
export declare class ReviewVerdict {
    readonly status: ReviewVerdictState;
    readonly summary: string;
    readonly unfulfilledCriteria: readonly string[];
    readonly remediationGuidance: readonly string[];
    readonly confidenceLevel: string | null;
    readonly findings: readonly AiReviewFinding[];
    constructor(props: ReviewVerdictProps);
    isApproved(): boolean;
    isChangesRequested(): boolean;
    formatStructuredTokens(): string;
    formatReportText(): string;
    formatSelfCorrectionPayload(): string;
    toJSON(): ReviewVerdictSerialized;
    static create(props: ReviewVerdictProps): ReviewVerdict;
    static parse(text: string | null | undefined): ReviewVerdict;
    static fromAiReviewReport(report: AiReviewReport): ReviewVerdict;
}

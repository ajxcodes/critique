/**
 * critique - AiReviewFinding Value Object
 *
 * Immutable representation of an individual AI Code Review finding/comment.
 * Categorizes comments by severity (critical, error, warning, suggestion, info).
 */
import { ReviewSeverity } from '../constants';
export interface AiReviewFindingProps {
    readonly path: string;
    readonly line: number;
    readonly severity: ReviewSeverity | string;
    readonly body: string;
}
export declare class AiReviewFinding {
    readonly path: string;
    readonly line: number;
    readonly severity: ReviewSeverity;
    readonly body: string;
    constructor(props: AiReviewFindingProps);
    isBlocking(): boolean;
    isCritical(): boolean;
    isError(): boolean;
    isWarning(): boolean;
    isSuggestion(): boolean;
    isInfo(): boolean;
    getIcon(): string;
    getHeader(): string;
    formatMarkdown(): string;
    equals(other: AiReviewFinding | null | undefined): boolean;
    toJSON(): Record<string, unknown>;
    static create(props: AiReviewFindingProps): AiReviewFinding;
    static tryFrom(raw: unknown): AiReviewFinding | null;
}

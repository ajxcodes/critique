/**
 * critique - ReviewConfidence Value Object
 *
 * Immutable representation of an AI Review confidence rating and explanation.
 * Strictly avoids magic strings by using domain constants.
 */
import { ReviewConfidenceLevel } from '../constants';
export declare class ReviewConfidence {
    readonly level: ReviewConfidenceLevel;
    readonly explanation: string;
    constructor(level: string, explanation?: string);
    isHigh(): boolean;
    isMedium(): boolean;
    isLow(): boolean;
    equals(other: ReviewConfidence | null | undefined): boolean;
    toString(): string;
    static create(level: string, explanation?: string): ReviewConfidence;
    static high(explanation?: string): ReviewConfidence;
    static medium(explanation?: string): ReviewConfidence;
    static low(explanation?: string): ReviewConfidence;
    static tryFrom(raw: unknown): ReviewConfidence | null;
}

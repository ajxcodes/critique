"use strict";
/**
 * critique - ReviewConfidence Value Object
 *
 * Immutable representation of an AI Review confidence rating and explanation.
 * Strictly avoids magic strings by using domain constants.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewConfidence = void 0;
const constants_1 = require("../constants");
const errors_1 = require("../errors");
function normalizeConfidenceLevel(raw) {
    const normalized = raw.trim().toLowerCase();
    if (normalized === constants_1.CONFIDENCE_HIGH.toLowerCase()) {
        return constants_1.CONFIDENCE_HIGH;
    }
    if (normalized === constants_1.CONFIDENCE_MEDIUM.toLowerCase()) {
        return constants_1.CONFIDENCE_MEDIUM;
    }
    if (normalized === constants_1.CONFIDENCE_LOW.toLowerCase()) {
        return constants_1.CONFIDENCE_LOW;
    }
    throw new errors_1.ValidationError('confidenceLevel', raw, `Confidence level must be one of: ${constants_1.REVIEW_CONFIDENCE_LEVELS.join(', ')}.`);
}
class ReviewConfidence {
    level;
    explanation;
    constructor(level, explanation = '') {
        if (typeof level !== 'string' || !level.trim()) {
            throw new errors_1.ValidationError('confidenceLevel', level, 'Confidence level must be a non-empty string.');
        }
        if (typeof explanation !== 'string') {
            throw new errors_1.ValidationError('confidenceExplanation', explanation, 'Confidence explanation must be a string.');
        }
        this.level = normalizeConfidenceLevel(level);
        this.explanation = explanation.trim();
        Object.freeze(this);
    }
    isHigh() {
        return this.level === constants_1.CONFIDENCE_HIGH;
    }
    isMedium() {
        return this.level === constants_1.CONFIDENCE_MEDIUM;
    }
    isLow() {
        return this.level === constants_1.CONFIDENCE_LOW;
    }
    equals(other) {
        if (!other)
            return false;
        return this.level === other.level && this.explanation === other.explanation;
    }
    toString() {
        if (this.explanation) {
            return `${this.level} - ${this.explanation}`;
        }
        return this.level;
    }
    static create(level, explanation = '') {
        return new ReviewConfidence(level, explanation);
    }
    static high(explanation = '') {
        return new ReviewConfidence(constants_1.CONFIDENCE_HIGH, explanation);
    }
    static medium(explanation = '') {
        return new ReviewConfidence(constants_1.CONFIDENCE_MEDIUM, explanation);
    }
    static low(explanation = '') {
        return new ReviewConfidence(constants_1.CONFIDENCE_LOW, explanation);
    }
    static tryFrom(raw) {
        if (!raw)
            return null;
        if (raw instanceof ReviewConfidence)
            return raw;
        if (typeof raw === 'string') {
            try {
                return new ReviewConfidence(raw);
            }
            catch {
                return null;
            }
        }
        if (typeof raw === 'object' && raw !== null) {
            const candidate = raw;
            const level = candidate.level ?? candidate.confidenceLevel;
            const explanation = candidate.explanation ?? candidate.confidenceExplanation;
            if (typeof level === 'string') {
                try {
                    return new ReviewConfidence(level, typeof explanation === 'string' ? explanation : '');
                }
                catch {
                    return null;
                }
            }
        }
        return null;
    }
}
exports.ReviewConfidence = ReviewConfidence;
//# sourceMappingURL=review-confidence.js.map
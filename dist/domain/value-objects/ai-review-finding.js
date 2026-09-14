"use strict";
/**
 * critique - AiReviewFinding Value Object
 *
 * Immutable representation of an individual AI Code Review finding/comment.
 * Categorizes comments by severity (critical, error, warning, suggestion, info).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiReviewFinding = void 0;
const constants_1 = require("../constants");
const errors_1 = require("../errors");
function normalizeSeverity(raw) {
    const lower = raw.trim().toLowerCase();
    for (const s of constants_1.REVIEW_SEVERITIES) {
        if (lower === s) {
            return s;
        }
    }
    throw new errors_1.ValidationError('severity', raw, `Severity must be one of: ${constants_1.REVIEW_SEVERITIES.join(', ')}.`);
}
class AiReviewFinding {
    path;
    line;
    severity;
    body;
    constructor(props) {
        if (typeof props.path !== 'string' || !props.path.trim()) {
            throw new errors_1.ValidationError('path', props.path, 'Finding file path must be a non-empty string.');
        }
        if (typeof props.line !== 'number' || !Number.isSafeInteger(props.line) || props.line < 0) {
            throw new errors_1.ValidationError('line', props.line, 'Finding line must be a non-negative integer.');
        }
        if (typeof props.body !== 'string' || !props.body.trim()) {
            throw new errors_1.ValidationError('body', props.body, 'Finding body must be a non-empty string.');
        }
        this.path = props.path.trim();
        this.line = props.line;
        this.severity = normalizeSeverity(props.severity);
        this.body = props.body.trim();
        Object.freeze(this);
    }
    isBlocking() {
        return this.severity === constants_1.SEVERITY_CRITICAL || this.severity === constants_1.SEVERITY_ERROR;
    }
    isCritical() {
        return this.severity === constants_1.SEVERITY_CRITICAL;
    }
    isError() {
        return this.severity === constants_1.SEVERITY_ERROR || this.severity === constants_1.SEVERITY_CRITICAL;
    }
    isWarning() {
        return this.severity === constants_1.SEVERITY_WARNING;
    }
    isSuggestion() {
        return this.severity === constants_1.SEVERITY_SUGGESTION;
    }
    isInfo() {
        return this.severity === constants_1.SEVERITY_INFO;
    }
    getIcon() {
        return constants_1.SEVERITY_ICONS[this.severity] || constants_1.SEVERITY_ICONS[constants_1.SEVERITY_INFO];
    }
    getHeader() {
        return constants_1.SEVERITY_HEADERS[this.severity] || constants_1.SEVERITY_HEADERS[constants_1.SEVERITY_INFO];
    }
    formatMarkdown() {
        const icon = this.getIcon();
        const lineStr = this.line > 0 ? ` (Line ${this.line})` : '';
        return `### ${icon} ${this.path}${lineStr}\n${this.body}\n`;
    }
    equals(other) {
        if (!other)
            return false;
        return (this.path === other.path &&
            this.line === other.line &&
            this.severity === other.severity &&
            this.body === other.body);
    }
    toJSON() {
        return {
            path: this.path,
            line: this.line,
            severity: this.severity,
            body: this.body
        };
    }
    static create(props) {
        return new AiReviewFinding(props);
    }
    static tryFrom(raw) {
        if (!raw || typeof raw !== 'object')
            return null;
        if (raw instanceof AiReviewFinding)
            return raw;
        const candidate = raw;
        if (typeof candidate.path === 'string' &&
            typeof candidate.line === 'number' &&
            typeof candidate.severity === 'string' &&
            typeof candidate.body === 'string') {
            try {
                return new AiReviewFinding({
                    path: candidate.path,
                    line: candidate.line,
                    severity: candidate.severity,
                    body: candidate.body
                });
            }
            catch {
                return null;
            }
        }
        return null;
    }
}
exports.AiReviewFinding = AiReviewFinding;
//# sourceMappingURL=ai-review-finding.js.map
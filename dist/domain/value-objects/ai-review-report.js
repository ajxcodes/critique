"use strict";
/**
 * critique - AiReviewReport Value Object
 *
 * Immutable representation of a complete AI PR Review report.
 * Provides structured diagnostic parsing, severity queries, and markdown formatting.
 * Pure domain value object: 100% free of external I/O or child processes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiReviewReport = void 0;
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const review_confidence_1 = require("./review-confidence");
const ai_review_finding_1 = require("./ai-review-finding");
function extractJsonString(rawText) {
    const trimmed = rawText.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return trimmed;
    }
    const codeBlockMatch = trimmed.match(constants_1.REGEX_JSON_CODE_BLOCK);
    if (codeBlockMatch && codeBlockMatch[1]) {
        return codeBlockMatch[1].trim();
    }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return trimmed.substring(firstBrace, lastBrace + 1).trim();
    }
    return trimmed;
}
class AiReviewReport {
    summary;
    confidence;
    findings;
    resolvedThreads;
    bypassed;
    diagnosticMessage;
    rawOutput;
    modelUsed;
    constructor(props) {
        if (typeof props.summary !== 'string') {
            throw new errors_1.ValidationError('summary', props.summary, 'Review summary must be a string.');
        }
        if (!(props.confidence instanceof review_confidence_1.ReviewConfidence)) {
            throw new errors_1.ValidationError('confidence', props.confidence, 'Review confidence must be a ReviewConfidence instance.');
        }
        this.summary = props.summary.trim();
        this.confidence = props.confidence;
        this.findings = Object.freeze([...(props.findings || [])]);
        this.resolvedThreads = Object.freeze([...(props.resolvedThreads || [])]);
        this.bypassed = Boolean(props.bypassed);
        this.diagnosticMessage = props.diagnosticMessage;
        this.rawOutput = props.rawOutput;
        this.modelUsed = props.modelUsed;
        Object.freeze(this);
    }
    isPassing() {
        if (this.bypassed)
            return false;
        return !this.hasBlockingIssues() && this.confidence.isHigh();
    }
    hasBlockingIssues() {
        return this.findings.some((finding) => finding.isBlocking());
    }
    hasFindings() {
        return this.findings.length > 0;
    }
    errorCount() {
        return this.findings.filter((f) => f.isError()).length;
    }
    warningCount() {
        return this.findings.filter((f) => f.isWarning()).length;
    }
    suggestionCount() {
        return this.findings.filter((f) => f.isSuggestion()).length;
    }
    infoCount() {
        return this.findings.filter((f) => f.isInfo()).length;
    }
    formatMarkdownReport() {
        const sections = [
            '====================================',
            constants_1.BANNER_REVIEW_TITLE,
            '====================================\n',
            `${constants_1.BANNER_SUMMARY}\n${this.summary}\n`,
            `**Confidence:** ${this.confidence.toString()}\n`
        ];
        if (this.modelUsed) {
            sections.push(`*Evaluated by Google Gemini (${this.modelUsed})*\n`);
        }
        if (this.findings.length > 0) {
            sections.push(`${constants_1.BANNER_CODE_COMMENTS}\n`);
            for (const finding of this.findings) {
                sections.push(finding.formatMarkdown());
            }
        }
        else {
            sections.push(`${constants_1.BANNER_CODE_COMMENTS}\n${constants_1.MSG_NO_ISSUES_FOUND}\n`);
        }
        if (this.diagnosticMessage) {
            sections.push(`\n> **Notice:** ${this.diagnosticMessage}\n`);
        }
        return sections.join('\n');
    }
    toJSON() {
        return {
            summary: this.summary,
            confidenceLevel: this.confidence.level,
            confidenceExplanation: this.confidence.explanation,
            resolvedThreads: [...this.resolvedThreads],
            comments: this.findings.map((f) => f.toJSON()),
            bypassed: this.bypassed,
            diagnosticMessage: this.diagnosticMessage,
            modelUsed: this.modelUsed
        };
    }
    static create(props) {
        return new AiReviewReport(props);
    }
    static empty(customMessage = constants_1.MSG_CLEAN_DIFF_REVIEW) {
        return new AiReviewReport({
            summary: customMessage,
            confidence: review_confidence_1.ReviewConfidence.high(customMessage),
            findings: [],
            resolvedThreads: [],
            bypassed: false
        });
    }
    static bypassed(reason) {
        return new AiReviewReport({
            summary: `AI review was bypassed: ${reason}`,
            confidence: review_confidence_1.ReviewConfidence.low(reason),
            findings: [],
            resolvedThreads: [],
            bypassed: true,
            diagnosticMessage: reason
        });
    }
    static parse(rawText, modelUsed) {
        if (typeof rawText !== 'string' || !rawText.trim()) {
            throw new errors_1.AiReviewerError('parse', 'Cannot parse empty review payload.');
        }
        const candidateJson = extractJsonString(rawText);
        let parsed;
        try {
            parsed = JSON.parse(candidateJson);
        }
        catch (err) {
            throw new errors_1.AiReviewerError('parse', `Failed to parse review JSON response: ${err instanceof Error ? err.message : String(err)}`, { rawSnippet: rawText.substring(0, 300) }, err);
        }
        const summary = typeof parsed.summary === 'string' ? parsed.summary : '';
        const confidenceLevel = typeof parsed.confidenceLevel === 'string' ? parsed.confidenceLevel : 'Medium';
        const confidenceExplanation = typeof parsed.confidenceExplanation === 'string' ? parsed.confidenceExplanation : '';
        const confidence = review_confidence_1.ReviewConfidence.create(confidenceLevel, confidenceExplanation);
        const findings = [];
        if (Array.isArray(parsed.comments)) {
            for (const item of parsed.comments) {
                const finding = ai_review_finding_1.AiReviewFinding.tryFrom(item);
                if (finding) {
                    findings.push(finding);
                }
            }
        }
        const resolvedThreads = [];
        if (Array.isArray(parsed.resolvedThreads)) {
            for (const thread of parsed.resolvedThreads) {
                if (typeof thread === 'string') {
                    resolvedThreads.push(thread);
                }
            }
        }
        return new AiReviewReport({
            summary,
            confidence,
            findings,
            resolvedThreads,
            rawOutput: rawText,
            modelUsed
        });
    }
}
exports.AiReviewReport = AiReviewReport;
//# sourceMappingURL=ai-review-report.js.map
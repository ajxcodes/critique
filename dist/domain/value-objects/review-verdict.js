"use strict";
/**
 * critique - ReviewVerdict Value Object
 *
 * Immutable, self-validating value object representing the outcome of the AI Review stage.
 * Emits and parses machine-readable REVIEW_* tokens, Markdown self-correction context,
 * and bridges AI PR review reports to orchestrator lifecycles.
 *
 * Pure domain value object: 100% free of filesystem, child processes, or network I/O.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewVerdict = void 0;
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const ai_review_report_1 = require("./ai-review-report");
function isNoneOrEmpty(value) {
    if (!value)
        return true;
    const trimmed = value.trim().toLowerCase();
    return (trimmed === '' ||
        trimmed === 'none' ||
        trimmed === 'none.' ||
        trimmed === 'n/a' ||
        trimmed === 'nil' ||
        trimmed === 'no unfulfilled criteria');
}
function cleanBulletItem(rawLine) {
    return rawLine
        .replace(/^[-*+]\s+/, '')
        .replace(/^\d+\.\s+/, '')
        .trim();
}
class ReviewVerdict {
    status;
    summary;
    unfulfilledCriteria;
    remediationGuidance;
    confidenceLevel;
    findings;
    constructor(props) {
        if (!props || typeof props !== 'object') {
            throw new errors_1.ValidationError('props', props, 'ReviewVerdict props must be an object.');
        }
        if (props.status !== constants_1.VERDICT_APPROVED && props.status !== constants_1.VERDICT_CHANGES_REQUESTED) {
            throw new errors_1.ValidationError('status', props.status, `Invalid review verdict status '${props.status}'. Must be '${constants_1.VERDICT_APPROVED}' or '${constants_1.VERDICT_CHANGES_REQUESTED}'.`);
        }
        if (typeof props.summary !== 'string' || props.summary.trim().length === 0) {
            throw new errors_1.ValidationError('summary', props.summary, 'Review summary must be a non-empty string.');
        }
        this.status = props.status;
        this.summary = props.summary.trim();
        const criteria = (props.unfulfilledCriteria || [])
            .map((c) => (typeof c === 'string' ? cleanBulletItem(c) : ''))
            .filter((c) => !isNoneOrEmpty(c));
        this.unfulfilledCriteria = Object.freeze(criteria);
        const remediation = (props.remediationGuidance || [])
            .map((r) => (typeof r === 'string' ? cleanBulletItem(r) : ''))
            .filter((r) => !isNoneOrEmpty(r));
        this.remediationGuidance = Object.freeze(remediation);
        this.confidenceLevel = props.confidenceLevel ?? null;
        this.findings = props.findings ? Object.freeze([...props.findings]) : Object.freeze([]);
        Object.freeze(this);
    }
    isApproved() {
        return this.status === constants_1.VERDICT_APPROVED;
    }
    isChangesRequested() {
        return this.status === constants_1.VERDICT_CHANGES_REQUESTED;
    }
    formatStructuredTokens() {
        const lines = [
            `${constants_1.TOKEN_REVIEW_STATUS}: ${this.status}`,
            `${constants_1.TOKEN_REVIEW_SUMMARY}: ${this.summary}`
        ];
        lines.push(`${constants_1.TOKEN_UNFULFILLED_AC}:`);
        if (this.unfulfilledCriteria.length === 0) {
            lines.push('- None');
        }
        else {
            for (const item of this.unfulfilledCriteria) {
                lines.push(`- ${item}`);
            }
        }
        lines.push(`${constants_1.TOKEN_REMEDIATION_GUIDANCE}:`);
        if (this.remediationGuidance.length === 0) {
            lines.push('- None');
        }
        else {
            for (const item of this.remediationGuidance) {
                lines.push(`- ${item}`);
            }
        }
        return lines.join('\n');
    }
    formatReportText() {
        let report = `${constants_1.HEADER_REVIEW_VERDICT_REPORT}\n`;
        report += `${constants_1.LABEL_REVIEW_STATUS.padEnd(20)}: ${this.status}\n`;
        report += `${constants_1.LABEL_REVIEW_SUMMARY.padEnd(20)}: ${this.summary}\n`;
        if (this.confidenceLevel) {
            report += `Confidence Level    : ${this.confidenceLevel}\n`;
        }
        if (this.unfulfilledCriteria.length > 0) {
            report += `\n${constants_1.LABEL_UNFULFILLED_AC}:\n`;
            for (const item of this.unfulfilledCriteria) {
                report += `  • ${item}\n`;
            }
        }
        if (this.remediationGuidance.length > 0) {
            report += `\n${constants_1.LABEL_REMEDIATION_GUIDANCE}:\n`;
            for (const item of this.remediationGuidance) {
                report += `  • ${item}\n`;
            }
        }
        return report.trim();
    }
    formatSelfCorrectionPayload() {
        if (this.isApproved()) {
            return '';
        }
        let payload = `${constants_1.SECTION_REVIEW_SELF_CORRECTION_TITLE}\n`;
        payload += `The previous Critique AI Review requested changes. Address these items before continuing:\n\n`;
        payload += `**Review Summary**: ${this.summary}\n\n`;
        if (this.unfulfilledCriteria.length > 0) {
            payload += `**Unfulfilled Acceptance Criteria**:\n`;
            for (const ac of this.unfulfilledCriteria) {
                payload += `- ${ac}\n`;
            }
            payload += `\n`;
        }
        if (this.remediationGuidance.length > 0) {
            payload += `**Required Remediation Actions**:\n`;
            for (const guide of this.remediationGuidance) {
                payload += `- ${guide}\n`;
            }
            payload += `\n`;
        }
        return payload.trim();
    }
    toJSON() {
        return {
            status: this.status,
            summary: this.summary,
            unfulfilledCriteria: this.unfulfilledCriteria,
            remediationGuidance: this.remediationGuidance,
            confidenceLevel: this.confidenceLevel,
            findingsCount: this.findings.length
        };
    }
    static create(props) {
        return new ReviewVerdict(props);
    }
    static parse(text) {
        if (!text || typeof text !== 'string') {
            throw new errors_1.ReviewerSubagentError('parse', 'Review output cannot be empty or non-string.');
        }
        // 1. Extract status token
        let status;
        const statusMatch = text.match(constants_1.REGEX_REVIEW_STATUS_TOKEN);
        if (statusMatch) {
            const parsed = statusMatch[1].toUpperCase();
            if (parsed === constants_1.VERDICT_APPROVED || parsed === constants_1.VERDICT_CHANGES_REQUESTED) {
                status = parsed;
            }
        }
        if (!status) {
            const fallbackMatch = text.match(/(?:Review\s+Status|Verdict|Status)\s*:\s*(APPROVED|CHANGES_REQUESTED)/i);
            if (fallbackMatch) {
                status = fallbackMatch[1].toUpperCase();
            }
        }
        if (!status) {
            throw new errors_1.ReviewerSubagentError('parse', `Could not determine review verdict status from output. Expected '${constants_1.TOKEN_REVIEW_STATUS}: ${constants_1.VERDICT_APPROVED}' or '${constants_1.TOKEN_REVIEW_STATUS}: ${constants_1.VERDICT_CHANGES_REQUESTED}'.`, { rawSnippet: text.substring(0, 300) });
        }
        // 2. Extract summary
        let summary = '';
        const summaryMatch = text.match(constants_1.REGEX_REVIEW_SUMMARY_TOKEN);
        if (summaryMatch) {
            summary = summaryMatch[1].trim();
        }
        else {
            const fallbackSummary = text.match(/(?:Summary|Review\s+Summary)\s*:\s*(.+)$/im);
            if (fallbackSummary) {
                summary = fallbackSummary[1].trim();
            }
            else {
                summary = status === constants_1.VERDICT_APPROVED
                    ? 'Review passed: All standards and acceptance criteria met.'
                    : 'Review requested changes: Unfulfilled criteria or defects detected.';
            }
        }
        // 3. Extract unfulfilled criteria and remediation guidance list blocks
        const lines = text.split('\n');
        const unfulfilledCriteria = [];
        const remediationGuidance = [];
        let mode = 'none';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.match(/^UNFULFILLED_AC:/i) || line.match(/^Unfulfilled\s+(?:Acceptance\s+)?Criteria:/i)) {
                mode = 'unfulfilled';
                const inline = line.replace(/^[^:]+:\s*/, '').trim();
                if (inline && !isNoneOrEmpty(inline)) {
                    unfulfilledCriteria.push(cleanBulletItem(inline));
                }
                continue;
            }
            if (line.match(/^REMEDIATION_GUIDANCE:/i) || line.match(/^Remediation\s+(?:Guidance|Actions):/i)) {
                mode = 'remediation';
                const inline = line.replace(/^[^:]+:\s*/, '').trim();
                if (inline && !isNoneOrEmpty(inline)) {
                    remediationGuidance.push(cleanBulletItem(inline));
                }
                continue;
            }
            if (line.match(/^[A-Z_]+:\s*/) || line.startsWith('#') || line.startsWith('===')) {
                mode = 'none';
                continue;
            }
            if (mode === 'unfulfilled') {
                if (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) {
                    const item = cleanBulletItem(line);
                    if (!isNoneOrEmpty(item)) {
                        unfulfilledCriteria.push(item);
                    }
                }
            }
            else if (mode === 'remediation') {
                if (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) {
                    const item = cleanBulletItem(line);
                    if (!isNoneOrEmpty(item)) {
                        remediationGuidance.push(item);
                    }
                }
            }
        }
        return new ReviewVerdict({
            status,
            summary,
            unfulfilledCriteria,
            remediationGuidance
        });
    }
    static fromAiReviewReport(report) {
        if (!report || !(report instanceof ai_review_report_1.AiReviewReport)) {
            throw new errors_1.ValidationError('report', report, 'Valid AiReviewReport instance required.');
        }
        const passing = report.isPassing();
        const status = passing ? constants_1.VERDICT_APPROVED : constants_1.VERDICT_CHANGES_REQUESTED;
        const unfulfilledCriteria = [];
        const remediationGuidance = [];
        const blockingFindings = report.findings.filter((f) => f.isBlocking());
        for (const finding of blockingFindings) {
            unfulfilledCriteria.push(`[${finding.path}:${finding.line}] ${finding.body}`);
            remediationGuidance.push(`Fix [${finding.path}:${finding.line}]: Address ${finding.severity} finding`);
        }
        return new ReviewVerdict({
            status,
            summary: report.summary || (passing ? 'All review standards and checks passed.' : 'Review identified blocking issues.'),
            unfulfilledCriteria,
            remediationGuidance,
            confidenceLevel: report.confidence ? report.confidence.level : null,
            findings: report.findings
        });
    }
}
exports.ReviewVerdict = ReviewVerdict;
//# sourceMappingURL=review-verdict.js.map
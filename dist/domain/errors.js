"use strict";
/**
 * critique - Strongly-typed Domain Error Hierarchy
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandExecutionError = exports.GitHubApiError = exports.ReviewerSubagentError = exports.AiReviewerError = exports.ValidationError = exports.CritiqueError = void 0;
class CritiqueError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.name = this.constructor.name;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.CritiqueError = CritiqueError;
class ValidationError extends CritiqueError {
    code = 'ERR_VALIDATION';
    field;
    value;
    constructor(field, value, reason) {
        super(`Validation failed for field '${field}': ${reason}`, { field, value, reason });
        this.field = field;
        this.value = value;
    }
}
exports.ValidationError = ValidationError;
class AiReviewerError extends CritiqueError {
    code = 'ERR_AI_REVIEWER';
    operation;
    reason;
    constructor(operation, reason, details, cause) {
        const causeMsg = cause instanceof Error ? `: ${cause.message}` : '';
        super(`Critique AI error during '${operation}': ${reason}${causeMsg}`, { operation, reason, ...details });
        this.operation = operation;
        this.reason = reason;
        if (cause) {
            this.cause = cause;
        }
    }
}
exports.AiReviewerError = AiReviewerError;
class ReviewerSubagentError extends CritiqueError {
    code = 'ERR_REVIEWER_PARSER';
    operation;
    reason;
    constructor(operation, reason, details, cause) {
        const causeMsg = cause instanceof Error ? `: ${cause.message}` : '';
        super(`Reviewer parser error during '${operation}': ${reason}${causeMsg}`, { operation, reason, ...details });
        this.operation = operation;
        this.reason = reason;
        if (cause) {
            this.cause = cause;
        }
    }
}
exports.ReviewerSubagentError = ReviewerSubagentError;
class GitHubApiError extends CritiqueError {
    code = 'ERR_GITHUB_API';
    operation;
    constructor(operation, details, cause) {
        const causeMsg = cause instanceof Error ? `: ${cause.message}` : '';
        super(`GitHub API error during '${operation}'${causeMsg}`, details);
        this.operation = operation;
        if (cause) {
            this.cause = cause;
        }
    }
}
exports.GitHubApiError = GitHubApiError;
class CommandExecutionError extends CritiqueError {
    code = 'ERR_COMMAND_EXECUTION';
    command;
    exitCode;
    stderr;
    constructor(command, exitCode, stderr = '') {
        super(`Command '${command}' failed with exit code ${exitCode}. ${stderr}`.trim(), {
            command,
            exitCode,
            stderr
        });
        this.command = command;
        this.exitCode = exitCode;
        this.stderr = stderr;
    }
}
exports.CommandExecutionError = CommandExecutionError;
//# sourceMappingURL=errors.js.map
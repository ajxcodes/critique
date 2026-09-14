/**
 * critique - Strongly-typed Domain Error Hierarchy
 */

export abstract class CritiqueError extends Error {
  public abstract readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends CritiqueError {
  public readonly code = 'ERR_VALIDATION';
  public readonly field: string;
  public readonly value: unknown;

  constructor(field: string, value: unknown, reason: string) {
    super(`Validation failed for field '${field}': ${reason}`, { field, value, reason });
    this.field = field;
    this.value = value;
  }
}

export class AiReviewerError extends CritiqueError {
  public readonly code = 'ERR_AI_REVIEWER';
  public readonly operation: string;
  public readonly reason: string;

  constructor(operation: string, reason: string, details?: Record<string, unknown>, cause?: unknown) {
    const causeMsg = cause instanceof Error ? `: ${cause.message}` : '';
    super(`Critique AI error during '${operation}': ${reason}${causeMsg}`, { operation, reason, ...details });
    this.operation = operation;
    this.reason = reason;
    if (cause) {
      this.cause = cause;
    }
  }
}

export class ReviewerSubagentError extends CritiqueError {
  public readonly code = 'ERR_REVIEWER_PARSER';
  public readonly operation: string;
  public readonly reason: string;

  constructor(operation: string, reason: string, details?: Record<string, unknown>, cause?: unknown) {
    const causeMsg = cause instanceof Error ? `: ${cause.message}` : '';
    super(`Reviewer parser error during '${operation}': ${reason}${causeMsg}`, { operation, reason, ...details });
    this.operation = operation;
    this.reason = reason;
    if (cause) {
      this.cause = cause;
    }
  }
}

export class GitHubApiError extends CritiqueError {
  public readonly code = 'ERR_GITHUB_API';
  public readonly operation: string;

  constructor(operation: string, details?: Record<string, unknown>, cause?: unknown) {
    const causeMsg = cause instanceof Error ? `: ${cause.message}` : '';
    super(`GitHub API error during '${operation}'${causeMsg}`, details);
    this.operation = operation;
    if (cause) {
      this.cause = cause;
    }
  }
}

export class CommandExecutionError extends CritiqueError {
  public readonly code = 'ERR_COMMAND_EXECUTION';
  public readonly command: string;
  public readonly exitCode: number;
  public readonly stderr: string;

  constructor(command: string, exitCode: number, stderr: string = '') {
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

"use strict";
/**
 * critique - Domain Constants
 *
 * Centralized, immutable definitions for AI models, fallback cascade,
 * standards discovery order, severities, confidence levels, verdict tokens,
 * HTTP status codes, and thresholds.
 * Zero magic strings/numbers across the entire codebase.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LABEL_UNFULFILLED_AC = exports.LABEL_REVIEW_SUMMARY = exports.LABEL_REVIEW_STATUS = exports.HEADER_REVIEW_VERDICT_REPORT = exports.REGEX_REMEDIATION_GUIDANCE_TOKEN = exports.REGEX_UNFULFILLED_AC_TOKEN = exports.REGEX_REVIEW_SUMMARY_TOKEN = exports.REGEX_REVIEW_STATUS_TOKEN = exports.TOKEN_REMEDIATION_GUIDANCE = exports.TOKEN_UNFULFILLED_AC = exports.TOKEN_REVIEW_SUMMARY = exports.TOKEN_REVIEW_STATUS = exports.REVIEW_VERDICTS = exports.VERDICT_CHANGES_REQUESTED = exports.VERDICT_APPROVED = exports.SEVERITY_HEADERS = exports.SEVERITY_ICONS = exports.SEVERITY_ICON_INFO = exports.SEVERITY_ICON_SUGGESTION = exports.SEVERITY_ICON_WARNING = exports.SEVERITY_ICON_ERROR = exports.SEVERITY_ICON_CRITICAL = exports.REVIEW_SEVERITIES = exports.SEVERITY_INFO = exports.SEVERITY_SUGGESTION = exports.SEVERITY_WARNING = exports.SEVERITY_ERROR = exports.SEVERITY_CRITICAL = exports.REVIEW_CONFIDENCE_LEVELS = exports.CONFIDENCE_LOW = exports.CONFIDENCE_MEDIUM = exports.CONFIDENCE_HIGH = exports.STANDARD_CANDIDATE_PATHS = exports.HTTP_STATUS_SERVICE_UNAVAILABLE = exports.HTTP_STATUS_TOO_MANY_REQUESTS = exports.HTTP_STATUS_OK = exports.AI_REVIEWER_MAX_PR_DIFF_CHARS = exports.AI_REVIEWER_MAX_DIFF_CHARS = exports.AI_REVIEWER_RETRY_DELAY_MS = exports.AI_REVIEWER_DEFAULT_TIMEOUT_MS = exports.AI_REVIEWER_DEFAULT_MIME_TYPE = exports.AI_REVIEWER_DEFAULT_TEMPERATURE = exports.GEMINI_API_BASE_URL = exports.COPILOT_API_URL = exports.MODEL_COPILOT_GPT_4O = exports.AI_REVIEWER_MODELS = exports.MODEL_GEMINI_2_5_PRO = exports.MODEL_GEMINI_2_5_FLASH = exports.MODEL_GEMINI_3_5_FLASH = exports.MODEL_GEMINI_3_5_FLASH_LITE = void 0;
exports.DEFAULT_CRITIQUE_SYSTEM_INSTRUCTION = exports.AI_SUGGESTION_PREFIX = exports.AI_SUMMARY_END_MARKER = exports.AI_SUMMARY_START_MARKER = exports.DEFAULT_NO_UNRESOLVED_THREADS_TEXT = exports.MSG_ALL_MODELS_FAILED = exports.MSG_MISSING_API_KEY = exports.MSG_NO_ISSUES_FOUND = exports.MSG_CLEAN_DIFF_REVIEW = exports.MSG_NO_DIFF_FOUND = exports.BANNER_SUMMARY = exports.BANNER_CODE_COMMENTS = exports.BANNER_REVIEW_TITLE = exports.EXIT_CODE_FAILURE = exports.EXIT_CODE_SUCCESS = exports.CRITIQUE_VERSION = exports.REGEX_CONFIDENCE = exports.REGEX_SEVERITY = exports.REGEX_WORKFLOW_PROMPT = exports.REGEX_JSON_CODE_BLOCK = exports.REGEX_ENV_KEY_VAL = exports.PATH_USER_LOCAL_LEGACY = exports.PATH_USER_LOCAL_CRITIQUE = exports.PATH_BUNDLED_CRITIQUE_JS = exports.ENV_FILE_NAME = exports.ENV_VAR_GITHUB_TOKEN = exports.ENV_VAR_GEMINI_API_KEY = exports.RESOLVER_SOURCES = exports.RESOLVER_SOURCE_NONE = exports.RESOLVER_SOURCE_SYSTEM_PATH = exports.RESOLVER_SOURCE_USER_LOCAL = exports.RESOLVER_SOURCE_BUNDLED = exports.SECTION_REVIEW_SELF_CORRECTION_TITLE = exports.LABEL_REMEDIATION_GUIDANCE = void 0;
// Model Cascade & Configuration
exports.MODEL_GEMINI_3_5_FLASH_LITE = 'gemini-3.5-flash-lite';
exports.MODEL_GEMINI_3_5_FLASH = 'gemini-3.5-flash';
exports.MODEL_GEMINI_2_5_FLASH = 'gemini-2.5-flash';
exports.MODEL_GEMINI_2_5_PRO = 'gemini-2.5-pro';
exports.AI_REVIEWER_MODELS = Object.freeze([
    exports.MODEL_GEMINI_3_5_FLASH_LITE,
    exports.MODEL_GEMINI_3_5_FLASH,
    exports.MODEL_GEMINI_2_5_FLASH,
    exports.MODEL_GEMINI_2_5_PRO
]);
exports.MODEL_COPILOT_GPT_4O = 'gpt-4o';
exports.COPILOT_API_URL = 'https://models.inference.ai.azure.com/chat/completions';
exports.GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
exports.AI_REVIEWER_DEFAULT_TEMPERATURE = 0.1;
exports.AI_REVIEWER_DEFAULT_MIME_TYPE = 'application/json';
exports.AI_REVIEWER_DEFAULT_TIMEOUT_MS = 60000;
exports.AI_REVIEWER_RETRY_DELAY_MS = 2000;
exports.AI_REVIEWER_MAX_DIFF_CHARS = 120000;
exports.AI_REVIEWER_MAX_PR_DIFF_CHARS = 3000000;
// HTTP Status Codes
exports.HTTP_STATUS_OK = 200;
exports.HTTP_STATUS_TOO_MANY_REQUESTS = 429;
exports.HTTP_STATUS_SERVICE_UNAVAILABLE = 503;
// Standards File Discovery Cascade (Order of Precedence)
exports.STANDARD_CANDIDATE_PATHS = Object.freeze([
    '.github/critique.md',
    '.critique.md',
    '.github/ai-reviewer-standards.md',
    'AGENTS.md',
    'STANDARDS.md',
    'CONTRIBUTING.md'
]);
// Review Confidence Levels
exports.CONFIDENCE_HIGH = 'High';
exports.CONFIDENCE_MEDIUM = 'Medium';
exports.CONFIDENCE_LOW = 'Low';
exports.REVIEW_CONFIDENCE_LEVELS = Object.freeze([
    exports.CONFIDENCE_HIGH,
    exports.CONFIDENCE_MEDIUM,
    exports.CONFIDENCE_LOW
]);
// Review Finding Severities
exports.SEVERITY_CRITICAL = 'critical';
exports.SEVERITY_ERROR = 'error';
exports.SEVERITY_WARNING = 'warning';
exports.SEVERITY_SUGGESTION = 'suggestion';
exports.SEVERITY_INFO = 'info';
exports.REVIEW_SEVERITIES = Object.freeze([
    exports.SEVERITY_CRITICAL,
    exports.SEVERITY_ERROR,
    exports.SEVERITY_WARNING,
    exports.SEVERITY_SUGGESTION,
    exports.SEVERITY_INFO
]);
// Severity Icons & Headers
exports.SEVERITY_ICON_CRITICAL = '🔴';
exports.SEVERITY_ICON_ERROR = '🔴';
exports.SEVERITY_ICON_WARNING = '⚠️';
exports.SEVERITY_ICON_SUGGESTION = '💡';
exports.SEVERITY_ICON_INFO = 'ℹ️';
exports.SEVERITY_ICONS = Object.freeze({
    [exports.SEVERITY_CRITICAL]: exports.SEVERITY_ICON_CRITICAL,
    [exports.SEVERITY_ERROR]: exports.SEVERITY_ICON_ERROR,
    [exports.SEVERITY_WARNING]: exports.SEVERITY_ICON_WARNING,
    [exports.SEVERITY_SUGGESTION]: exports.SEVERITY_ICON_SUGGESTION,
    [exports.SEVERITY_INFO]: exports.SEVERITY_ICON_INFO
});
exports.SEVERITY_HEADERS = Object.freeze({
    [exports.SEVERITY_CRITICAL]: '🔴 **CRITICAL**: ',
    [exports.SEVERITY_ERROR]: '🔴 **ERROR**: ',
    [exports.SEVERITY_WARNING]: '⚠️ **WARNING**: ',
    [exports.SEVERITY_SUGGESTION]: '💡 **SUGGESTION**: ',
    [exports.SEVERITY_INFO]: 'ℹ️ **INFO**: '
});
// Review Verdicts & Tokens
exports.VERDICT_APPROVED = 'APPROVED';
exports.VERDICT_CHANGES_REQUESTED = 'CHANGES_REQUESTED';
exports.REVIEW_VERDICTS = Object.freeze([
    exports.VERDICT_APPROVED,
    exports.VERDICT_CHANGES_REQUESTED
]);
exports.TOKEN_REVIEW_STATUS = 'REVIEW_STATUS';
exports.TOKEN_REVIEW_SUMMARY = 'REVIEW_SUMMARY';
exports.TOKEN_UNFULFILLED_AC = 'UNFULFILLED_AC';
exports.TOKEN_REMEDIATION_GUIDANCE = 'REMEDIATION_GUIDANCE';
exports.REGEX_REVIEW_STATUS_TOKEN = /^REVIEW_STATUS:\s*(APPROVED|CHANGES_REQUESTED)$/im;
exports.REGEX_REVIEW_SUMMARY_TOKEN = /^REVIEW_SUMMARY:\s*(.+)$/im;
exports.REGEX_UNFULFILLED_AC_TOKEN = /^UNFULFILLED_AC:\s*(.+)$/im;
exports.REGEX_REMEDIATION_GUIDANCE_TOKEN = /^REMEDIATION_GUIDANCE:\s*(.+)$/im;
exports.HEADER_REVIEW_VERDICT_REPORT = '=== Critique: Review Verdict Report ===';
exports.LABEL_REVIEW_STATUS = 'Review Status';
exports.LABEL_REVIEW_SUMMARY = 'Review Summary';
exports.LABEL_UNFULFILLED_AC = 'Unfulfilled Acceptance Criteria';
exports.LABEL_REMEDIATION_GUIDANCE = 'Remediation Guidance';
exports.SECTION_REVIEW_SELF_CORRECTION_TITLE = '### Critique Reviewer Self-Correction Remediation Guidance:';
// Resolver Sources
exports.RESOLVER_SOURCE_BUNDLED = 'bundled';
exports.RESOLVER_SOURCE_USER_LOCAL = 'user_local';
exports.RESOLVER_SOURCE_SYSTEM_PATH = 'system_path';
exports.RESOLVER_SOURCE_NONE = 'none';
exports.RESOLVER_SOURCES = Object.freeze([
    exports.RESOLVER_SOURCE_BUNDLED,
    exports.RESOLVER_SOURCE_USER_LOCAL,
    exports.RESOLVER_SOURCE_SYSTEM_PATH,
    exports.RESOLVER_SOURCE_NONE
]);
// Environment & Paths
exports.ENV_VAR_GEMINI_API_KEY = 'GEMINI_API_KEY';
exports.ENV_VAR_GITHUB_TOKEN = 'GITHUB_TOKEN';
exports.ENV_FILE_NAME = '.env';
exports.PATH_BUNDLED_CRITIQUE_JS = 'bin/critique.js';
exports.PATH_USER_LOCAL_CRITIQUE = '.local/bin/critique';
exports.PATH_USER_LOCAL_LEGACY = '.local/bin/ai-reviewer';
// Regular Expressions
exports.REGEX_ENV_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
exports.REGEX_JSON_CODE_BLOCK = /```(?:json)?\s*([\s\S]*?)\s*```/;
exports.REGEX_WORKFLOW_PROMPT = /const\s+prompt\s*=\s*`([\s\S]*?)`;/;
exports.REGEX_SEVERITY = /^(critical|error|warning|suggestion|info)$/i;
exports.REGEX_CONFIDENCE = /^(high|medium|low)$/i;
// Presentation & Output Constants
exports.CRITIQUE_VERSION = '0.1.0';
exports.EXIT_CODE_SUCCESS = 0;
exports.EXIT_CODE_FAILURE = 1;
exports.BANNER_REVIEW_TITLE = '# 🤖 Critique: AI Code Review';
exports.BANNER_CODE_COMMENTS = '## 📝 Code Comments';
exports.BANNER_SUMMARY = '## Summary';
exports.MSG_NO_DIFF_FOUND = 'No diff found. Exiting.';
exports.MSG_CLEAN_DIFF_REVIEW = 'No uncommitted changes or working tree diff found.';
exports.MSG_NO_ISSUES_FOUND = '*No issues found! Great job!* 🚀';
exports.MSG_MISSING_API_KEY = 'Error: GEMINI_API_KEY is not set.\nPlease ensure it is set in ~/.env, .env, or in your environment variables.';
exports.MSG_ALL_MODELS_FAILED = 'All candidate Gemini models failed.';
exports.DEFAULT_NO_UNRESOLVED_THREADS_TEXT = 'No unresolved previous issues.';
exports.AI_SUMMARY_START_MARKER = '<!-- AI_SUMMARY_START -->';
exports.AI_SUMMARY_END_MARKER = '<!-- AI_SUMMARY_END -->';
exports.AI_SUGGESTION_PREFIX = '🤖 **Critique AI Suggestion**';
// Default System Instructions
exports.DEFAULT_CRITIQUE_SYSTEM_INSTRUCTION = `You are Critique, an expert senior software engineer and quality gatekeeper conducting a code review.

Context & Review Standards:
- You MUST carefully review the code changes in the diff.
- Verify adherence to repository standards and architectural patterns.
- Ensure you provide inline comments for any logic flaws, security vulnerabilities, performance regressions, or incorrect API usage.
- Categorize comment severity strictly as "critical", "error", "warning", "suggestion", or "info".
- Any "critical" or "error" comment indicates a blocking issue.
- Avoid nitpicks on unchanged code.

You must respond with a SINGLE JSON object with the following structure:
{
  "summary": "A markdown string containing a high-level summary of the changes and a bullet-pointed changelog.",
  "confidenceLevel": "High | Medium | Low",
  "confidenceExplanation": "Why this confidence level was chosen based on code complexity, completeness, and diff size.",
  "resolvedThreads": ["threadId1", "threadId2"],
  "comments": [
    {
      "path": "path/to/file.ts",
      "line": 15,
      "severity": "critical | error | warning | suggestion | info",
      "body": "Detailed review finding and actionable recommendation..."
    }
  ]
}`;
//# sourceMappingURL=constants.js.map
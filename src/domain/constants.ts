/**
 * critique - Domain Constants
 *
 * Centralized, immutable definitions for AI models, fallback cascade,
 * standards discovery order, severities, confidence levels, verdict tokens,
 * HTTP status codes, and thresholds.
 * Zero magic strings/numbers across the entire codebase.
 */

// Model Cascade & Configuration
export const MODEL_GEMINI_3_5_FLASH_LITE = 'gemini-3.5-flash-lite' as const;
export const MODEL_GEMINI_3_5_FLASH = 'gemini-3.5-flash' as const;
export const MODEL_GEMINI_2_5_FLASH = 'gemini-2.5-flash' as const;
export const MODEL_GEMINI_2_5_PRO = 'gemini-2.5-pro' as const;

export const AI_REVIEWER_MODELS = Object.freeze([
  MODEL_GEMINI_3_5_FLASH_LITE,
  MODEL_GEMINI_3_5_FLASH,
  MODEL_GEMINI_2_5_FLASH,
  MODEL_GEMINI_2_5_PRO
] as const);

export type AiReviewerModel = typeof AI_REVIEWER_MODELS[number];

export const MODEL_COPILOT_GPT_4O = 'gpt-4o' as const;
export const COPILOT_API_URL = 'https://models.inference.ai.azure.com/chat/completions' as const;
export const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models' as const;

export const AI_REVIEWER_DEFAULT_TEMPERATURE = 0.1 as const;
export const AI_REVIEWER_DEFAULT_MIME_TYPE = 'application/json' as const;
export const AI_REVIEWER_DEFAULT_TIMEOUT_MS = 60000 as const;
export const AI_REVIEWER_RETRY_DELAY_MS = 2000 as const;
export const AI_REVIEWER_MAX_DIFF_CHARS = 120000 as const;
export const AI_REVIEWER_MAX_PR_DIFF_CHARS = 250000 as const;

// HTTP Status Codes
export const HTTP_STATUS_OK = 200 as const;
export const HTTP_STATUS_TOO_MANY_REQUESTS = 429 as const;
export const HTTP_STATUS_SERVICE_UNAVAILABLE = 503 as const;

// Standards File Discovery Cascade (Order of Precedence)
export const STANDARD_CANDIDATE_PATHS = Object.freeze([
  '.github/critique.md',
  '.critique.md',
  '.github/ai-reviewer-standards.md',
  'AGENTS.md',
  'STANDARDS.md',
  'CONTRIBUTING.md'
] as const);

// Review Confidence Levels
export const CONFIDENCE_HIGH = 'High' as const;
export const CONFIDENCE_MEDIUM = 'Medium' as const;
export const CONFIDENCE_LOW = 'Low' as const;

export const REVIEW_CONFIDENCE_LEVELS = Object.freeze([
  CONFIDENCE_HIGH,
  CONFIDENCE_MEDIUM,
  CONFIDENCE_LOW
] as const);

export type ReviewConfidenceLevel = typeof REVIEW_CONFIDENCE_LEVELS[number];

// Review Finding Severities
export const SEVERITY_CRITICAL = 'critical' as const;
export const SEVERITY_ERROR = 'error' as const;
export const SEVERITY_WARNING = 'warning' as const;
export const SEVERITY_SUGGESTION = 'suggestion' as const;
export const SEVERITY_INFO = 'info' as const;

export const REVIEW_SEVERITIES = Object.freeze([
  SEVERITY_CRITICAL,
  SEVERITY_ERROR,
  SEVERITY_WARNING,
  SEVERITY_SUGGESTION,
  SEVERITY_INFO
] as const);

export type ReviewSeverity = typeof REVIEW_SEVERITIES[number];

// Action Runner Failure Thresholds
export const FAIL_ON_SEVERITY_CRITICAL = 'critical';
export const FAIL_ON_SEVERITY_ERROR = 'error';
export const FAIL_ON_SEVERITY_WARNING = 'warning';
export const FAIL_ON_SEVERITY_NONE = 'none';
export const DEFAULT_FAIL_ON_SEVERITY = FAIL_ON_SEVERITY_ERROR;

// Severity Icons & Headers
export const SEVERITY_ICON_CRITICAL = '🔴' as const;
export const SEVERITY_ICON_ERROR = '🔴' as const;
export const SEVERITY_ICON_WARNING = '⚠️' as const;
export const SEVERITY_ICON_SUGGESTION = '💡' as const;
export const SEVERITY_ICON_INFO = 'ℹ️' as const;

export const SEVERITY_ICONS: Readonly<Record<ReviewSeverity, string>> = Object.freeze({
  [SEVERITY_CRITICAL]: SEVERITY_ICON_CRITICAL,
  [SEVERITY_ERROR]: SEVERITY_ICON_ERROR,
  [SEVERITY_WARNING]: SEVERITY_ICON_WARNING,
  [SEVERITY_SUGGESTION]: SEVERITY_ICON_SUGGESTION,
  [SEVERITY_INFO]: SEVERITY_ICON_INFO
});

export const SEVERITY_HEADERS: Readonly<Record<ReviewSeverity, string>> = Object.freeze({
  [SEVERITY_CRITICAL]: '🔴 **CRITICAL**: ',
  [SEVERITY_ERROR]: '🔴 **ERROR**: ',
  [SEVERITY_WARNING]: '⚠️ **WARNING**: ',
  [SEVERITY_SUGGESTION]: '💡 **SUGGESTION**: ',
  [SEVERITY_INFO]: 'ℹ️ **INFO**: '
});

// Review Verdicts & Tokens
export const VERDICT_APPROVED = 'APPROVED' as const;
export const VERDICT_CHANGES_REQUESTED = 'CHANGES_REQUESTED' as const;

export const REVIEW_VERDICTS = Object.freeze([
  VERDICT_APPROVED,
  VERDICT_CHANGES_REQUESTED
] as const);

export type ReviewVerdictState = typeof REVIEW_VERDICTS[number];

export const TOKEN_REVIEW_STATUS = 'REVIEW_STATUS' as const;
export const TOKEN_REVIEW_SUMMARY = 'REVIEW_SUMMARY' as const;
export const TOKEN_UNFULFILLED_AC = 'UNFULFILLED_AC' as const;
export const TOKEN_REMEDIATION_GUIDANCE = 'REMEDIATION_GUIDANCE' as const;

export const REGEX_REVIEW_STATUS_TOKEN = /^REVIEW_STATUS:\s*(APPROVED|CHANGES_REQUESTED)$/im;
export const REGEX_REVIEW_SUMMARY_TOKEN = /^REVIEW_SUMMARY:\s*(.+)$/im;
export const REGEX_UNFULFILLED_AC_TOKEN = /^UNFULFILLED_AC:\s*(.+)$/im;
export const REGEX_REMEDIATION_GUIDANCE_TOKEN = /^REMEDIATION_GUIDANCE:\s*(.+)$/im;

export const HEADER_REVIEW_VERDICT_REPORT = '=== Critique: Review Verdict Report ===' as const;
export const LABEL_REVIEW_STATUS = 'Review Status' as const;
export const LABEL_REVIEW_SUMMARY = 'Review Summary' as const;
export const LABEL_UNFULFILLED_AC = 'Unfulfilled Acceptance Criteria' as const;
export const LABEL_REMEDIATION_GUIDANCE = 'Remediation Guidance' as const;
export const SECTION_REVIEW_SELF_CORRECTION_TITLE = '### Critique Reviewer Self-Correction Remediation Guidance:' as const;

// Resolver Sources
export const RESOLVER_SOURCE_BUNDLED = 'bundled' as const;
export const RESOLVER_SOURCE_USER_LOCAL = 'user_local' as const;
export const RESOLVER_SOURCE_SYSTEM_PATH = 'system_path' as const;
export const RESOLVER_SOURCE_NONE = 'none' as const;

export const RESOLVER_SOURCES = Object.freeze([
  RESOLVER_SOURCE_BUNDLED,
  RESOLVER_SOURCE_USER_LOCAL,
  RESOLVER_SOURCE_SYSTEM_PATH,
  RESOLVER_SOURCE_NONE
] as const);

export type ResolverSource = typeof RESOLVER_SOURCES[number];

// Environment & Paths
export const ENV_VAR_GEMINI_API_KEY = 'GEMINI_API_KEY' as const;
export const ENV_VAR_GITHUB_TOKEN = 'GITHUB_TOKEN' as const;
export const ENV_FILE_NAME = '.env' as const;

export const PATH_BUNDLED_CRITIQUE_JS = 'bin/critique.js' as const;
export const PATH_USER_LOCAL_CRITIQUE = '.local/bin/critique' as const;
export const PATH_USER_LOCAL_LEGACY = '.local/bin/ai-reviewer' as const;

// Regular Expressions
export const REGEX_ENV_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
export const REGEX_JSON_CODE_BLOCK = /```(?:json)?\s*([\s\S]*?)\s*```/;
export const REGEX_WORKFLOW_PROMPT = /const\s+prompt\s*=\s*`([\s\S]*?)`;/;
export const REGEX_SEVERITY = /^(critical|error|warning|suggestion|info)$/i;
export const REGEX_CONFIDENCE = /^(high|medium|low)$/i;

// Presentation & Output Constants
// In bundled builds, version is injected at build time from package.json via esbuild define.
// In test/non-bundled environments (e.g. Vitest), falls back to reading package.json directly.
declare const __CRITIQUE_VERSION__: string;
export const CRITIQUE_VERSION: string =
  typeof __CRITIQUE_VERSION__ !== 'undefined'
    ? __CRITIQUE_VERSION__
    : (() => {
        try {
          return require('../../package.json').version as string;
        } catch {
          return 'unknown';
        }
      })();
export const EXIT_CODE_SUCCESS = 0 as const;
export const EXIT_CODE_FAILURE = 1 as const;

export const BANNER_REVIEW_TITLE = '# 🤖 Critique: AI Code Review' as const;
export const BANNER_CODE_COMMENTS = '## 📝 Code Comments' as const;
export const BANNER_SUMMARY = '## Summary' as const;
export const MSG_NO_DIFF_FOUND = 'No diff found. Exiting.' as const;
export const MSG_CLEAN_DIFF_REVIEW = 'No uncommitted changes or working tree diff found.' as const;
export const MSG_NO_ISSUES_FOUND = '*No issues found! Great job!* 🚀' as const;
export const MSG_MISSING_API_KEY =
  'Error: GEMINI_API_KEY is not set.\nPlease ensure it is set in ~/.env, .env, or in your environment variables.' as const;
export const MSG_ALL_MODELS_FAILED = 'All candidate Gemini models failed.' as const;
export const DEFAULT_NO_UNRESOLVED_THREADS_TEXT = 'No unresolved previous issues.' as const;

export const AI_SUMMARY_START_MARKER = '<!-- AI_SUMMARY_START -->' as const;
export const AI_SUMMARY_END_MARKER = '<!-- AI_SUMMARY_END -->' as const;
export const AI_SUGGESTION_PREFIX = '🤖 **Critique AI Suggestion**' as const;

// Default System Instructions
export const DEFAULT_CRITIQUE_SYSTEM_INSTRUCTION = `You are Critique, an expert senior software engineer and quality gatekeeper conducting a code review.

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
}` as const;

#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/presentation/critique-cli.ts
var critique_cli_exports = {};
__export(critique_cli_exports, {
  parseCliArguments: () => parseCliArguments,
  printHelp: () => printHelp,
  runCritiqueCli: () => runCritiqueCli
});
module.exports = __toCommonJS(critique_cli_exports);

// src/domain/constants.ts
var MODEL_GEMINI_3_5_FLASH_LITE = "gemini-3.5-flash-lite";
var MODEL_GEMINI_3_5_FLASH = "gemini-3.5-flash";
var MODEL_GEMINI_2_5_FLASH = "gemini-2.5-flash";
var MODEL_GEMINI_2_5_PRO = "gemini-2.5-pro";
var AI_REVIEWER_MODELS = Object.freeze([
  MODEL_GEMINI_3_5_FLASH_LITE,
  MODEL_GEMINI_3_5_FLASH,
  MODEL_GEMINI_2_5_FLASH,
  MODEL_GEMINI_2_5_PRO
]);
var MODEL_COPILOT_GPT_4O = "gpt-4o";
var COPILOT_API_URL = "https://models.inference.ai.azure.com/chat/completions";
var GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
var AI_REVIEWER_DEFAULT_TEMPERATURE = 0.1;
var AI_REVIEWER_DEFAULT_MIME_TYPE = "application/json";
var AI_REVIEWER_DEFAULT_TIMEOUT_MS = 6e4;
var AI_REVIEWER_RETRY_DELAY_MS = 2e3;
var AI_REVIEWER_MAX_DIFF_CHARS = 12e4;
var HTTP_STATUS_OK = 200;
var HTTP_STATUS_TOO_MANY_REQUESTS = 429;
var HTTP_STATUS_SERVICE_UNAVAILABLE = 503;
var STANDARD_CANDIDATE_PATHS = Object.freeze([
  ".github/critique.md",
  ".critique.md",
  ".github/ai-reviewer-standards.md",
  "AGENTS.md",
  "STANDARDS.md",
  "CONTRIBUTING.md"
]);
var CONFIDENCE_HIGH = "High";
var CONFIDENCE_MEDIUM = "Medium";
var CONFIDENCE_LOW = "Low";
var REVIEW_CONFIDENCE_LEVELS = Object.freeze([
  CONFIDENCE_HIGH,
  CONFIDENCE_MEDIUM,
  CONFIDENCE_LOW
]);
var SEVERITY_CRITICAL = "critical";
var SEVERITY_ERROR = "error";
var SEVERITY_WARNING = "warning";
var SEVERITY_SUGGESTION = "suggestion";
var SEVERITY_INFO = "info";
var REVIEW_SEVERITIES = Object.freeze([
  SEVERITY_CRITICAL,
  SEVERITY_ERROR,
  SEVERITY_WARNING,
  SEVERITY_SUGGESTION,
  SEVERITY_INFO
]);
var SEVERITY_ICON_CRITICAL = "\u{1F534}";
var SEVERITY_ICON_ERROR = "\u{1F534}";
var SEVERITY_ICON_WARNING = "\u26A0\uFE0F";
var SEVERITY_ICON_SUGGESTION = "\u{1F4A1}";
var SEVERITY_ICON_INFO = "\u2139\uFE0F";
var SEVERITY_ICONS = Object.freeze({
  [SEVERITY_CRITICAL]: SEVERITY_ICON_CRITICAL,
  [SEVERITY_ERROR]: SEVERITY_ICON_ERROR,
  [SEVERITY_WARNING]: SEVERITY_ICON_WARNING,
  [SEVERITY_SUGGESTION]: SEVERITY_ICON_SUGGESTION,
  [SEVERITY_INFO]: SEVERITY_ICON_INFO
});
var SEVERITY_HEADERS = Object.freeze({
  [SEVERITY_CRITICAL]: "\u{1F534} **CRITICAL**: ",
  [SEVERITY_ERROR]: "\u{1F534} **ERROR**: ",
  [SEVERITY_WARNING]: "\u26A0\uFE0F **WARNING**: ",
  [SEVERITY_SUGGESTION]: "\u{1F4A1} **SUGGESTION**: ",
  [SEVERITY_INFO]: "\u2139\uFE0F **INFO**: "
});
var VERDICT_APPROVED = "APPROVED";
var VERDICT_CHANGES_REQUESTED = "CHANGES_REQUESTED";
var REVIEW_VERDICTS = Object.freeze([
  VERDICT_APPROVED,
  VERDICT_CHANGES_REQUESTED
]);
var RESOLVER_SOURCE_BUNDLED = "bundled";
var RESOLVER_SOURCE_USER_LOCAL = "user_local";
var RESOLVER_SOURCE_SYSTEM_PATH = "system_path";
var RESOLVER_SOURCE_NONE = "none";
var RESOLVER_SOURCES = Object.freeze([
  RESOLVER_SOURCE_BUNDLED,
  RESOLVER_SOURCE_USER_LOCAL,
  RESOLVER_SOURCE_SYSTEM_PATH,
  RESOLVER_SOURCE_NONE
]);
var ENV_VAR_GEMINI_API_KEY = "GEMINI_API_KEY";
var ENV_VAR_GITHUB_TOKEN = "GITHUB_TOKEN";
var ENV_FILE_NAME = ".env";
var REGEX_ENV_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
var REGEX_JSON_CODE_BLOCK = /```(?:json)?\s*([\s\S]*?)\s*```/;
var CRITIQUE_VERSION = "0.1.0";
var EXIT_CODE_SUCCESS = 0;
var EXIT_CODE_FAILURE = 1;
var BANNER_REVIEW_TITLE = "# \u{1F916} Critique: AI Code Review";
var BANNER_CODE_COMMENTS = "## \u{1F4DD} Code Comments";
var BANNER_SUMMARY = "## Summary";
var MSG_CLEAN_DIFF_REVIEW = "No uncommitted changes or working tree diff found.";
var MSG_NO_ISSUES_FOUND = "*No issues found! Great job!* \u{1F680}";
var MSG_MISSING_API_KEY = "Error: GEMINI_API_KEY is not set.\nPlease ensure it is set in ~/.env, .env, or in your environment variables.";
var MSG_ALL_MODELS_FAILED = "All candidate Gemini models failed.";
var DEFAULT_NO_UNRESOLVED_THREADS_TEXT = "No unresolved previous issues.";
var DEFAULT_CRITIQUE_SYSTEM_INSTRUCTION = `You are Critique, an expert senior software engineer and quality gatekeeper conducting a code review.

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

// src/domain/errors.ts
var CritiqueError = class extends Error {
  details;
  constructor(message, details) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var ValidationError = class extends CritiqueError {
  code = "ERR_VALIDATION";
  field;
  value;
  constructor(field, value, reason) {
    super(`Validation failed for field '${field}': ${reason}`, { field, value, reason });
    this.field = field;
    this.value = value;
  }
};
var AiReviewerError = class extends CritiqueError {
  code = "ERR_AI_REVIEWER";
  operation;
  reason;
  constructor(operation, reason, details, cause) {
    const causeMsg = cause instanceof Error ? `: ${cause.message}` : "";
    super(`Critique AI error during '${operation}': ${reason}${causeMsg}`, { operation, reason, ...details });
    this.operation = operation;
    this.reason = reason;
    if (cause) {
      this.cause = cause;
    }
  }
};

// src/domain/value-objects/review-confidence.ts
function normalizeConfidenceLevel(raw) {
  const normalized = raw.trim().toLowerCase();
  if (normalized === CONFIDENCE_HIGH.toLowerCase()) {
    return CONFIDENCE_HIGH;
  }
  if (normalized === CONFIDENCE_MEDIUM.toLowerCase()) {
    return CONFIDENCE_MEDIUM;
  }
  if (normalized === CONFIDENCE_LOW.toLowerCase()) {
    return CONFIDENCE_LOW;
  }
  throw new ValidationError(
    "confidenceLevel",
    raw,
    `Confidence level must be one of: ${REVIEW_CONFIDENCE_LEVELS.join(", ")}.`
  );
}
var ReviewConfidence = class _ReviewConfidence {
  level;
  explanation;
  constructor(level, explanation = "") {
    if (typeof level !== "string" || !level.trim()) {
      throw new ValidationError("confidenceLevel", level, "Confidence level must be a non-empty string.");
    }
    if (typeof explanation !== "string") {
      throw new ValidationError("confidenceExplanation", explanation, "Confidence explanation must be a string.");
    }
    this.level = normalizeConfidenceLevel(level);
    this.explanation = explanation.trim();
    Object.freeze(this);
  }
  isHigh() {
    return this.level === CONFIDENCE_HIGH;
  }
  isMedium() {
    return this.level === CONFIDENCE_MEDIUM;
  }
  isLow() {
    return this.level === CONFIDENCE_LOW;
  }
  equals(other) {
    if (!other) return false;
    return this.level === other.level && this.explanation === other.explanation;
  }
  toString() {
    if (this.explanation) {
      return `${this.level} - ${this.explanation}`;
    }
    return this.level;
  }
  static create(level, explanation = "") {
    return new _ReviewConfidence(level, explanation);
  }
  static high(explanation = "") {
    return new _ReviewConfidence(CONFIDENCE_HIGH, explanation);
  }
  static medium(explanation = "") {
    return new _ReviewConfidence(CONFIDENCE_MEDIUM, explanation);
  }
  static low(explanation = "") {
    return new _ReviewConfidence(CONFIDENCE_LOW, explanation);
  }
  static tryFrom(raw) {
    if (!raw) return null;
    if (raw instanceof _ReviewConfidence) return raw;
    if (typeof raw === "string") {
      try {
        return new _ReviewConfidence(raw);
      } catch {
        return null;
      }
    }
    if (typeof raw === "object" && raw !== null) {
      const candidate = raw;
      const level = candidate.level ?? candidate.confidenceLevel;
      const explanation = candidate.explanation ?? candidate.confidenceExplanation;
      if (typeof level === "string") {
        try {
          return new _ReviewConfidence(level, typeof explanation === "string" ? explanation : "");
        } catch {
          return null;
        }
      }
    }
    return null;
  }
};

// src/domain/value-objects/ai-review-finding.ts
function normalizeSeverity(raw) {
  const lower = raw.trim().toLowerCase();
  for (const s of REVIEW_SEVERITIES) {
    if (lower === s) {
      return s;
    }
  }
  throw new ValidationError(
    "severity",
    raw,
    `Severity must be one of: ${REVIEW_SEVERITIES.join(", ")}.`
  );
}
var AiReviewFinding = class _AiReviewFinding {
  path;
  line;
  severity;
  body;
  constructor(props) {
    if (typeof props.path !== "string" || !props.path.trim()) {
      throw new ValidationError("path", props.path, "Finding file path must be a non-empty string.");
    }
    if (typeof props.line !== "number" || !Number.isSafeInteger(props.line) || props.line < 0) {
      throw new ValidationError("line", props.line, "Finding line must be a non-negative integer.");
    }
    if (typeof props.body !== "string" || !props.body.trim()) {
      throw new ValidationError("body", props.body, "Finding body must be a non-empty string.");
    }
    this.path = props.path.trim();
    this.line = props.line;
    this.severity = normalizeSeverity(props.severity);
    this.body = props.body.trim();
    Object.freeze(this);
  }
  isBlocking() {
    return this.severity === SEVERITY_CRITICAL || this.severity === SEVERITY_ERROR;
  }
  isCritical() {
    return this.severity === SEVERITY_CRITICAL;
  }
  isError() {
    return this.severity === SEVERITY_ERROR || this.severity === SEVERITY_CRITICAL;
  }
  isWarning() {
    return this.severity === SEVERITY_WARNING;
  }
  isSuggestion() {
    return this.severity === SEVERITY_SUGGESTION;
  }
  isInfo() {
    return this.severity === SEVERITY_INFO;
  }
  getIcon() {
    return SEVERITY_ICONS[this.severity] || SEVERITY_ICONS[SEVERITY_INFO];
  }
  getHeader() {
    return SEVERITY_HEADERS[this.severity] || SEVERITY_HEADERS[SEVERITY_INFO];
  }
  formatMarkdown() {
    const icon = this.getIcon();
    const lineStr = this.line > 0 ? ` (Line ${this.line})` : "";
    return `### ${icon} ${this.path}${lineStr}
${this.body}
`;
  }
  equals(other) {
    if (!other) return false;
    return this.path === other.path && this.line === other.line && this.severity === other.severity && this.body === other.body;
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
    return new _AiReviewFinding(props);
  }
  static tryFrom(raw) {
    if (!raw || typeof raw !== "object") return null;
    if (raw instanceof _AiReviewFinding) return raw;
    const candidate = raw;
    if (typeof candidate.path === "string" && typeof candidate.line === "number" && typeof candidate.severity === "string" && typeof candidate.body === "string") {
      try {
        return new _AiReviewFinding({
          path: candidate.path,
          line: candidate.line,
          severity: candidate.severity,
          body: candidate.body
        });
      } catch {
        return null;
      }
    }
    return null;
  }
};

// src/domain/value-objects/ai-review-report.ts
function extractJsonString(rawText) {
  const trimmed = rawText.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }
  const codeBlockMatch = trimmed.match(REGEX_JSON_CODE_BLOCK);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.substring(firstBrace, lastBrace + 1).trim();
  }
  return trimmed;
}
var AiReviewReport = class _AiReviewReport {
  summary;
  confidence;
  findings;
  resolvedThreads;
  bypassed;
  diagnosticMessage;
  rawOutput;
  modelUsed;
  constructor(props) {
    if (typeof props.summary !== "string") {
      throw new ValidationError("summary", props.summary, "Review summary must be a string.");
    }
    if (!(props.confidence instanceof ReviewConfidence)) {
      throw new ValidationError("confidence", props.confidence, "Review confidence must be a ReviewConfidence instance.");
    }
    this.summary = props.summary.trim();
    this.confidence = props.confidence;
    this.findings = Object.freeze([...props.findings || []]);
    this.resolvedThreads = Object.freeze([...props.resolvedThreads || []]);
    this.bypassed = Boolean(props.bypassed);
    this.diagnosticMessage = props.diagnosticMessage;
    this.rawOutput = props.rawOutput;
    this.modelUsed = props.modelUsed;
    Object.freeze(this);
  }
  isPassing() {
    if (this.bypassed) return false;
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
      "====================================",
      BANNER_REVIEW_TITLE,
      "====================================\n",
      `${BANNER_SUMMARY}
${this.summary}
`,
      `**Confidence:** ${this.confidence.toString()}
`
    ];
    if (this.modelUsed) {
      sections.push(`*Evaluated by Google Gemini (${this.modelUsed})*
`);
    }
    if (this.findings.length > 0) {
      sections.push(`${BANNER_CODE_COMMENTS}
`);
      for (const finding of this.findings) {
        sections.push(finding.formatMarkdown());
      }
    } else {
      sections.push(`${BANNER_CODE_COMMENTS}
${MSG_NO_ISSUES_FOUND}
`);
    }
    if (this.diagnosticMessage) {
      sections.push(`
> **Notice:** ${this.diagnosticMessage}
`);
    }
    return sections.join("\n");
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
    return new _AiReviewReport(props);
  }
  static empty(customMessage = MSG_CLEAN_DIFF_REVIEW) {
    return new _AiReviewReport({
      summary: customMessage,
      confidence: ReviewConfidence.high(customMessage),
      findings: [],
      resolvedThreads: [],
      bypassed: false
    });
  }
  static bypassed(reason) {
    return new _AiReviewReport({
      summary: `AI review was bypassed: ${reason}`,
      confidence: ReviewConfidence.low(reason),
      findings: [],
      resolvedThreads: [],
      bypassed: true,
      diagnosticMessage: reason
    });
  }
  static parse(rawText, modelUsed) {
    if (typeof rawText !== "string" || !rawText.trim()) {
      throw new AiReviewerError("parse", "Cannot parse empty review payload.");
    }
    const candidateJson = extractJsonString(rawText);
    let parsed;
    try {
      parsed = JSON.parse(candidateJson);
    } catch (err) {
      throw new AiReviewerError(
        "parse",
        `Failed to parse review JSON response: ${err instanceof Error ? err.message : String(err)}`,
        { rawSnippet: rawText.substring(0, 300) },
        err
      );
    }
    const summary = typeof parsed.summary === "string" ? parsed.summary : "";
    const confidenceLevel = typeof parsed.confidenceLevel === "string" ? parsed.confidenceLevel : "Medium";
    const confidenceExplanation = typeof parsed.confidenceExplanation === "string" ? parsed.confidenceExplanation : "";
    const confidence = ReviewConfidence.create(confidenceLevel, confidenceExplanation);
    const findings = [];
    if (Array.isArray(parsed.comments)) {
      for (const item of parsed.comments) {
        const finding = AiReviewFinding.tryFrom(item);
        if (finding) {
          findings.push(finding);
        }
      }
    }
    const resolvedThreads = [];
    if (Array.isArray(parsed.resolvedThreads)) {
      for (const thread of parsed.resolvedThreads) {
        if (typeof thread === "string") {
          resolvedThreads.push(thread);
        }
      }
    }
    return new _AiReviewReport({
      summary,
      confidence,
      findings,
      resolvedThreads,
      rawOutput: rawText,
      modelUsed
    });
  }
};

// src/infrastructure/process-command-executor.ts
var child_process = __toESM(require("child_process"));
var ProcessCommandExecutor = class {
  async execute(command, options = {}) {
    const cwd = options.cwd || process.cwd();
    const timeoutMs = options.timeoutMs && options.timeoutMs > 0 ? options.timeoutMs : void 0;
    const env = options.env ? { ...process.env, ...options.env } : process.env;
    return new Promise((resolve2) => {
      let stdoutBuffer = "";
      let stderrBuffer = "";
      let timedOut = false;
      let timer = null;
      const proc = child_process.spawn(command, {
        shell: true,
        cwd,
        env,
        detached: process.platform !== "win32"
      });
      if (timeoutMs) {
        timer = setTimeout(() => {
          timedOut = true;
          try {
            if (proc.pid && process.platform !== "win32") {
              process.kill(-proc.pid, "SIGTERM");
            } else {
              proc.kill("SIGTERM");
            }
          } catch {
          }
          const killTimer = setTimeout(() => {
            try {
              if (proc.pid && process.platform !== "win32") {
                process.kill(-proc.pid, "SIGKILL");
              } else {
                proc.kill("SIGKILL");
              }
            } catch {
            }
          }, 500);
          killTimer.unref();
        }, timeoutMs);
      }
      proc.stdout?.on("data", (chunk) => {
        stdoutBuffer += chunk.toString();
      });
      proc.stderr?.on("data", (chunk) => {
        stderrBuffer += chunk.toString();
      });
      proc.on("error", (err) => {
        if (timer) clearTimeout(timer);
        stderrBuffer += `
Process execution error: ${err.message}`;
        resolve2({
          exitCode: 1,
          stdout: stdoutBuffer,
          stderr: stderrBuffer
        });
      });
      proc.on("close", (code) => {
        if (timer) clearTimeout(timer);
        let exitCode = code !== null ? code : 1;
        if (timedOut) {
          exitCode = exitCode !== 0 ? exitCode : 1;
        }
        resolve2({
          exitCode,
          stdout: stdoutBuffer,
          stderr: stderrBuffer
        });
      });
    });
  }
};

// src/infrastructure/standards-resolver.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var StandardsResolver = class {
  resolve(cwd = process.cwd(), customPath) {
    if (customPath) {
      const explicitPath = path.isAbsolute(customPath) ? customPath : path.resolve(cwd, customPath);
      if (fs.existsSync(explicitPath)) {
        try {
          const content = fs.readFileSync(explicitPath, "utf8");
          return { path: explicitPath, content: content.trim() };
        } catch {
          return { path: null, content: null };
        }
      }
    }
    for (const candidate of STANDARD_CANDIDATE_PATHS) {
      const candidatePath = path.resolve(cwd, candidate);
      if (fs.existsSync(candidatePath)) {
        try {
          const stat = fs.statSync(candidatePath);
          if (stat.isFile()) {
            const content = fs.readFileSync(candidatePath, "utf8");
            return {
              path: candidatePath,
              content: content.trim()
            };
          }
        } catch {
        }
      }
    }
    return { path: null, content: null };
  }
};

// src/infrastructure/diff-provider.ts
var EXCLUDE_FLAGS = "':(exclude)*.lock' ':(exclude)*-lock.json' ':(exclude)*.lockb' ':(exclude)*.png' ':(exclude)*.jpg' ':(exclude)*.svg' ':(exclude)*.jar' ':(exclude)*.bin'";
var DiffProvider = class {
  executor;
  constructor(executor = new ProcessCommandExecutor()) {
    this.executor = executor;
  }
  async getDiff(options = {}) {
    const cwd = options.cwd || process.cwd();
    const maxChars = options.maxChars || AI_REVIEWER_MAX_DIFF_CHARS;
    if (options.prNumber) {
      const prRes = await this.executor.execute(`gh pr diff ${options.prNumber}`, { cwd });
      if (prRes.exitCode === 0 && prRes.stdout.trim()) {
        return this.truncate(prRes.stdout, maxChars);
      }
    }
    if (options.staged) {
      const res = await this.executor.execute(`git diff --cached -- . ${EXCLUDE_FLAGS}`, { cwd });
      return this.truncate(res.stdout, maxChars);
    }
    if (options.commitRange) {
      const res = await this.executor.execute(`git diff ${options.commitRange} -- . ${EXCLUDE_FLAGS}`, { cwd });
      return this.truncate(res.stdout, maxChars);
    }
    if (options.baseRef) {
      const res = await this.executor.execute(`git diff ${options.baseRef}...HEAD -- . ${EXCLUDE_FLAGS}`, { cwd });
      return this.truncate(res.stdout, maxChars);
    }
    const headRes = await this.executor.execute(`git diff HEAD -- . ${EXCLUDE_FLAGS}`, { cwd });
    if (headRes.stdout.trim()) {
      return this.truncate(headRes.stdout, maxChars);
    }
    const originMainRes = await this.executor.execute(`git diff origin/main...HEAD -- . ${EXCLUDE_FLAGS}`, { cwd });
    if (originMainRes.exitCode === 0 && originMainRes.stdout.trim()) {
      return this.truncate(originMainRes.stdout, maxChars);
    }
    const originMasterRes = await this.executor.execute(`git diff origin/master...HEAD -- . ${EXCLUDE_FLAGS}`, { cwd });
    if (originMasterRes.exitCode === 0 && originMasterRes.stdout.trim()) {
      return this.truncate(originMasterRes.stdout, maxChars);
    }
    return "";
  }
  truncate(diffText, maxChars) {
    const trimmed = diffText.trim();
    if (trimmed.length > maxChars) {
      return `${trimmed.substring(0, maxChars)}

[Diff truncated due to size limit of ${maxChars} chars]`;
    }
    return trimmed;
  }
};

// src/infrastructure/gemini-client.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var os = __toESM(require("os"));
function loadEnvironmentFile(filePath) {
  const envMap = {};
  if (!fs2.existsSync(filePath)) {
    return envMap;
  }
  try {
    const content = fs2.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    for (const line of lines) {
      const match = line.match(REGEX_ENV_KEY_VAL);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.length > 0 && val.startsWith('"') && val.endsWith('"')) {
          val = val.replace(/\\n/g, "\n");
        }
        val = val.replace(/(^['"]|['"]$)/g, "").trim();
        envMap[key] = val;
      }
    }
  } catch {
  }
  return envMap;
}
function resolveGeminiApiKey(cwd, explicitEnv) {
  if (explicitEnv && explicitEnv[ENV_VAR_GEMINI_API_KEY]) {
    return explicitEnv[ENV_VAR_GEMINI_API_KEY];
  }
  if (process.env[ENV_VAR_GEMINI_API_KEY]) {
    return process.env[ENV_VAR_GEMINI_API_KEY];
  }
  const localEnvPath = path2.join(cwd || process.cwd(), ENV_FILE_NAME);
  const localEnv = loadEnvironmentFile(localEnvPath);
  if (localEnv[ENV_VAR_GEMINI_API_KEY]) {
    return localEnv[ENV_VAR_GEMINI_API_KEY];
  }
  const homeEnvPath = path2.join(os.homedir(), ENV_FILE_NAME);
  const homeEnv = loadEnvironmentFile(homeEnvPath);
  if (homeEnv[ENV_VAR_GEMINI_API_KEY]) {
    return homeEnv[ENV_VAR_GEMINI_API_KEY];
  }
  return null;
}
function resolveGitHubToken(cwd, explicitEnv) {
  if (explicitEnv && explicitEnv[ENV_VAR_GITHUB_TOKEN]) {
    return explicitEnv[ENV_VAR_GITHUB_TOKEN];
  }
  if (process.env[ENV_VAR_GITHUB_TOKEN]) {
    return process.env[ENV_VAR_GITHUB_TOKEN];
  }
  const localEnvPath = path2.join(cwd || process.cwd(), ENV_FILE_NAME);
  const localEnv = loadEnvironmentFile(localEnvPath);
  if (localEnv[ENV_VAR_GITHUB_TOKEN]) {
    return localEnv[ENV_VAR_GITHUB_TOKEN];
  }
  const homeEnvPath = path2.join(os.homedir(), ENV_FILE_NAME);
  const homeEnv = loadEnvironmentFile(homeEnvPath);
  if (homeEnv[ENV_VAR_GITHUB_TOKEN]) {
    return homeEnv[ENV_VAR_GITHUB_TOKEN];
  }
  return null;
}
var GeminiClient = class {
  fetchClient;
  sleep;
  constructor(dependencies = {}) {
    this.fetchClient = dependencies.fetchFn || globalThis.fetch;
    this.sleep = dependencies.sleepFn || ((ms) => new Promise((resolve2) => setTimeout(resolve2, ms)));
  }
  async query(prompt, apiKey, options = {}) {
    const timeoutMs = options.timeoutMs || AI_REVIEWER_DEFAULT_TIMEOUT_MS;
    for (let i = 0; i < AI_REVIEWER_MODELS.length; i++) {
      const model = AI_REVIEWER_MODELS[i];
      const url = `${GEMINI_API_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await this.fetchClient(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: AI_REVIEWER_DEFAULT_TEMPERATURE,
              responseMimeType: AI_REVIEWER_DEFAULT_MIME_TYPE
            }
          }),
          signal: controller.signal
        });
        clearTimeout(timer);
        if (response.status === HTTP_STATUS_OK) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return { text: text.trim(), modelUsed: model };
          }
        }
        if (response.status === HTTP_STATUS_SERVICE_UNAVAILABLE && i < AI_REVIEWER_MODELS.length - 1) {
          await this.sleep(AI_REVIEWER_RETRY_DELAY_MS);
          continue;
        }
        if (response.status === HTTP_STATUS_TOO_MANY_REQUESTS) {
        }
      } catch {
        clearTimeout(timer);
      }
    }
    if (options.githubTokenFallback) {
      try {
        const copilotResult = await this.queryCopilotFallback(prompt, options.githubTokenFallback, timeoutMs);
        if (copilotResult) {
          return copilotResult;
        }
      } catch {
      }
    }
    throw new AiReviewerError("queryGemini", MSG_ALL_MODELS_FAILED);
  }
  async queryCopilotFallback(prompt, githubToken, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await this.fetchClient(COPILOT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${githubToken}`
        },
        body: JSON.stringify({
          model: MODEL_COPILOT_GPT_4O,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: AI_REVIEWER_DEFAULT_TEMPERATURE,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (response.status === HTTP_STATUS_OK) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          return { text: text.trim(), modelUsed: `GitHub Models (${MODEL_COPILOT_GPT_4O})` };
        }
      }
    } catch {
      clearTimeout(timer);
    }
    return null;
  }
};

// src/application/run-critique.ts
function buildCritiquePrompt(diffText, standardsContent, previousThreadsText) {
  const parts = [DEFAULT_CRITIQUE_SYSTEM_INSTRUCTION];
  if (standardsContent && standardsContent.trim()) {
    parts.push(`
Repository Standards & Guidelines to Enforce:
\`\`\`markdown
${standardsContent.trim()}
\`\`\``);
  }
  if (previousThreadsText && previousThreadsText.trim()) {
    parts.push(`
Unresolved previous AI review threads on this PR:
\`\`\`json
${previousThreadsText.trim()}
\`\`\``);
  } else {
    parts.push(`
Unresolved previous reviews:
${DEFAULT_NO_UNRESOLVED_THREADS_TEXT}`);
  }
  parts.push(`
Here is the git diff of the changes to review:
\`\`\`diff
${diffText}
\`\`\``);
  return parts.join("\n");
}
async function runCritiqueEngine(options = {}, dependencies = {}) {
  if (options.bypass) {
    return AiReviewReport.bypassed("Bypassed by option");
  }
  const apiKey = resolveGeminiApiKey(options.cwd, options.env);
  if (!apiKey) {
    return AiReviewReport.bypassed(MSG_MISSING_API_KEY);
  }
  const executor = dependencies.commandExecutor || new ProcessCommandExecutor();
  const diffProvider = dependencies.diffProvider || new DiffProvider(executor);
  const standardsResolver = dependencies.standardsResolver || new StandardsResolver();
  const geminiClient = dependencies.geminiClient || new GeminiClient({
    fetchFn: dependencies.fetchFn,
    sleepFn: dependencies.sleepFn,
    timeoutMs: options.timeoutMs
  });
  const cwd = options.cwd || process.cwd();
  const diffText = await diffProvider.getDiff({
    cwd,
    staged: options.staged,
    baseRef: options.baseRef,
    prNumber: options.prNumber
  });
  if (!diffText || !diffText.trim()) {
    return AiReviewReport.empty(MSG_CLEAN_DIFF_REVIEW);
  }
  const standardsResult = standardsResolver.resolve(cwd, options.standardsPath);
  const prompt = buildCritiquePrompt(diffText, standardsResult.content);
  const githubToken = resolveGitHubToken(cwd, options.env);
  const queryResult = await geminiClient.query(prompt, apiKey, {
    timeoutMs: options.timeoutMs,
    githubTokenFallback: githubToken
  });
  return AiReviewReport.parse(queryResult.text, queryResult.modelUsed);
}

// src/presentation/critique-cli.ts
function parseCliArguments(argv) {
  const args = argv.slice(2);
  let staged = false;
  let baseRef;
  let prNumber;
  let commitRange;
  let json = false;
  let help = false;
  let version = false;
  let strict = false;
  let timeoutMs;
  let standardsPath;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--staged" || arg === "-s") {
      staged = true;
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "--help" || arg === "-h") {
      help = true;
    } else if (arg === "--version" || arg === "-v") {
      version = true;
    } else if (arg === "--strict") {
      strict = true;
    } else if ((arg === "--base" || arg === "-b") && i + 1 < args.length) {
      baseRef = args[++i];
    } else if ((arg === "--pr" || arg === "-p") && i + 1 < args.length) {
      const parsed = parseInt(args[++i], 10);
      if (Number.isSafeInteger(parsed) && parsed > 0) {
        prNumber = parsed;
      }
    } else if ((arg === "--commit" || arg === "-c") && i + 1 < args.length) {
      commitRange = args[++i];
    } else if (arg === "--standards" && i + 1 < args.length) {
      standardsPath = args[++i];
    } else if (arg === "--timeout" && i + 1 < args.length) {
      const parsed = parseInt(args[++i], 10);
      if (Number.isSafeInteger(parsed) && parsed > 0) {
        timeoutMs = parsed;
      }
    }
  }
  return {
    staged,
    baseRef,
    prNumber,
    commitRange,
    json,
    help,
    version,
    strict,
    timeoutMs,
    standardsPath
  };
}
function printHelp() {
  console.log(`
critique - Standalone AI Code Reviewer & PR Quality Gatekeeper v${CRITIQUE_VERSION}

Usage:
  critique [options]

Options:
  -s, --staged           Review staged changes only (git diff --cached)
  -b, --base <ref>       Review changes against a base branch/commit (git diff <ref>...HEAD)
  -p, --pr <number>      Review a pull request by number (via 'gh pr diff')
  -c, --commit <range>   Review changes within a git commit range (e.g. HEAD~1..HEAD)
      --standards <path> Custom path to markdown review standards document
      --strict           Exit with code 1 if blocking review issues (critical/error) exist
      --json             Output review results in structured JSON format
      --timeout <ms>     Request timeout in milliseconds (default: 60000)
  -v, --version          Show version number and exit
  -h, --help             Show this help message and exit

Standards File Cascade:
  Critique automatically discovers repository rules in the following order:
  1. .github/critique.md
  2. .critique.md
  3. .github/ai-reviewer-standards.md
  4. AGENTS.md
  5. STANDARDS.md
  6. CONTRIBUTING.md

Environment:
  GEMINI_API_KEY         Google Gemini API Key (resolved from env, ./.env, or ~/.env)
  GITHUB_TOKEN           GitHub Personal Access Token (for Copilot fallback or gh CLI)
`);
}
async function runCritiqueCli(argv = process.argv) {
  const parsedArgs = parseCliArguments(argv);
  if (parsedArgs.help) {
    printHelp();
    return EXIT_CODE_SUCCESS;
  }
  if (parsedArgs.version) {
    console.log(`critique v${CRITIQUE_VERSION}`);
    return EXIT_CODE_SUCCESS;
  }
  try {
    const report = await runCritiqueEngine({
      staged: parsedArgs.staged,
      baseRef: parsedArgs.baseRef,
      prNumber: parsedArgs.prNumber,
      timeoutMs: parsedArgs.timeoutMs,
      standardsPath: parsedArgs.standardsPath,
      strict: parsedArgs.strict
    });
    if (parsedArgs.json) {
      console.log(JSON.stringify(report.toJSON(), null, 2));
    } else {
      console.log(report.formatMarkdownReport());
    }
    if (parsedArgs.strict && report.hasBlockingIssues()) {
      return EXIT_CODE_FAILURE;
    }
    return EXIT_CODE_SUCCESS;
  } catch (err) {
    console.error("critique error:", err instanceof Error ? err.message : String(err));
    return EXIT_CODE_FAILURE;
  }
}
if (require.main === module) {
  runCritiqueCli().then((code) => {
    if (code !== 0) {
      process.exit(code);
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseCliArguments,
  printHelp,
  runCritiqueCli
});
//# sourceMappingURL=critique.js.map

"use strict";
/**
 * critique - RunCritique Application Service
 *
 * Coordinates standards discovery, diff generation, prompt assembly,
 * Gemini API querying with model fallback cascade, and report parsing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCritiquePrompt = buildCritiquePrompt;
exports.runCritiqueEngine = runCritiqueEngine;
const constants_1 = require("../domain/constants");
const ai_review_report_1 = require("../domain/value-objects/ai-review-report");
const process_command_executor_1 = require("../infrastructure/process-command-executor");
const standards_resolver_1 = require("../infrastructure/standards-resolver");
const diff_provider_1 = require("../infrastructure/diff-provider");
const gemini_client_1 = require("../infrastructure/gemini-client");
function buildCritiquePrompt(diffText, standardsContent, previousThreadsText) {
    const parts = [constants_1.DEFAULT_CRITIQUE_SYSTEM_INSTRUCTION];
    if (standardsContent && standardsContent.trim()) {
        parts.push(`\nRepository Standards & Guidelines to Enforce:\n\`\`\`markdown\n${standardsContent.trim()}\n\`\`\``);
    }
    if (previousThreadsText && previousThreadsText.trim()) {
        parts.push(`\nUnresolved previous AI review threads on this PR:\n\`\`\`json\n${previousThreadsText.trim()}\n\`\`\``);
    }
    else {
        parts.push(`\nUnresolved previous reviews:\n${constants_1.DEFAULT_NO_UNRESOLVED_THREADS_TEXT}`);
    }
    parts.push(`\nHere is the git diff of the changes to review:\n\`\`\`diff\n${diffText}\n\`\`\``);
    return parts.join('\n');
}
async function runCritiqueEngine(options = {}, dependencies = {}) {
    if (options.bypass) {
        return ai_review_report_1.AiReviewReport.bypassed('Bypassed by option');
    }
    const apiKey = (0, gemini_client_1.resolveGeminiApiKey)(options.cwd, options.env);
    if (!apiKey) {
        return ai_review_report_1.AiReviewReport.bypassed(constants_1.MSG_MISSING_API_KEY);
    }
    const executor = dependencies.commandExecutor || new process_command_executor_1.ProcessCommandExecutor();
    const diffProvider = dependencies.diffProvider || new diff_provider_1.DiffProvider(executor);
    const standardsResolver = dependencies.standardsResolver || new standards_resolver_1.StandardsResolver();
    const geminiClient = dependencies.geminiClient ||
        new gemini_client_1.GeminiClient({
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
        return ai_review_report_1.AiReviewReport.empty(constants_1.MSG_CLEAN_DIFF_REVIEW);
    }
    const standardsResult = standardsResolver.resolve(cwd, options.standardsPath);
    const prompt = buildCritiquePrompt(diffText, standardsResult.content);
    const githubToken = (0, gemini_client_1.resolveGitHubToken)(cwd, options.env);
    const queryResult = await geminiClient.query(prompt, apiKey, {
        timeoutMs: options.timeoutMs,
        githubTokenFallback: githubToken
    });
    return ai_review_report_1.AiReviewReport.parse(queryResult.text, queryResult.modelUsed);
}
//# sourceMappingURL=run-critique.js.map
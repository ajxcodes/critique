/**
 * critique - RunCritique Application Service
 *
 * Coordinates standards discovery, diff generation, prompt assembly,
 * Gemini API querying with model fallback cascade, and report parsing.
 */

import {
  DEFAULT_CRITIQUE_SYSTEM_INSTRUCTION,
  DEFAULT_NO_UNRESOLVED_THREADS_TEXT,
  MSG_MISSING_API_KEY,
  MSG_CLEAN_DIFF_REVIEW
} from '../domain/constants';
import { AiReviewReport } from '../domain/value-objects/ai-review-report';
import { AiReviewOptions } from '../ports/ai-reviewer';
import { CommandExecutorPort } from '../ports/command-executor';
import { ProcessCommandExecutor } from '../infrastructure/process-command-executor';
import { StandardsResolver } from '../infrastructure/standards-resolver';
import { DiffProvider } from '../infrastructure/diff-provider';
import {
  GeminiClient,
  resolveGeminiApiKey,
  resolveGitHubToken
} from '../infrastructure/gemini-client';

export interface CritiqueEngineDependencies {
  readonly commandExecutor?: CommandExecutorPort;
  readonly standardsResolver?: StandardsResolver;
  readonly diffProvider?: DiffProvider;
  readonly geminiClient?: GeminiClient;
  readonly fetchFn?: typeof fetch;
  readonly sleepFn?: (ms: number) => Promise<void>;
}

export function buildCritiquePrompt(
  diffText: string,
  standardsContent?: string | null,
  previousThreadsText?: string | null
): string {
  const parts: string[] = [DEFAULT_CRITIQUE_SYSTEM_INSTRUCTION];

  if (standardsContent && standardsContent.trim()) {
    parts.push(`\nRepository Standards & Guidelines to Enforce:\n\`\`\`markdown\n${standardsContent.trim()}\n\`\`\``);
  }

  if (previousThreadsText && previousThreadsText.trim()) {
    parts.push(`\nUnresolved previous AI review threads on this PR:\n\`\`\`json\n${previousThreadsText.trim()}\n\`\`\``);
  } else {
    parts.push(`\nUnresolved previous reviews:\n${DEFAULT_NO_UNRESOLVED_THREADS_TEXT}`);
  }

  parts.push(`\nHere is the git diff of the changes to review:\n\`\`\`diff\n${diffText}\n\`\`\``);

  return parts.join('\n');
}

export async function runCritiqueEngine(
  options: AiReviewOptions = {},
  dependencies: CritiqueEngineDependencies = {}
): Promise<AiReviewReport> {
  if (options.bypass) {
    return AiReviewReport.bypassed('Bypassed by option');
  }

  const apiKey = resolveGeminiApiKey(options.cwd, options.env);
  if (!apiKey) {
    return AiReviewReport.bypassed(MSG_MISSING_API_KEY);
  }

  const executor = dependencies.commandExecutor || new ProcessCommandExecutor();
  const diffProvider = dependencies.diffProvider || new DiffProvider(executor);
  const standardsResolver = dependencies.standardsResolver || new StandardsResolver();
  const geminiClient =
    dependencies.geminiClient ||
    new GeminiClient({
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

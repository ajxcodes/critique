/**
 * critique - GeminiClient (Infrastructure Layer)
 *
 * Handles Gemini REST API queries with automatic model fallback cascade:
 * gemini-3.5-flash-lite -> gemini-3.5-flash -> gemini-2.5-flash -> gemini-2.5-pro
 * Supports retry on 503, environment .env resolution, and secondary GitHub Copilot fallback.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  AI_REVIEWER_MODELS,
  AI_REVIEWER_DEFAULT_TEMPERATURE,
  AI_REVIEWER_DEFAULT_MIME_TYPE,
  AI_REVIEWER_DEFAULT_TIMEOUT_MS,
  AI_REVIEWER_RETRY_DELAY_MS,
  GEMINI_API_BASE_URL,
  COPILOT_API_URL,
  MODEL_COPILOT_GPT_4O,
  HTTP_STATUS_OK,
  HTTP_STATUS_TOO_MANY_REQUESTS,
  HTTP_STATUS_SERVICE_UNAVAILABLE,
  ENV_FILE_NAME,
  ENV_VAR_GEMINI_API_KEY,
  ENV_VAR_GITHUB_TOKEN,
  REGEX_ENV_KEY_VAL,
  MSG_ALL_MODELS_FAILED
} from '../domain/constants';
import { AiReviewerError } from '../domain/errors';

export interface GeminiClientDependencies {
  readonly fetchFn?: typeof fetch;
  readonly sleepFn?: (ms: number) => Promise<void>;
  readonly timeoutMs?: number;
}

export function loadEnvironmentFile(filePath: string): Record<string, string> {
  const envMap: Record<string, string> = {};
  if (!fs.existsSync(filePath)) {
    return envMap;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(REGEX_ENV_KEY_VAL);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.length > 0 && val.startsWith('"') && val.endsWith('"')) {
          val = val.replace(/\\n/g, '\n');
        }
        val = val.replace(/(^['"]|['"]$)/g, '').trim();
        envMap[key] = val;
      }
    }
  } catch {
    // Ignore read or parse errors from malformed env files
  }

  return envMap;
}

export function resolveGeminiApiKey(
  cwd?: string,
  explicitEnv?: Readonly<Record<string, string | undefined>>
): string | null {
  if (explicitEnv && explicitEnv[ENV_VAR_GEMINI_API_KEY]) {
    return explicitEnv[ENV_VAR_GEMINI_API_KEY]!;
  }
  if (process.env[ENV_VAR_GEMINI_API_KEY]) {
    return process.env[ENV_VAR_GEMINI_API_KEY]!;
  }

  // Check ./.env in workspace
  const localEnvPath = path.join(cwd || process.cwd(), ENV_FILE_NAME);
  const localEnv = loadEnvironmentFile(localEnvPath);
  if (localEnv[ENV_VAR_GEMINI_API_KEY]) {
    return localEnv[ENV_VAR_GEMINI_API_KEY];
  }

  // Check ~/.env in home directory
  const homeEnvPath = path.join(os.homedir(), ENV_FILE_NAME);
  const homeEnv = loadEnvironmentFile(homeEnvPath);
  if (homeEnv[ENV_VAR_GEMINI_API_KEY]) {
    return homeEnv[ENV_VAR_GEMINI_API_KEY];
  }

  return null;
}

export function resolveGitHubToken(
  cwd?: string,
  explicitEnv?: Readonly<Record<string, string | undefined>>
): string | null {
  if (explicitEnv && explicitEnv[ENV_VAR_GITHUB_TOKEN]) {
    return explicitEnv[ENV_VAR_GITHUB_TOKEN]!;
  }
  if (process.env[ENV_VAR_GITHUB_TOKEN]) {
    return process.env[ENV_VAR_GITHUB_TOKEN]!;
  }

  const localEnvPath = path.join(cwd || process.cwd(), ENV_FILE_NAME);
  const localEnv = loadEnvironmentFile(localEnvPath);
  if (localEnv[ENV_VAR_GITHUB_TOKEN]) {
    return localEnv[ENV_VAR_GITHUB_TOKEN];
  }

  const homeEnvPath = path.join(os.homedir(), ENV_FILE_NAME);
  const homeEnv = loadEnvironmentFile(homeEnvPath);
  if (homeEnv[ENV_VAR_GITHUB_TOKEN]) {
    return homeEnv[ENV_VAR_GITHUB_TOKEN];
  }

  return null;
}

export interface GeminiQueryResult {
  readonly text: string;
  readonly modelUsed: string;
}

export class GeminiClient {
  private readonly fetchClient: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(dependencies: GeminiClientDependencies = {}) {
    this.fetchClient = dependencies.fetchFn || globalThis.fetch;
    this.sleep = dependencies.sleepFn || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  }

  public async query(
    prompt: string,
    apiKey: string,
    options: { timeoutMs?: number; githubTokenFallback?: string | null } = {}
  ): Promise<GeminiQueryResult> {
    const timeoutMs = options.timeoutMs || AI_REVIEWER_DEFAULT_TIMEOUT_MS;

    for (let i = 0; i < AI_REVIEWER_MODELS.length; i++) {
      const model = AI_REVIEWER_MODELS[i];
      const url = `${GEMINI_API_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await this.fetchClient(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
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
          const data = (await response.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
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
          // Fall through to next model or copilot
        }
      } catch {
        clearTimeout(timer);
        // Try next candidate model
      }
    }

    // Secondary fallback: GitHub Models API (Copilot) if token provided
    if (options.githubTokenFallback) {
      try {
        const copilotResult = await this.queryCopilotFallback(prompt, options.githubTokenFallback, timeoutMs);
        if (copilotResult) {
          return copilotResult;
        }
      } catch {
        // Fallback failed
      }
    }

    throw new AiReviewerError('queryGemini', MSG_ALL_MODELS_FAILED);
  }

  private async queryCopilotFallback(
    prompt: string,
    githubToken: string,
    timeoutMs: number
  ): Promise<GeminiQueryResult | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await this.fetchClient(COPILOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${githubToken}`
        },
        body: JSON.stringify({
          model: MODEL_COPILOT_GPT_4O,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: AI_REVIEWER_DEFAULT_TEMPERATURE,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (response.status === HTTP_STATUS_OK) {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
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
}

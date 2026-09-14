"use strict";
/**
 * critique - GeminiClient (Infrastructure Layer)
 *
 * Handles Gemini REST API queries with automatic model fallback cascade:
 * gemini-3.5-flash-lite -> gemini-3.5-flash -> gemini-2.5-flash -> gemini-2.5-pro
 * Supports retry on 503, environment .env resolution, and secondary GitHub Copilot fallback.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiClient = void 0;
exports.loadEnvironmentFile = loadEnvironmentFile;
exports.resolveGeminiApiKey = resolveGeminiApiKey;
exports.resolveGitHubToken = resolveGitHubToken;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const constants_1 = require("../domain/constants");
const errors_1 = require("../domain/errors");
function loadEnvironmentFile(filePath) {
    const envMap = {};
    if (!fs.existsSync(filePath)) {
        return envMap;
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
            const match = line.match(constants_1.REGEX_ENV_KEY_VAL);
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
    }
    catch {
        // Ignore read or parse errors from malformed env files
    }
    return envMap;
}
function resolveGeminiApiKey(cwd, explicitEnv) {
    if (explicitEnv && explicitEnv[constants_1.ENV_VAR_GEMINI_API_KEY]) {
        return explicitEnv[constants_1.ENV_VAR_GEMINI_API_KEY];
    }
    if (process.env[constants_1.ENV_VAR_GEMINI_API_KEY]) {
        return process.env[constants_1.ENV_VAR_GEMINI_API_KEY];
    }
    // Check ./.env in workspace
    const localEnvPath = path.join(cwd || process.cwd(), constants_1.ENV_FILE_NAME);
    const localEnv = loadEnvironmentFile(localEnvPath);
    if (localEnv[constants_1.ENV_VAR_GEMINI_API_KEY]) {
        return localEnv[constants_1.ENV_VAR_GEMINI_API_KEY];
    }
    // Check ~/.env in home directory
    const homeEnvPath = path.join(os.homedir(), constants_1.ENV_FILE_NAME);
    const homeEnv = loadEnvironmentFile(homeEnvPath);
    if (homeEnv[constants_1.ENV_VAR_GEMINI_API_KEY]) {
        return homeEnv[constants_1.ENV_VAR_GEMINI_API_KEY];
    }
    return null;
}
function resolveGitHubToken(cwd, explicitEnv) {
    if (explicitEnv && explicitEnv[constants_1.ENV_VAR_GITHUB_TOKEN]) {
        return explicitEnv[constants_1.ENV_VAR_GITHUB_TOKEN];
    }
    if (process.env[constants_1.ENV_VAR_GITHUB_TOKEN]) {
        return process.env[constants_1.ENV_VAR_GITHUB_TOKEN];
    }
    const localEnvPath = path.join(cwd || process.cwd(), constants_1.ENV_FILE_NAME);
    const localEnv = loadEnvironmentFile(localEnvPath);
    if (localEnv[constants_1.ENV_VAR_GITHUB_TOKEN]) {
        return localEnv[constants_1.ENV_VAR_GITHUB_TOKEN];
    }
    const homeEnvPath = path.join(os.homedir(), constants_1.ENV_FILE_NAME);
    const homeEnv = loadEnvironmentFile(homeEnvPath);
    if (homeEnv[constants_1.ENV_VAR_GITHUB_TOKEN]) {
        return homeEnv[constants_1.ENV_VAR_GITHUB_TOKEN];
    }
    return null;
}
class GeminiClient {
    fetchClient;
    sleep;
    constructor(dependencies = {}) {
        this.fetchClient = dependencies.fetchFn || globalThis.fetch;
        this.sleep = dependencies.sleepFn || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    }
    async query(prompt, apiKey, options = {}) {
        const timeoutMs = options.timeoutMs || constants_1.AI_REVIEWER_DEFAULT_TIMEOUT_MS;
        for (let i = 0; i < constants_1.AI_REVIEWER_MODELS.length; i++) {
            const model = constants_1.AI_REVIEWER_MODELS[i];
            const url = `${constants_1.GEMINI_API_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
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
                            temperature: constants_1.AI_REVIEWER_DEFAULT_TEMPERATURE,
                            responseMimeType: constants_1.AI_REVIEWER_DEFAULT_MIME_TYPE
                        }
                    }),
                    signal: controller.signal
                });
                clearTimeout(timer);
                if (response.status === constants_1.HTTP_STATUS_OK) {
                    const data = (await response.json());
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        return { text: text.trim(), modelUsed: model };
                    }
                }
                if (response.status === constants_1.HTTP_STATUS_SERVICE_UNAVAILABLE && i < constants_1.AI_REVIEWER_MODELS.length - 1) {
                    await this.sleep(constants_1.AI_REVIEWER_RETRY_DELAY_MS);
                    continue;
                }
                if (response.status === constants_1.HTTP_STATUS_TOO_MANY_REQUESTS) {
                    // Fall through to next model or copilot
                }
            }
            catch {
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
            }
            catch {
                // Fallback failed
            }
        }
        throw new errors_1.AiReviewerError('queryGemini', constants_1.MSG_ALL_MODELS_FAILED);
    }
    async queryCopilotFallback(prompt, githubToken, timeoutMs) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await this.fetchClient(constants_1.COPILOT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${githubToken}`
                },
                body: JSON.stringify({
                    model: constants_1.MODEL_COPILOT_GPT_4O,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: constants_1.AI_REVIEWER_DEFAULT_TEMPERATURE,
                    response_format: { type: 'json_object' }
                }),
                signal: controller.signal
            });
            clearTimeout(timer);
            if (response.status === constants_1.HTTP_STATUS_OK) {
                const data = (await response.json());
                const text = data?.choices?.[0]?.message?.content;
                if (text) {
                    return { text: text.trim(), modelUsed: `GitHub Models (${constants_1.MODEL_COPILOT_GPT_4O})` };
                }
            }
        }
        catch {
            clearTimeout(timer);
        }
        return null;
    }
}
exports.GeminiClient = GeminiClient;
//# sourceMappingURL=gemini-client.js.map
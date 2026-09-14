"use strict";
/**
 * critique - GitHubActionsAdapter (Infrastructure Layer)
 *
 * Implements GitHubClientPort using @actions/github Octokit SDK.
 * Manages PR description updates, GraphQL review thread resolution,
 * and inline/summary review comments.
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
exports.GitHubActionsAdapter = void 0;
const github = __importStar(require("@actions/github"));
const errors_1 = require("../domain/errors");
const constants_1 = require("../domain/constants");
class GitHubActionsAdapter {
    octokit;
    owner;
    repo;
    constructor(token, context) {
        this.octokit = github.getOctokit(token);
        this.owner = context?.owner || github.context.repo.owner;
        this.repo = context?.repo || github.context.repo.repo;
    }
    async getPullRequest(prNumber) {
        try {
            const { data: pr } = await this.octokit.rest.pulls.get({
                owner: this.owner,
                repo: this.repo,
                pull_number: prNumber
            });
            return {
                title: pr.title || '',
                body: pr.body || '',
                headSha: pr.head.sha,
                baseRef: pr.base.ref
            };
        }
        catch (err) {
            throw new errors_1.GitHubApiError('getPullRequest', { prNumber }, err);
        }
    }
    async getUnresolvedThreads(prNumber) {
        const threadQuery = `
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {
            reviewThreads(first: 100) {
              nodes {
                id
                isResolved
                path
                line
                originalLine
                comments(first: 50) {
                  nodes {
                    id
                    body
                    author {
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
        try {
            const response = await this.octokit.graphql(threadQuery, {
                owner: this.owner,
                repo: this.repo,
                number: prNumber
            });
            const unresolved = [];
            const threads = response.repository?.pullRequest?.reviewThreads?.nodes || [];
            for (const thread of threads) {
                if (!thread.isResolved) {
                    const botComment = thread.comments?.nodes?.find((c) => c.body.includes('Critique AI Suggestion') ||
                        c.body.includes('Antigravity AI Suggestion') ||
                        c.body.includes('Powered by Google Gemini') ||
                        c.author?.login?.includes('github-actions'));
                    if (botComment) {
                        unresolved.push({
                            threadId: thread.id,
                            path: thread.path,
                            line: thread.line || thread.originalLine || 'unknown',
                            body: botComment.body
                        });
                    }
                }
            }
            return Object.freeze(unresolved);
        }
        catch (_err) {
            // Don't fail the whole run if GraphQL threads cannot be queried
            return Object.freeze([]);
        }
    }
    async resolveThread(threadId) {
        const mutation = `
      mutation($threadId: ID!) {
        resolveReviewThread(input: { threadId: $threadId }) {
          thread {
            id
            isResolved
          }
        }
      }
    `;
        try {
            await this.octokit.graphql(mutation, { threadId });
            return true;
        }
        catch {
            return false;
        }
    }
    async createReviewComment(prNumber, comment) {
        try {
            await this.octokit.rest.pulls.createReviewComment({
                owner: this.owner,
                repo: this.repo,
                pull_number: prNumber,
                commit_id: comment.commitId,
                path: comment.path,
                line: comment.line,
                side: 'RIGHT',
                body: comment.body
            });
            return true;
        }
        catch (_err) {
            // Fallback to issue comment when line is outside PR diff hunk
            try {
                await this.octokit.rest.issues.createComment({
                    owner: this.owner,
                    repo: this.repo,
                    issue_number: prNumber,
                    body: `**Review feedback on \`${comment.path}\` (Line ${comment.line}):**\n\n${comment.body}`
                });
                return true;
            }
            catch {
                return false;
            }
        }
    }
    async createIssueComment(issueOrPrNumber, body) {
        try {
            await this.octokit.rest.issues.createComment({
                owner: this.owner,
                repo: this.repo,
                issue_number: issueOrPrNumber,
                body
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async updatePullRequestBody(prNumber, summaryMarkdown) {
        try {
            const { data: pr } = await this.octokit.rest.pulls.get({
                owner: this.owner,
                repo: this.repo,
                pull_number: prNumber
            });
            const currentBody = pr.body || '';
            let cleanBody = currentBody;
            if (currentBody.includes(constants_1.AI_SUMMARY_START_MARKER)) {
                const startIndex = currentBody.indexOf(constants_1.AI_SUMMARY_START_MARKER);
                const endIndex = currentBody.indexOf(constants_1.AI_SUMMARY_END_MARKER);
                if (endIndex !== -1) {
                    cleanBody =
                        currentBody.substring(0, startIndex).trim() +
                            '\n' +
                            currentBody.substring(endIndex + constants_1.AI_SUMMARY_END_MARKER.length).trim();
                }
                else {
                    cleanBody = currentBody.substring(0, startIndex).trim();
                }
            }
            const updatedBody = `${cleanBody.trim()}\n\n${constants_1.AI_SUMMARY_START_MARKER}\n### 🤖 Critique AI Summary\n\n${summaryMarkdown}\n${constants_1.AI_SUMMARY_END_MARKER}`;
            await this.octokit.rest.pulls.update({
                owner: this.owner,
                repo: this.repo,
                pull_number: prNumber,
                body: updatedBody
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.GitHubActionsAdapter = GitHubActionsAdapter;
//# sourceMappingURL=github-actions-adapter.js.map
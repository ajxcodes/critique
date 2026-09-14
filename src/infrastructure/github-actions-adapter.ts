/**
 * critique - GitHubActionsAdapter (Infrastructure Layer)
 *
 * Implements GitHubClientPort using @actions/github Octokit SDK.
 * Manages PR description updates, GraphQL review thread resolution,
 * and inline/summary review comments.
 */

import * as github from '@actions/github';
import {
  GitHubClientPort,
  UnresolvedThread,
  ReviewCommentInput
} from '../ports/github-client';
import { GitHubApiError } from '../domain/errors';
import {
  AI_SUMMARY_START_MARKER,
  AI_SUMMARY_END_MARKER
} from '../domain/constants';

export interface GitHubActionsContext {
  readonly owner: string;
  readonly repo: string;
}

export class GitHubActionsAdapter implements GitHubClientPort {
  private readonly octokit: ReturnType<typeof github.getOctokit>;
  private readonly owner: string;
  private readonly repo: string;

  constructor(token: string, context?: GitHubActionsContext) {
    this.octokit = github.getOctokit(token);
    this.owner = context?.owner || github.context.repo.owner;
    this.repo = context?.repo || github.context.repo.repo;
  }

  public async getPullRequest(prNumber: number): Promise<{
    title: string;
    body: string;
    headSha: string;
    baseRef: string;
  }> {
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
    } catch (err) {
      throw new GitHubApiError('getPullRequest', { prNumber }, err);
    }
  }

  public async getUnresolvedThreads(prNumber: number): Promise<readonly UnresolvedThread[]> {
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
      const response = await this.octokit.graphql<{
        repository?: {
          pullRequest?: {
            reviewThreads?: {
              nodes?: Array<{
                id: string;
                isResolved: boolean;
                path: string;
                line?: number;
                originalLine?: number;
                comments?: {
                  nodes?: Array<{
                    id: string;
                    body: string;
                    author?: { login?: string };
                  }>;
                };
              }>;
            };
          };
        };
      }>(threadQuery, {
        owner: this.owner,
        repo: this.repo,
        number: prNumber
      });

      const unresolved: UnresolvedThread[] = [];
      const threads = response.repository?.pullRequest?.reviewThreads?.nodes || [];

      for (const thread of threads) {
        if (!thread.isResolved) {
          const botComment = thread.comments?.nodes?.find(
            (c) =>
              c.body.includes('Critique AI Suggestion') ||
              c.body.includes('Antigravity AI Suggestion') ||
              c.body.includes('Powered by Google Gemini') ||
              c.author?.login?.includes('github-actions')
          );

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
    } catch (_err) {
      // Don't fail the whole run if GraphQL threads cannot be queried
      return Object.freeze([]);
    }
  }

  public async resolveThread(threadId: string): Promise<boolean> {
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
    } catch {
      return false;
    }
  }

  public async createReviewComment(
    prNumber: number,
    comment: ReviewCommentInput
  ): Promise<boolean> {
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
    } catch (_err) {
      // Fallback to issue comment when line is outside PR diff hunk
      try {
        await this.octokit.rest.issues.createComment({
          owner: this.owner,
          repo: this.repo,
          issue_number: prNumber,
          body: `**Review feedback on \`${comment.path}\` (Line ${comment.line}):**\n\n${comment.body}`
        });
        return true;
      } catch {
        return false;
      }
    }
  }

  public async createIssueComment(issueOrPrNumber: number, body: string): Promise<boolean> {
    try {
      await this.octokit.rest.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueOrPrNumber,
        body
      });
      return true;
    } catch {
      return false;
    }
  }

  public async updatePullRequestBody(prNumber: number, summaryMarkdown: string): Promise<boolean> {
    try {
      const { data: pr } = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });

      const currentBody = pr.body || '';
      let cleanBody = currentBody;

      if (currentBody.includes(AI_SUMMARY_START_MARKER)) {
        const startIndex = currentBody.indexOf(AI_SUMMARY_START_MARKER);
        const endIndex = currentBody.indexOf(AI_SUMMARY_END_MARKER);
        if (endIndex !== -1) {
          cleanBody =
            currentBody.substring(0, startIndex).trim() +
            '\n' +
            currentBody.substring(endIndex + AI_SUMMARY_END_MARKER.length).trim();
        } else {
          cleanBody = currentBody.substring(0, startIndex).trim();
        }
      }

      const updatedBody = `${cleanBody.trim()}\n\n${AI_SUMMARY_START_MARKER}\n### 🤖 Critique AI Summary\n\n${summaryMarkdown}\n${AI_SUMMARY_END_MARKER}`;

      await this.octokit.rest.pulls.update({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        body: updatedBody
      });
      return true;
    } catch {
      return false;
    }
  }
}

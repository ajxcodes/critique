/**
 * critique - GitHubActionsAdapter (Infrastructure Layer)
 *
 * Implements GitHubClientPort using @actions/github Octokit SDK.
 * Manages PR description updates, GraphQL review thread resolution,
 * and inline/summary review comments.
 */
import { GitHubClientPort, UnresolvedThread, ReviewCommentInput } from '../ports/github-client';
export interface GitHubActionsContext {
    readonly owner: string;
    readonly repo: string;
}
export declare class GitHubActionsAdapter implements GitHubClientPort {
    private readonly octokit;
    private readonly owner;
    private readonly repo;
    constructor(token: string, context?: GitHubActionsContext);
    getPullRequest(prNumber: number): Promise<{
        title: string;
        body: string;
        headSha: string;
        baseRef: string;
    }>;
    getUnresolvedThreads(prNumber: number): Promise<readonly UnresolvedThread[]>;
    resolveThread(threadId: string): Promise<boolean>;
    createReviewComment(prNumber: number, comment: ReviewCommentInput): Promise<boolean>;
    createIssueComment(issueOrPrNumber: number, body: string): Promise<boolean>;
    updatePullRequestBody(prNumber: number, summaryMarkdown: string): Promise<boolean>;
}

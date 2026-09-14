/**
 * critique - GitHub Client Port for PR Reviews & GraphQL Threads
 */
export interface UnresolvedThread {
    readonly threadId: string;
    readonly path: string;
    readonly line: number | string;
    readonly body: string;
}
export interface ReviewCommentInput {
    readonly commitId: string;
    readonly path: string;
    readonly line: number;
    readonly body: string;
}
export interface GitHubClientPort {
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
    updatePullRequestBody(prNumber: number, newBody: string): Promise<boolean>;
}

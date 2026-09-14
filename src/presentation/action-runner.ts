/**
 * critique - ActionRunner Presentation Layer
 *
 * Coordinates execution when running as a native GitHub Action.
 * Extracts PR context, queries unresolved bot threads, runs review engine,
 * resolves fixed threads, posts inline comments, and updates PR summary.
 */

import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  GeminiClient,
  resolveGeminiApiKey,
  resolveGitHubToken
} from '../infrastructure/gemini-client';
import { StandardsResolver } from '../infrastructure/standards-resolver';
import { DiffProvider } from '../infrastructure/diff-provider';
import { GitHubActionsAdapter } from '../infrastructure/github-actions-adapter';
import { buildCritiquePrompt } from '../application/run-critique';
import { AiReviewReport } from '../domain/value-objects/ai-review-report';
import {
  AI_REVIEWER_MAX_PR_DIFF_CHARS,
  MSG_MISSING_API_KEY
} from '../domain/constants';

export async function runGitHubAction(): Promise<void> {
  try {
    const geminiKeyInput = core.getInput('gemini_api_key');
    const githubTokenInput = core.getInput('github_token');
    const baseRefInput = core.getInput('base_ref');
    const standardsPathInput = core.getInput('standards_path');
    const postInlineComments = core.getInput('post_inline_comments') !== 'false';
    const postSummaryComment = core.getInput('post_summary_comment') !== 'false';
    const updatePrDescription = core.getInput('update_pr_description') !== 'false';
    const strict = core.getInput('strict') === 'true';

    const apiKey = geminiKeyInput || resolveGeminiApiKey();
    if (!apiKey) {
      core.warning(MSG_MISSING_API_KEY);
      return;
    }

    const githubToken = githubTokenInput || resolveGitHubToken();
    const pr = github.context.payload.pull_request;
    const prNumber = pr?.number || github.context.issue?.number;
    const baseRef = baseRefInput || pr?.base?.ref || 'main';

    core.info(`Running Critique code review for PR #${prNumber || 'local'} against base '${baseRef}'...`);

    // 1. Extract Diff
    const diffProvider = new DiffProvider();
    const diffText = await diffProvider.getDiff({
      baseRef: `origin/${baseRef}`,
      maxChars: AI_REVIEWER_MAX_PR_DIFF_CHARS
    });

    if (!diffText || !diffText.trim()) {
      core.info('No changes detected in diff. Skipping review.');
      return;
    }

    // 2. Resolve Standards
    const standardsResolver = new StandardsResolver();
    const standards = standardsResolver.resolve(process.cwd(), standardsPathInput);
    if (standards.path) {
      core.info(`Enforcing repository standards from: ${standards.path}`);
    }

    let unresolvedThreads: any[] = [];
    let ghAdapter: GitHubActionsAdapter | null = null;

    if (githubToken && prNumber) {
      ghAdapter = new GitHubActionsAdapter(githubToken);
      unresolvedThreads = [...(await ghAdapter.getUnresolvedThreads(prNumber))];
      core.info(`Discovered ${unresolvedThreads.length} existing unresolved review thread(s).`);
    }

    const previousThreadsText = unresolvedThreads.length > 0 ? JSON.stringify(unresolvedThreads, null, 2) : '';

    // 3. Assemble Prompt & Query Gemini
    const prompt = buildCritiquePrompt(diffText, standards.content, previousThreadsText);
    const geminiClient = new GeminiClient();
    const queryResult = await geminiClient.query(prompt, apiKey, {
      githubTokenFallback: githubToken
    });

    const report = AiReviewReport.parse(queryResult.text, queryResult.modelUsed);
    core.info(`Review completed using model: ${queryResult.modelUsed}. Confidence: ${report.confidence.level}.`);

    // 4. GitHub PR Integration
    if (ghAdapter && prNumber) {
      // A. Update PR Description
      if (updatePrDescription && report.summary) {
        await ghAdapter.updatePullRequestBody(prNumber, report.summary);
        core.info('Updated PR description with AI summary.');
      }

      // B. Resolve Fixed Conversation Threads
      if (report.resolvedThreads && report.resolvedThreads.length > 0) {
        for (const threadId of report.resolvedThreads) {
          const ok = await ghAdapter.resolveThread(threadId);
          if (ok) {
            core.info(`Resolved fixed review thread: ${threadId}`);
          }
        }
      }

      // C. Post Inline Comments
      if (postInlineComments && report.findings.length > 0) {
        const prDetails = await ghAdapter.getPullRequest(prNumber);
        for (const finding of report.findings) {
          const isDuplicate = unresolvedThreads.some(
            (t) => t.path === finding.path && parseInt(t.line, 10) === finding.line
          );
          if (isDuplicate) {
            continue;
          }

          const header = finding.getHeader();
          const commentBody = `${header}${finding.body}\n\n*Powered by Critique AI (${queryResult.modelUsed})*`;

          await ghAdapter.createReviewComment(prNumber, {
            commitId: prDetails.headSha,
            path: finding.path,
            line: finding.line,
            body: commentBody
          });
        }
        core.info(`Posted inline comments for ${report.findings.length} findings.`);
      }

      // D. Post Run Summary Comment
      if (postSummaryComment) {
        const resolvedList = report.resolvedThreads.map((id) => `- Resolved Thread: \`${id}\``);
        const resolvedText = resolvedList.length > 0 ? resolvedList.join('\n') : '_None_';

        const newList = report.findings.map((f) => `- \`[${f.severity}]\` \`${f.path}\` (Line ${f.line})`);
        const newCommentsText = newList.length > 0 ? newList.join('\n') : '_None_';

        const outstandingList = unresolvedThreads
          .filter((t) => !report.resolvedThreads.includes(t.threadId))
          .map((t) => `- \`${t.path}\` (Line ${t.line})`);
        const outstandingText = outstandingList.length > 0 ? outstandingList.join('\n') : '_None_';

        const summaryBody = `### 🤖 Critique AI Review Run Summary

- **Confidence Level**: **${report.confidence.level}** - *${report.confidence.explanation}*
- **Model**: *${queryResult.modelUsed}*

#### 🔧 Comments Resolved (${report.resolvedThreads.length})
${resolvedText}

#### 📝 New Comments Added (${report.findings.length})
${newCommentsText}

#### ⏳ Outstanding Comments (${outstandingList.length})
${outstandingText}

*Powered by Critique AI*`;

        await ghAdapter.createIssueComment(prNumber, summaryBody);
        core.info('Posted run summary comment.');
      }
    }

    // 5. Set Outputs
    core.setOutput('summary', report.summary);
    core.setOutput('confidence', report.confidence.level);
    core.setOutput('is_passing', report.isPassing().toString());
    core.setOutput('has_blocking_issues', report.hasBlockingIssues().toString());
    core.setOutput('error_count', report.errorCount().toString());
    core.setOutput('warning_count', report.warningCount().toString());

    if (strict && report.hasBlockingIssues()) {
      core.setFailed(`Critique review failed with ${report.errorCount()} blocking error(s).`);
    }
  } catch (error) {
    core.setFailed(`Critique action failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

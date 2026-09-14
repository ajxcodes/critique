/**
 * critique - CliReviewerGateway (Infrastructure Adapter)
 *
 * Implements AiReviewerPort with a 3-tier resolution hierarchy:
 * 1. Bundled bin/critique.js in repository root.
 * 2. ~/.local/bin/critique (fallback ~/.local/bin/ai-reviewer).
 * 3. System $PATH (critique, fallback ai-reviewer).
 */
import { AiReviewReport } from '../domain/value-objects/ai-review-report';
import { AiReviewerPort, AiReviewOptions, AiReviewerResolution } from '../ports/ai-reviewer';
import { CommandExecutorPort } from '../ports/command-executor';
export declare class CliReviewerGateway implements AiReviewerPort {
    private readonly commandExecutor;
    constructor(commandExecutor?: CommandExecutorPort);
    resolveReviewer(cwd?: string): AiReviewerResolution;
    review(options?: AiReviewOptions): Promise<AiReviewReport>;
}

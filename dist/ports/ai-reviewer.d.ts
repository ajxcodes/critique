/**
 * critique - AiReviewerPort & Options
 */
import { AiReviewReport } from '../domain/value-objects/ai-review-report';
import { ResolverSource } from '../domain/constants';
export interface AiReviewOptions {
    readonly cwd?: string;
    readonly staged?: boolean;
    readonly baseRef?: string;
    readonly prNumber?: number;
    readonly timeoutMs?: number;
    readonly env?: Readonly<Record<string, string | undefined>>;
    readonly bypass?: boolean;
    readonly standardsPath?: string;
    readonly strict?: boolean;
}
export interface AiReviewerResolution {
    readonly source: ResolverSource;
    readonly path: string | null;
    readonly isAvailable: boolean;
}
export interface AiReviewerPort {
    resolveReviewer(cwd?: string): Promise<AiReviewerResolution> | AiReviewerResolution;
    review(options?: AiReviewOptions): Promise<AiReviewReport>;
}

/**
 * critique - CLI Presentation Layer
 *
 * Dispatches CLI invocations, parses command line flags, formats reports,
 * and handles exit codes.
 */
import { AiReviewOptions } from '../ports/ai-reviewer';
export interface CliArguments extends AiReviewOptions {
    readonly json?: boolean;
    readonly help?: boolean;
    readonly version?: boolean;
    readonly commitRange?: string;
}
export declare function parseCliArguments(argv: string[]): CliArguments;
export declare function printHelp(): void;
export declare function runCritiqueCli(argv?: string[]): Promise<number>;

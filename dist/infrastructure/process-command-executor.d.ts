/**
 * critique - ProcessCommandExecutor Infrastructure Adapter
 *
 * Implements CommandExecutorPort using isolated child processes (child_process.spawn)
 * with timeout enforcement and stdout/stderr stream buffering.
 */
import { CommandExecutorPort, CommandExecutionOptions, CommandExecutionResult } from '../ports';
export declare class ProcessCommandExecutor implements CommandExecutorPort {
    execute(command: string, options?: CommandExecutionOptions): Promise<CommandExecutionResult>;
}

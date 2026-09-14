/**
 * critique - CommandExecutorPort
 */

export interface CommandExecutionResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export interface CommandExecutionOptions {
  readonly cwd?: string;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly timeoutMs?: number;
}

export interface CommandExecutorPort {
  execute(command: string, options?: CommandExecutionOptions): Promise<CommandExecutionResult>;
}

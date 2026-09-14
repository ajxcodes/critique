/**
 * critique - ProcessCommandExecutor Infrastructure Adapter
 *
 * Implements CommandExecutorPort using isolated child processes (child_process.spawn)
 * with timeout enforcement and stdout/stderr stream buffering.
 */

import * as child_process from 'child_process';
import {
  CommandExecutorPort,
  CommandExecutionOptions,
  CommandExecutionResult
} from '../ports';

export class ProcessCommandExecutor implements CommandExecutorPort {
  public async execute(
    command: string,
    options: CommandExecutionOptions = {}
  ): Promise<CommandExecutionResult> {
    const cwd = options.cwd || process.cwd();
    const timeoutMs = options.timeoutMs && options.timeoutMs > 0 ? options.timeoutMs : undefined;
    const env = options.env ? { ...process.env, ...options.env } : process.env;

    return new Promise<CommandExecutionResult>((resolve) => {
      let stdoutBuffer = '';
      let stderrBuffer = '';
      let timedOut = false;
      let timer: NodeJS.Timeout | null = null;

      const proc = child_process.spawn(command, {
        shell: true,
        cwd,
        env,
        detached: process.platform !== 'win32'
      });

      if (timeoutMs) {
        timer = setTimeout(() => {
          timedOut = true;
          try {
            if (proc.pid && process.platform !== 'win32') {
              process.kill(-proc.pid, 'SIGTERM');
            } else {
              proc.kill('SIGTERM');
            }
          } catch {
            // Process may have already exited
          }

          const killTimer = setTimeout(() => {
            try {
              if (proc.pid && process.platform !== 'win32') {
                process.kill(-proc.pid, 'SIGKILL');
              } else {
                proc.kill('SIGKILL');
              }
            } catch {
              // Ignore kill errors
            }
          }, 500);
          killTimer.unref();
        }, timeoutMs);
      }

      proc.stdout?.on('data', (chunk: Buffer | string) => {
        stdoutBuffer += chunk.toString();
      });

      proc.stderr?.on('data', (chunk: Buffer | string) => {
        stderrBuffer += chunk.toString();
      });

      proc.on('error', (err: Error) => {
        if (timer) clearTimeout(timer);
        stderrBuffer += `\nProcess execution error: ${err.message}`;
        resolve({
          exitCode: 1,
          stdout: stdoutBuffer,
          stderr: stderrBuffer
        });
      });

      proc.on('close', (code: number | null) => {
        if (timer) clearTimeout(timer);
        let exitCode = code !== null ? code : 1;
        if (timedOut) {
          exitCode = exitCode !== 0 ? exitCode : 1;
        }

        resolve({
          exitCode,
          stdout: stdoutBuffer,
          stderr: stderrBuffer
        });
      });
    });
  }
}

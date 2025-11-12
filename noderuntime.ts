import type { Runtime } from "./mod.ts";
import process from "node:process";

/**
 * Creates a Node.js-specific Runtime implementation.
 *
 * @returns Runtime implementation for Node.js environment
 */
export function runtime(): Runtime {
  return new NodeRuntime();
}

/**
 * Node.js implementation of the Runtime interface.
 * Uses Node.js process APIs for process operations.
 */
class NodeRuntime implements Runtime {
  signal(
    signal: "SIGINT" | "SIGTERM" | "SIGHUP" | "SIGUSR1" | "SIGUSR2" | "SIGINFO",
    cb: () => void,
  ): void {
    try {
      // SIGINFO is only available on BSD/macOS
      // Windows doesn't support SIGUSR1, SIGUSR2, SIGHUP
      process.on(signal, cb);
    } catch (_err) {
      // signal not supported on this platform, silently ignore
    }
  }
  args(): string[] {
    return process.argv.slice(2);
  }
  stderr(s: string): void {
    process.stderr.write(s);
  }
  stdout(s: string): void {
    process.stdout.write(s);
  }
  exit(code: number): void {
    process.exit(code);
  }
}

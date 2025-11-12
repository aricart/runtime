import type { Runtime } from "./mod.ts";

/**
 * Creates a Deno-specific Runtime implementation.
 *
 * @returns Runtime implementation for Deno environment
 */
export function runtime(): Runtime {
  return new DenoRuntime();
}

/**
 * Deno implementation of the Runtime interface.
 * Uses Deno's global APIs for process operations.
 */
class DenoRuntime implements Runtime {
  signal(
    signal: "SIGINT" | "SIGTERM" | "SIGHUP" | "SIGUSR1" | "SIGUSR2" | "SIGINFO",
    cb: () => void,
  ): void {
    try {
      // SIGINFO is only available on BSD/macOS
      Deno.addSignalListener(signal, cb);
    } catch (_err) {
      // signal not supported on this platform, silently ignore
    }
  }
  args(): string[] {
    return Deno.args;
  }
  stderr(s: string): void {
    Deno.stderr.writeSync(new TextEncoder().encode(s));
  }
  stdout(s: string): void {
    Deno.stdout.writeSync(new TextEncoder().encode(s));
  }
  exit(code: number): void {
    Deno.exit(code);
  }
}

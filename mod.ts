/**
 * Runtime abstraction interface for cross-platform operations.
 * Provides a unified API for Deno, Node.js, and Bun environments.
 *
 * Signal support varies by platform:
 * - SIGINT, SIGTERM: Supported on all platforms
 * - SIGHUP, SIGUSR1, SIGUSR2: Supported on Unix-like systems (Linux, macOS), ignored on Windows
 * - SIGINFO: Supported on BSD/macOS only, silently ignored elsewhere
 */
export interface Runtime {
  /**
   * Returns command-line arguments passed to the program.
   * Excludes the executable and script paths.
   *
   * @returns Array of command-line arguments
   */
  args(): string[];

  /**
   * Writes a string to standard output.
   *
   * @param s - String to write to stdout
   */
  stdout(s: string): void;

  /**
   * Writes a string to standard error.
   *
   * @param s - String to write to stderr
   */
  stderr(s: string): void;

  /**
   * Exits the process with the specified code.
   *
   * @param code - Exit code (0 for success, non-zero for error)
   */
  exit(code: number): void;

  /**
   * Registers a callback for the specified signal.
   * Note: SIGINFO is only available on BSD/macOS. On other platforms, it will be ignored.
   *
   * @param name - Signal name to listen for
   * @param cb - Callback function to invoke when signal is received
   */
  signal(
    name: "SIGINT" | "SIGTERM" | "SIGHUP" | "SIGUSR1" | "SIGUSR2" | "SIGINFO",
    cb: () => void,
  ): void;
}

/**
 * Detects the current runtime environment and returns the appropriate Runtime implementation.
 * Automatically detects Deno vs Node.js/Bun by checking for globalThis.Deno.
 * Bun uses the Node.js-compatible implementation.
 *
 * @returns Runtime implementation for the current environment
 *
 * @example
 * ```typescript
 * const runtime = await getRuntime();
 * const args = runtime.args();
 * runtime.stdout("Hello world\n");
 *
 * // Register signal handler
 * runtime.signal("SIGINT", () => {
 *   runtime.stdout("Interrupted!\n");
 *   runtime.exit(130);
 * });
 * ```
 */
export async function getRuntime(): Promise<Runtime> {
  if (globalThis.Deno) {
    const { runtime } = await import("./denoruntime.ts");
    return runtime();
  } else {
    const { runtime } = await import("./noderuntime.ts");
    return runtime();
  }
}

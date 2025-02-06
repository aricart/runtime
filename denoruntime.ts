import type { Runtime } from "./mod.ts";

export function runtime(): Runtime {
  return new DenoRuntime();
}

class DenoRuntime implements Runtime {
  signal(signal: "SIGTERM" | "SIGINFO", cb: () => void): void {
    Deno.addSignalListener(signal, cb);
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

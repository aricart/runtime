import type { Runtime } from "./mod.ts";
import process from "node:process";

export function runtime(): Runtime {
  return new NodeRuntime();
}

class NodeRuntime implements Runtime {
  signal(signal: "SIGTERM" | "SIGINFO", cb: () => void): void {
    process.on(signal, cb);
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
  exit(code: number) {
    process.exit(code);
  }
}

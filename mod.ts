export interface Runtime {
  args(): string[];
  stdout(s: string): void;
  stderr(s: string): void;
  exit(code: number): void;
  signal(name: "SIGTERM" | "SIGINFO", cb: () => void): void;
}

export async function getRuntime(): Promise<Runtime> {
  if (globalThis.Deno) {
    const { runtime } = await import("./denoruntime.ts");
    return runtime();
  } else {
    const { runtime } = await import("./noderuntime.ts");
    return runtime();
  }
}

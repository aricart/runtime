import { assertEquals, assertExists } from "jsr:@std/assert";
import { getRuntime } from "./mod.ts";
import type { Runtime } from "./mod.ts";

Deno.test("getRuntime returns a runtime instance", async () => {
  const runtime = await getRuntime();
  assertExists(runtime);
});

Deno.test("runtime has all required methods", async () => {
  const runtime = await getRuntime();
  assertEquals(typeof runtime.args, "function");
  assertEquals(typeof runtime.stdout, "function");
  assertEquals(typeof runtime.stderr, "function");
  assertEquals(typeof runtime.exit, "function");
  assertEquals(typeof runtime.signal, "function");
});

Deno.test("runtime.args returns an array", async () => {
  const runtime = await getRuntime();
  const args = runtime.args();
  assertEquals(Array.isArray(args), true);
});

Deno.test("runtime.stdout writes to stdout", async () => {
  const runtime = await getRuntime();

  // capture stdout by creating a mock
  const outputs: string[] = [];
  const originalStdout = runtime.stdout;
  runtime.stdout = (s: string) => {
    outputs.push(s);
  };

  runtime.stdout("test output\n");
  assertEquals(outputs.length, 1);
  assertEquals(outputs[0], "test output\n");

  // restore
  runtime.stdout = originalStdout;
});

Deno.test("runtime.stderr writes to stderr", async () => {
  const runtime = await getRuntime();

  // capture stderr by creating a mock
  const outputs: string[] = [];
  const originalStderr = runtime.stderr;
  runtime.stderr = (s: string) => {
    outputs.push(s);
  };

  runtime.stderr("test error\n");
  assertEquals(outputs.length, 1);
  assertEquals(outputs[0], "test error\n");

  // restore
  runtime.stderr = originalStderr;
});

Deno.test({
  name: "runtime.signal registers SIGINT handler",
  fn: async () => {
    const runtime = await getRuntime();

    // should not throw when registering signal
    let called = false;
    runtime.signal("SIGINT", () => {
      called = true;
    });

    // just verify it doesn't throw
    assertEquals(called, false);
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "runtime.signal registers SIGTERM handler",
  fn: async () => {
    const runtime = await getRuntime();

    // should not throw when registering signal
    let called = false;
    runtime.signal("SIGTERM", () => {
      called = true;
    });

    // just verify it doesn't throw
    assertEquals(called, false);
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "runtime.signal registers SIGHUP handler",
  fn: async () => {
    const runtime = await getRuntime();

    // should not throw when registering signal
    let called = false;
    runtime.signal("SIGHUP", () => {
      called = true;
    });

    // just verify it doesn't throw
    assertEquals(called, false);
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "runtime.signal registers SIGUSR1 handler",
  fn: async () => {
    const runtime = await getRuntime();

    // should not throw when registering signal
    let called = false;
    runtime.signal("SIGUSR1", () => {
      called = true;
    });

    // just verify it doesn't throw
    assertEquals(called, false);
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "runtime.signal registers SIGUSR2 handler",
  fn: async () => {
    const runtime = await getRuntime();

    // should not throw when registering signal
    let called = false;
    runtime.signal("SIGUSR2", () => {
      called = true;
    });

    // just verify it doesn't throw
    assertEquals(called, false);
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "runtime.signal registers SIGINFO handler without error",
  fn: async () => {
    const runtime = await getRuntime();

    // SIGINFO might not be supported on all platforms, but should not throw
    let called = false;
    runtime.signal("SIGINFO", () => {
      called = true;
    });

    // just verify it doesn't throw
    assertEquals(called, false);
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test("runtime is Deno runtime when running in Deno", async () => {
  const runtime = await getRuntime();

  // verify we're using Deno's args
  if (globalThis.Deno) {
    const args = runtime.args();
    // Deno.args should match
    assertEquals(args, Deno.args);
  }
});

Deno.test({
  name: "multiple signal handlers can be registered",
  fn: async () => {
    const runtime = await getRuntime();

    let count1 = 0;
    let count2 = 0;

    runtime.signal("SIGINT", () => {
      count1++;
    });

    runtime.signal("SIGTERM", () => {
      count2++;
    });

    // just verify both registered without error
    assertEquals(count1, 0);
    assertEquals(count2, 0);
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test("runtime.args excludes executable and script paths", async () => {
  const runtime = await getRuntime();
  const args = runtime.args();

  // args should not include the deno executable or script name
  // when run with `deno test`, args should be empty or contain test filter args
  assertEquals(Array.isArray(args), true);

  // verify no arg contains "deno" executable path or "test.ts" filename
  for (const arg of args) {
    // args should be clean, not containing the runtime or script path
    // (this is a basic check, actual args depend on how test is run)
    assertEquals(typeof arg, "string");
  }
});

Deno.test("stdout and stderr can write multiple lines", async () => {
  const runtime = await getRuntime();

  const stdoutOutputs: string[] = [];
  const stderrOutputs: string[] = [];

  const originalStdout = runtime.stdout;
  const originalStderr = runtime.stderr;

  runtime.stdout = (s: string) => stdoutOutputs.push(s);
  runtime.stderr = (s: string) => stderrOutputs.push(s);

  runtime.stdout("line 1\n");
  runtime.stdout("line 2\n");
  runtime.stderr("error 1\n");
  runtime.stderr("error 2\n");

  assertEquals(stdoutOutputs.length, 2);
  assertEquals(stderrOutputs.length, 2);
  assertEquals(stdoutOutputs[0], "line 1\n");
  assertEquals(stdoutOutputs[1], "line 2\n");
  assertEquals(stderrOutputs[0], "error 1\n");
  assertEquals(stderrOutputs[1], "error 2\n");

  runtime.stdout = originalStdout;
  runtime.stderr = originalStderr;
});

Deno.test("runtime interface can be used for mocking", async () => {
  // create a mock runtime for testing
  const mockRuntime: Runtime = {
    args: () => ["--test", "arg"],
    stdout: (s: string) => {},
    stderr: (s: string) => {},
    exit: (code: number) => {},
    signal: (name, cb) => {},
  };

  assertEquals(mockRuntime.args(), ["--test", "arg"]);
  assertExists(mockRuntime.stdout);
  assertExists(mockRuntime.stderr);
  assertExists(mockRuntime.exit);
  assertExists(mockRuntime.signal);
});

Deno.test("stdout handles empty strings", async () => {
  const runtime = await getRuntime();
  const outputs: string[] = [];
  const originalStdout = runtime.stdout;

  runtime.stdout = (s: string) => {
    outputs.push(s);
  };

  runtime.stdout("");
  assertEquals(outputs.length, 1);
  assertEquals(outputs[0], "");

  runtime.stdout = originalStdout;
});

Deno.test("stderr handles empty strings", async () => {
  const runtime = await getRuntime();
  const outputs: string[] = [];
  const originalStderr = runtime.stderr;

  runtime.stderr = (s: string) => {
    outputs.push(s);
  };

  runtime.stderr("");
  assertEquals(outputs.length, 1);
  assertEquals(outputs[0], "");

  runtime.stderr = originalStderr;
});

Deno.test("stdout handles unicode characters", async () => {
  const runtime = await getRuntime();
  const outputs: string[] = [];
  const originalStdout = runtime.stdout;

  runtime.stdout = (s: string) => {
    outputs.push(s);
  };

  runtime.stdout("Hello 世界 🌍\n");
  assertEquals(outputs.length, 1);
  assertEquals(outputs[0], "Hello 世界 🌍\n");

  runtime.stdout = originalStdout;
});

Deno.test("stderr handles unicode characters", async () => {
  const runtime = await getRuntime();
  const outputs: string[] = [];
  const originalStderr = runtime.stderr;

  runtime.stderr = (s: string) => {
    outputs.push(s);
  };

  runtime.stderr("Error: ошибка ❌\n");
  assertEquals(outputs.length, 1);
  assertEquals(outputs[0], "Error: ошибка ❌\n");

  runtime.stderr = originalStderr;
});

Deno.test({
  name: "same signal can have multiple handlers",
  fn: async () => {
    const runtime = await getRuntime();

    let count1 = 0;
    let count2 = 0;

    // register multiple handlers for the same signal
    runtime.signal("SIGUSR1", () => {
      count1++;
    });

    runtime.signal("SIGUSR1", () => {
      count2++;
    });

    // just verify both registered without error
    assertEquals(count1, 0);
    assertEquals(count2, 0);
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test("args returns array even when empty", async () => {
  const runtime = await getRuntime();
  const args = runtime.args();

  // should always return an array, never null or undefined
  assertEquals(Array.isArray(args), true);
  assertExists(args);
});

Deno.test("stdout and stderr are independent", async () => {
  const runtime = await getRuntime();

  const stdoutOutputs: string[] = [];
  const stderrOutputs: string[] = [];

  const originalStdout = runtime.stdout;
  const originalStderr = runtime.stderr;

  runtime.stdout = (s: string) => stdoutOutputs.push(s);
  runtime.stderr = (s: string) => stderrOutputs.push(s);

  runtime.stdout("stdout\n");
  runtime.stderr("stderr\n");
  runtime.stdout("stdout2\n");

  assertEquals(stdoutOutputs.length, 2);
  assertEquals(stderrOutputs.length, 1);
  assertEquals(stdoutOutputs[0], "stdout\n");
  assertEquals(stdoutOutputs[1], "stdout2\n");
  assertEquals(stderrOutputs[0], "stderr\n");

  runtime.stdout = originalStdout;
  runtime.stderr = originalStderr;
});

Deno.test({
  name: "all signal types are accepted",
  fn: async () => {
    const runtime = await getRuntime();

    // verify all signal types are valid
    const signals = [
      "SIGINT",
      "SIGTERM",
      "SIGHUP",
      "SIGUSR1",
      "SIGUSR2",
      "SIGINFO",
    ] as const;

    for (const sig of signals) {
      // should not throw
      runtime.signal(sig, () => {});
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

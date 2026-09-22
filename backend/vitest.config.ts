import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    isolate: false,
    testFileParallelism: false,
    include: ["tests/**/*.ts"],
    exclude: ["tests/setup.ts"],
  },
});
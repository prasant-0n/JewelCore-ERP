import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@jewelcore/shared": path.resolve(__dirname, "./packages/shared/src/index.ts"),
      "@jewelcore/database": path.resolve(__dirname, "./packages/database/src/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    fileParallelism: false,
    globalSetup: ["./vitest.global-setup.ts"],
    include: ["**/*.test.ts", "**/*.spec.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});

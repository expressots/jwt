import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/**
 * @see {@link https://vitejs.dev/config/}
 * @see {@link https://vitest.dev/config/}
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["reflect-metadata"],
    exclude: ["**/node_modules/**", "**/test/**", "**/lib/**"],
    coverage: {
      all: true,
      include: ["./src/**"],
      exclude: ["**/node_modules/**", "**/lib/**", "**/test/**", "**/index.ts/**"],
      thresholds: {
        global: {
          statements: 85,
          branches: 85,
          functions: 85,
          lines: 85,
        },
      },
      reporter: ["text", "html", "json"],
      provider: "v8",
    },
    // ref: https://vitest.dev/config/#testtimeout
    testTimeout: 10000,
  },
});

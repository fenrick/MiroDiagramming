import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  test: {
    coverage: {
      provider: "istanbul",
      reporter: ["text", ["lcov", { projectRoot: path.resolve(__dirname) }]],
      reportOnFailure: true,
      reportsDirectory: "coverage",
      exclude: [
        "commitlint.config.cjs",
        "scripts/**",
        "vitest.config.ts",
        "vite.config.ts",
        "eslint.config.js",
        ".storybook/**",
        "src/stories/**",
        "**/*.d.ts",
      ],
    },
    projects: [
      {
        test: {
          globals: true,
          setupFiles: "./tests/setupTests.ts",
          environment: "node",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        test: {
          globals: true,
          setupFiles: "./tests/setupTests.ts",
          environment: "jsdom",
          include: ["tests/**/*.test.tsx"],
        },
      },
    ],
  },
});

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    fileParallelism: false, // les tests API partagent une base PostgreSQL
    testTimeout: 10000,
  },
});

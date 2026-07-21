import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["database/**/*.test.ts", "backend/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      "@backend": path.resolve(__dirname, "backend"),
      "@backend/*": path.resolve(__dirname, "backend/*"),
      "@database": path.resolve(__dirname, "database"),
      "@database/*": path.resolve(__dirname, "database/*"),
    },
  },
});

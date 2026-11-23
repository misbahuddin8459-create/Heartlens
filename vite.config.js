import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      tslib: fileURLToPath(
        new URL("./node_modules/tslib/tslib.es6.js", import.meta.url)
      ),
    },
  },
  optimizeDeps: {
    include: ["tslib"],
  },
});
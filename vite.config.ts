import { defineConfig } from "vite";

export default defineConfig({
  base: "/course-quota-web/",
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
});

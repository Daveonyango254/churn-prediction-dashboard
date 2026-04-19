import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://churn-platform-api-247833790903.us-central1.run.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});

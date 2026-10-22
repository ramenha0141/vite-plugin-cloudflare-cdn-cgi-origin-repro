import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
export default defineConfig({ server: { allowedHosts: ["my-app.test"] }, plugins: [cloudflare()] });

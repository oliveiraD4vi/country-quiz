import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Em desenvolvimento, /ws vai para o servidor de salas (npm run server).
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/ws": { target: "ws://127.0.0.1:4702", ws: true } } },
});

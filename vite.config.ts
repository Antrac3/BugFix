import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // <--- aggiungi questa riga
    },
  },
  server: {
    port: 8080, // come nel tuo Project Settings
  },
});

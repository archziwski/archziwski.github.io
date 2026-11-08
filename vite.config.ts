import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" — göreli yol; GitHub Pages'ta hem kullanıcı kök sayfasında
// (kullanici.github.io) hem de alt yolda (kullanici.github.io/repo/) çalışır.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
  },
});

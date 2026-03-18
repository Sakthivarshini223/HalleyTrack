import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Itha add pannunga

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Itha inga call pannunga
  ],
})
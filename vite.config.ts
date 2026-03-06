import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react(), tailwindcss(), basicSsl()],
})

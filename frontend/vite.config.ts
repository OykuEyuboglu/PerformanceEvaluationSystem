import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],

    server: {
        proxy: {
            '/api': {
                target: 'https://localhost:7170',
                changeOrigin: true,
                secure: false,
            },
        },
    },

    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',

        pool: 'forks',
        maxWorkers: 1,
        fileParallelism: false,
    },
})
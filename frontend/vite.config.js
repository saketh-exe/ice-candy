import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    console.log('🔧 Vite running in mode:', mode);

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 3000,
            open: true,
        },
        // Log environment variables during build
        define: {
            'import.meta.env.MODE': JSON.stringify(mode),
        },
    };
});

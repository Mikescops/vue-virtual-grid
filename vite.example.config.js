import { defineConfig } from 'vite';
import { createVuePlugin as vue } from 'vite-plugin-vue2';

export default defineConfig({
    plugins: [vue()],
    root: 'example',
    build: {
        outDir: '../demo',
        target: 'es2020'
    }
});

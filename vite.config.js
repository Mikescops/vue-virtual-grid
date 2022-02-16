import { defineConfig } from 'vite';
import { createVuePlugin as vue } from 'vite-plugin-vue2';

import path from 'path';

export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            // eslint-disable-next-line no-undef
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: 'vue-virtual-grid',
            fileName: (format) => `vue-virtual-grid.${format}.js`,
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue',
                },
            },
        },
    }
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
		exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
		setupFiles: [],
		alias: {
			'@': resolve(__dirname, './src'),
			'server-only': resolve(__dirname, './tests/mocks/server-only.ts'),
		},
	},
});

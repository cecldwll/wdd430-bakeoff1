import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';

export default [
	{
		ignores: [
			'.DS_Store',
			'node_modules/**',
			'build/**',
			'.svelte-kit/**',
			'.netlify/**',
			'dist/**',
			'coverage/**',
			'page.tsx',
			'utils/**',
		],
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				extraFileExtensions: ['.svelte'],
			},
		},
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				ecmaVersion: 2020,
				sourceType: 'module',
				extraFileExtensions: ['.svelte'],
			},
		},
	},
	{
		rules: {
			'no-undef': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^\\$\\$|^_',
				},
			],
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/infinite-reactive-loop': 'off',
		},
	},
];

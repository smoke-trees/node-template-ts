const eslint = require('@eslint/js')
const tseslint = require('@typescript-eslint/eslint-plugin')
const tsparser = require('@typescript-eslint/parser')
const prettierConfig = require('eslint-config-prettier')

module.exports = [
	// Global ignores
	{
		ignores: ['node_modules/**', 'dist/**', 'coverage/**', '.nyc_output/**']
	},
	// Base ESLint recommended config
	eslint.configs.recommended,
	// TypeScript files configuration
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			},
			globals: {
				console: 'readonly',
				process: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				module: 'readonly',
				require: 'readonly',
				exports: 'writable',
				Buffer: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly'
			}
		},
		plugins: {
			'@typescript-eslint': tseslint
		},
		rules: {
			...tseslint.configs['eslint-recommended'].overrides[0].rules,
			...tseslint.configs.recommended.rules,
			...prettierConfig.rules,
			'no-unused-vars': 'off',
			camelcase: 'off',
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/camelcase': 'off',
			'no-console': 'error'
		}
	}
]

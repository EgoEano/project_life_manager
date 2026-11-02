import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';


export default [
    {
        ignores: [
            'eslint.config.js',
            '.bundle/**',
            'node_modules/**',
            'android/**',
            'ios/**',
            'build/**',
            'dist/**',
            'public/**',
        ],
    },

    js.configs.recommended,

    {
        files: ['**/*.{js,jsx,ts,tsx}'],

        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
                project: './tsconfig.base.json',
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },

        plugins: {
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            prettier,
        },

        rules: {
            // Prettier
            'prettier/prettier': 'error',

            // TypeScript
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'off', //warn

            // React
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',

            // Hooks
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // General
            'no-console': 'warn',
            'no-unused-vars': 'off',
        },

        settings: {
            react: {
                version: 'detect',
            },
        },
    },

    prettierConfig,
];

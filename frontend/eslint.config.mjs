import antfu from '@antfu/eslint-config'
import nextPlugin from '@next/eslint-plugin-next'
import pluginJest from 'eslint-plugin-jest'
import tailwindcss from 'eslint-plugin-tailwindcss'

export default antfu(
  {
    react: true,
    typescript: true,
    next: true,
    jsdoc: false,
    // test: false,
    ignores: [],
  },
  ...tailwindcss.configs['flat/recommended'],
  {
    rules: {
      'node/prefer-global/process': 'off',
    },
  },
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    rules: {
      '@typescript-eslint/no-require-imports': [
        'error',
        {
          allow: ['tailwindcss-animate'],
        },
      ],
    },
  },
  {
    files: [
      '__tests__/**/*.{ts,tsx}',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
    ],
    plugins: {
      jest: pluginJest,
    },
    languageOptions: {
      globals: {
        ...pluginJest.environments.globals.globals,
      },
    },
    // rules: {
    //   'jest/no-focused-tests': 'error',
    //   'jest/no-identical-title': 'error',
    //   'jest/valid-expect': 'error',
    //   'jest/no-disabled-tests': 'warn',
    //   'jest/prefer-lowercase-title': 'off',
    //   'jest/consistent-test-it': ['error', { fn: 'it' }],
    //   'no-console': 'off',
    // },
  },
)

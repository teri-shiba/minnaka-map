import antfu from '@antfu/eslint-config'
import nextPlugin from '@next/eslint-plugin-next'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tailwindcss from 'eslint-plugin-tailwindcss'

export default antfu(
  {
    react: true,
    typescript: true,
    next: true,
    test: true,
    jsdoc: false,
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
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
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
    ],
    rules: {
      'test/prefer-lowercase-title': 'off',
    },
  },
)

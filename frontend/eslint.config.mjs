import antfu from '@antfu/eslint-config'
import nextPlugin from '@next/eslint-plugin-next'
import tailwindcss from 'eslint-plugin-tailwindcss'

export default antfu(
  {
    react: true,
    typescript: true,
    next: true,
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
    rules: {
      '@typescript-eslint/no-require-imports': [
        'error',
        {
          allow: ['tailwindcss-animate'],
        },
      ],
    },
  },
)

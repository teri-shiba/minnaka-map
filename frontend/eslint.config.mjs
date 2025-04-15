import antfu from '@antfu/eslint-config'
import tailwindcss from 'eslint-plugin-tailwindcss'

export default antfu(
  {
    react: true,
    ignores: [],
  },
  {
    rules: {
      'node/prefer-global/process': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-require-imports': [
        'error',
        {
          allow: [
            'tailwindcss-animate',
          ],
        },
      ],
    },
  },
  ...tailwindcss.configs['flat/recommended'],
)

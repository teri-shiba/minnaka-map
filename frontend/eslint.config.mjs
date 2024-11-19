import antfu from '@antfu/eslint-config'
import tailwindcss from 'eslint-plugin-tailwindcss'

export default antfu(
  {
    react: true,
    ignores: [],
  },
  {
    files: ['src/app/components/ui/forms/**/*.tsx'],
    rules: {
      'node/prefer-global/process': 'off',
    },
  },
  ...tailwindcss.configs['flat/recommended'],
)

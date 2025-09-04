// ESLint flat config for TypeScript + React
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default [
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  // TypeScript (non type-aware) recommendations to avoid needing project service
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        // You can enable type-aware linting later by uncommenting the next two lines
        // project: ['./tsconfig.json'],
        // tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },
  prettier,
]

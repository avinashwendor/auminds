import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    name: 'auminds/legacy-warning-baseline',
    files: [
      'app/**/*.{ts,tsx}',
      'components/**/*.{ts,tsx}',
      'lib/**/*.{ts,tsx}',
      'tailwind.config.js',
    ],
    ignores: ['app/code-editor/**', 'components/BrowserCodeEditor.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'react/jsx-no-comment-textnodes': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'next-env.d.ts',
    'public/azurio/**',
  ]),
]);

import reactHooks from 'eslint-plugin-react-hooks';

const browserGlobals = Object.fromEntries(
  [
    'alert', 'clearInterval', 'clearTimeout', 'console', 'document', 'fetch',
    'File', 'FormData', 'localStorage', 'setInterval', 'setTimeout', 'URL',
    'WebSocket', 'window',
  ].map((name) => [name, 'readonly']),
);

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    linterOptions: { reportUnusedDisableDirectives: false },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: browserGlobals,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'no-constant-binary-expression': 'error',
      'no-duplicate-imports': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
];

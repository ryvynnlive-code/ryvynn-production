import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import { fileURLToPath } from 'node:url';

const compat = new FlatCompat({ baseDirectory: path.dirname(fileURLToPath(import.meta.url)) });
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals'),
  { plugins: { '@typescript-eslint': typescriptPlugin } },
];
export default config;

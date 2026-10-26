// One ESLint config for the whole repository. The rules live in the theme,
// which owns the JavaScript, TypeScript, CSS, JSON and Markdown it ships, and
// the root config only adds the ignores that keep generated output out of a
// lint run. `pnpm run lint` is wired from here; `pnpm run test` calls it as
// `test:lint`.
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import theme from './be-best/eslint.config.mjs';

export default defineConfig([
    globalIgnores([
        'node_modules/**',
        '.devenv/**',
        '.direnv/**',
        'public/**',
        'resources/**',
        'assets/**',
        'static/**',
    ]),
    ...theme,
    {
        // The theme config sets browser globals; the validators run in Node.
        files: ['scripts/**/*.mjs'],
        languageOptions: { globals: globals.node },
    },
]);

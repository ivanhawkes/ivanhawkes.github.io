// Guard the Prettier setup this repository depends on. Three things must stay
// true, and each has already gone wrong once:
//
//   1. No Go-template formatter touches `be-best/layouts/`. Formatting those
//      templates rewrites the rendered HTML of nearly every page, and every
//      candidate measured here (`prettier-plugin-go-template` 0.0.15, its
//      `guard` wrapper, the `@htnabe` fork, `djlint`, `gotmplfmt`) fails that
//      way, four of them unable to even parse four of the files. The defence is
//      `.prettierignore`, so the defence is asserted: every tracked layout HTML
//      must read as ignored from the repository root and from `be-best/`.
//   2. The Prettier block in `package.json` and the one in `be-best/package.json`
//      are hand-copied duplicates. Theme files resolve config from the theme, so
//      a root-only change is silently inert; the two must agree.
//   3. The editor must not format CSS on save, and must not format anything with
//      a config-less default Prettier - that is how templates get mangled.
//
// Run through `pnpm run test:prettier`.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import prettier from 'prettier';

const root = process.cwd();
const layoutGlob = 'be-best/layouts/*.html';
const problems = [];

function trackedFiles(glob) {
    const out = execFileSync('git', ['ls-files', '-z', glob], {
        encoding: 'utf8',
    });
    return out.split('\0').filter(Boolean);
}

function json(file) {
    return JSON.parse(readFileSync(path.join(root, file), 'utf8'));
}

// 1. Layout templates stay out of every Prettier run, from both roots.
const layouts = trackedFiles(layoutGlob);
if (layouts.length === 0) {
    problems.push(`no tracked files match '${layoutGlob}': the glob changed`);
}
for (const file of layouts) {
    const fromRoot = await prettier.getFileInfo(file, {
        cwd: root,
        ignorePath: '.prettierignore',
    });
    const fromTheme = await prettier.getFileInfo(
        path.relative('be-best', file),
        {
            cwd: path.join(root, 'be-best'),
            ignorePath: '.prettierignore',
        }
    );
    if (!fromRoot.ignored) {
        problems.push(`${file}: not ignored by the root .prettierignore`);
    }
    if (!fromTheme.ignored) {
        problems.push(`${file}: not ignored by be-best/.prettierignore`);
    }
}

// 2. The duplicated Prettier blocks agree.
const siteConfig = json('package.json').prettier;
const themeConfig = json('be-best/package.json').prettier;
if (JSON.stringify(siteConfig) !== JSON.stringify(themeConfig)) {
    problems.push(
        'the prettier block in package.json and in be-best/package.json differ'
    );
}
const cssWidth = (siteConfig.overrides || [])
    .filter((entry) =>
        []
            .concat(entry.files || [])
            .some((pattern) => String(pattern).endsWith('.css'))
    )
    .map((entry) => entry.options && entry.options.printWidth);
if (!cssWidth.includes(100)) {
    problems.push('no CSS override sets printWidth 100: theme CSS wraps at 80');
}

// 3. Editor settings: pinned Prettier, config required, no format on CSS save.
const editor = json('.vscode/settings.json');
if (editor['prettier.prettierPath'] !== 'node_modules/prettier') {
    problems.push('prettier.prettierPath must point at the project copy');
}
if (editor['prettier.requireConfig'] !== true) {
    problems.push(
        'prettier.requireConfig must be true: no config-less defaults'
    );
}
if (editor['[css]'] && editor['[css]']['editor.formatOnSave'] !== false) {
    problems.push(
        '[css].editor.formatOnSave must be false: the editor races edits'
    );
}

if (problems.length) {
    for (const problem of problems) {
        console.error(`prettier setup: ${problem}`);
    }
    process.exit(1);
}

console.log(
    `prettier setup: ${layouts.length} layout files ignored by both roots; ` +
        'the two prettier blocks agree; the editor is pinned and quiet on CSS'
);

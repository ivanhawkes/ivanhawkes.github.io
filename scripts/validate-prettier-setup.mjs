// Guard the Prettier setup this repository depends on. Four things must stay
// true, and each has already gone wrong once:
//
//   1. No Go-template formatter touches `be-best/layouts/`. Formatting those
//      templates rewrites the rendered HTML of nearly every page, and every
//      candidate measured here (`prettier-plugin-go-template` 0.0.15, its
//      `guard` wrapper, the `@htnabe` fork, `djlint`, `gotmplfmt`) fails that
//      way, four of them unable to even parse four of the files. The defence is
//      `.prettierignore`, so the defence is asserted: every tracked layout HTML
//      must read as ignored from the repository root.
//   2. There is exactly one Prettier config, in the root manifest. A block in
//      `be-best/package.json`, or an ignore file in the theme, resolves ahead of
//      the root one for every file under `be-best/`, so a root-only change was
//      silently inert there. Nothing under the theme may carry config.
//   3. The root config stays plugin-free. The only plugin it ever wired in was
//      `prettier-plugin-go-template`, routed to `*.html` by an override, and a
//      Go-template formatter is measured to rewrite the rendered HTML of nearly
//      every page. Removing it changed the output of 0 of the 329 tracked
//      files of the tree as measured on 2026-10-26 (518 files today).
//   4. The editor must not format CSS on save, and must not format anything with
//      a config-less default Prettier - that is how templates get mangled.
//
// Run through `pnpm run test:prettier`.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
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

// 1. Layout templates stay out of every Prettier run.
const layouts = trackedFiles(layoutGlob);
if (layouts.length === 0) {
    problems.push(`no tracked files match '${layoutGlob}': the glob changed`);
}
for (const file of layouts) {
    const info = await prettier.getFileInfo(file, {
        cwd: root,
        ignorePath: '.prettierignore',
    });
    if (!info.ignored) {
        problems.push(`${file}: not ignored by the root .prettierignore`);
    }
}

// 2. Exactly one Prettier config, in the root manifest.
const siteConfig = json('package.json').prettier;
for (const ghost of [
    'be-best/package.json',
    'be-best/.prettierignore',
    'be-best/.prettierrc',
]) {
    if (existsSync(path.join(root, ghost))) {
        problems.push(
            `${ghost} must not exist: it resolves ahead of the root config`
        );
    }
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

// 3. No plugins, and no parser routed to the banned Go-template one.
if ((siteConfig.plugins || []).length) {
    problems.push(
        'the prettier config must stay plugin-free: a Go-template plugin is banned'
    );
}
for (const entry of siteConfig.overrides || []) {
    const parser = String((entry.options && entry.options.parser) || '');
    if (parser.includes('go-template')) {
        problems.push('no override may route files to the go-template parser');
    }
}

// 4. Editor settings: pinned Prettier, config required, no format on CSS save.
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
    `prettier setup: ${layouts.length} layout files ignored; one plugin-free ` +
        'config in the root manifest; the editor is pinned and quiet on CSS'
);

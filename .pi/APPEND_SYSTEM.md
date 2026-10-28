- Never commit `public/`, `resources/`, or `.hugo_build.lock`.
- Validate content and theme changes with `pnpm run test` before committing.
- Add new images through Git LFS (`git lfs track <ext>` if the format is
  untracked).
- Kanban cards sit in a stage folder (`01-to-do`, `02-in-progress`, `03-done`);
  their filename carries priority and kind (`p2-us-slug`). There is no `status`
  field - moving the file between stages is the status change, and completion
  sets `params.completionDate`.
- Theme changes: `be-best/` is a plain directory in this repo (not a submodule),
  so commit theme files together with the rest of the change.
- Prettier rewrites files after you: VSCodium `editor.formatOnSave` and the
  husky pre-commit hook (`lint-staged` → `prettier --write`) reformat staged
  css, md, html, yaml, json and js. Re-read a file immediately before each edit;
  never reuse `oldText` from an older read or from your own write.
- Prettier runs with `printWidth: 80` (`100` for `*.css`) and `tabWidth: 4`: a
  CSS declaration at indent 1 wraps past 96 columns into three lines, and
  markdown prose reflows at 80. Keep CSS declarations under 96 columns and prose
  lines under 80 so disk text equals your text; after editing theme CSS run
  `npx prettier --write <file>` and re-read it before editing again.
- Never edit `assets/css/main.css`: the Tailwind CLI regenerates it (`css`,
  `server`, `test:css`, `build:css`); it is gitignored, 94.9 KB as written and
  77.9 KB minified by `build:css`, so past the 50 KB read limit either way.
  Those sizes are a 2026-10-27 `stat -c %s` measurement: measure again before
  quoting one. Theme CSS sources live in `be-best/assets/css/`.
- Never run Prettier over `be-best/layouts/**` (already in `.prettierignore`),
  `--no-ignore` included, and do not adopt a replacement plugin: measured on
  this tree, `prettier-plugin-go-template` 0.0.15, its `guard` wrapper and the
  active `@htnabe` fork all fail to parse 4 of 69 layouts, churn 1870+/1710-
  lines, and change the rendered HTML of 458 of 441 pages. `djlint` and
  `gotmplfmt` behave the same, so layout HTML stays hand-formatted. Layout HTML
  carries trailing spaces inside template tags; copy them from a fresh read.
  `pnpm run test:prettier` asserts that boundary; make it pass.
- Keep Prettier config singular: the root `package.json` is the only config, the
  root config wires in no plugin, and nothing under `be-best/` may carry one - a
  config there resolves ahead of the root one for every theme file.
- Line endings are not the problem: `.gitattributes` (`* text=auto eol=lf`),
  `core.autocrlf=input` and `core.eol=lf` keep every tracked file LF; no tracked
  file contains CRLF.
- Keep replies and commit messages concise.

- Never commit `public/`, `resources/`, or `.hugo_build.lock`.
- Validate content and theme changes with `pnpm run test` before committing.
- Add new images through Git LFS (`git lfs track <ext>` if the format is
  untracked).
- Kanban cards: the folder name must match the card kind, and the front-matter
  field is `dependencies` (not `depends-on`).
- Theme changes: commit inside `themes/be-best` first, push the submodule, then
  commit the parent repo pointer.
- Keep replies and commit messages concise.

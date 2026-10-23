- Never commit `public/`, `resources/`, or `.hugo_build.lock`.
- Validate content and theme changes with `pnpm run test` before committing.
- Add new images through Git LFS (`git lfs track <ext>` if the format is
  untracked).
- Kanban cards sit in a stage folder (`01-to-do`, `02-in-progress`, `03-done`);
  their filename carries priority and kind (`p2-us-slug`). There is no `status`
  field - moving the file between stages is the status change, and completion
  sets `params.completionDate`.
- Theme changes: commit inside `be-best` first, push the submodule, then commit
  the parent repo pointer.
- Keep replies and commit messages concise.

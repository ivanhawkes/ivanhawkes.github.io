---
name: dcp
description: Run the git commands to diff, commit and push our current changes.
---

# Goal

Run the git commands to diff, commit and push the current changes in this
repository.

# Procedure

1. **Diff.** Show what will be committed:

    ```bash
    git status --porcelain
    git diff
    git diff --staged
    ```

    If there is nothing to commit, stop and say so. Ask for my approval of the
    diff output before you try and commit. Do not commit and push unless I have
    given you my approval.

2. **Commit.** Stage all changes (respecting `.gitignore`; never stage
   `public/`, `resources/`, or `.hugo_build.lock`) and commit with a concise,
   focused message that describes the change:

    ```bash
    git add -A
    git commit -m "<message>"
    ```

    If the change is theme work in `themes/be-best`, commit inside the submodule
    and push to its `features` branch first, then commit the parent repo's
    submodule pointer.

3. **Push.** Push the current branch to its upstream:

    ```bash
    git push
    ```

Report what was diffed, the commit hash and message, and the push result.

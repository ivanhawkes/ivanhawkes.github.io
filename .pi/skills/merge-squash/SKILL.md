---
name: merge-squash
description:
    Perform a git merge --squash on the current branch, merging in a feature
    branch. Use when a feature branch should be merged into the posts branch.
---

# Goal

Squash-merge a feature branch into the current branch, which must be `posts`.
The result is staged changes, not a commit, and a commit is only made with my
approval.

# Parameters

- `<feature-branch>`: the name of the branch to merge into the current branch.
  Passed as the argument when the skill is invoked
  (`/skill:merge-squash <feature-branch>`). If no branch name is given, ask
  which feature branch to merge and stop before running any git command.

# Procedure

1. **Verify the working tree is clean.**

    ```bash
    git status --porcelain
    ```

    If there are unstaged or staged changes, **hard stop**: list them and ask
    whether I want to proceed (the feature branch can only be squashed onto a
    clean tree). Stop your turn and wait for my explicit permission.

2. **Ensure the current branch is `posts`.**

    ```bash
    git rev-parse --abbrev-ref HEAD
    ```

    If the current branch is **not** `posts`, switch to `posts`:

    ```bash
    git checkout posts
    ```

    (This is safe here because the working tree was verified clean in step 1.)

3. **Verify the feature branch exists.**

    ```bash
    git rev-parse --verify <feature-branch>
    ```

    If it does not exist, stop and ask me to check the branch name.

4. **Squash-merge the feature branch.**

    ```bash
    git merge --squash <feature-branch>
    ```

    `git merge --squash` stages the combined changes without committing. If a
    conflict occurs, resolve it, then report the resolved state and ask for
    approval before committing.

5. **Show what will be committed.**

    ```bash
    git status --porcelain
    git --no-pager diff --cached --color=never --stat
    git --no-pager diff --cached --color=never -U1
    ```

6. **Commit with my approval.** After showing the diff, **hard stop**: ask for
   my approval and then stop your turn. Never ask for approval and commit in the
   same turn. Once approved, commit with a concise, focused message:

    ```bash
    git commit -m "<message>"
    ```

Report the squashed branch, the resulting commit hash and message, and remind me
that pushing is a separate step.

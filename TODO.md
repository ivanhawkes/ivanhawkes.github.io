# TODO

A place where ideas come to die.

- add usage output routine to kan when executed without any parameters
- add acceptance criteria for the generated code
    - every kind is represented
    - think of the fail conditions and document them
- consider how best to include design first, test driven, agentic development
  into your process
- can AI write a good description of the kanban requests?
- add reading time estimate to all my posts except for the recipes
- add request kanban for the kan program
- make sure there is a **hard stop** before the generated program is built and
  copied to the home folder
- kanban program to track time loosely - mostly just 'add time in hours' to the
  time passed field
- would it be simple enough to have it note which kanban i am working on, then
  when i finish add the time. it could use some scratch file for tracking. add
  that to .gitignore - in fact a whole .scratch folder can be used
- a 'monthly' skill that can be run that can just check all the content, tighten
  it up, fix issues, etc
- squash-merge skill
    - write a skill that will perform a git merge --squash on the current branch
      and commit it, then push the result
    - allow the skill to rewrite the typical github squash merge summary of each
      commit using markdown for an improved readability
    - it's likely this means passing the commit message and overriding the
      auto-generated one
    - it should use `## <Commit Message>` as a header block for each commit.
    - files that were changed should be noted in a bulleted list including if it
      was 'deleted', 'created', 'updated'
    - the diff output should be beautified using the selected diff improvement
      tool e.g. an pnpm package that we install to make diffs great again

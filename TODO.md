# TODO

A place where ideas come to die.

- add acceptance criteria for the generated code
    - every kind is represented
    - think of the fail conditions and document them
- consider how best to include design first, test driven, agentic development
  into your process
- can AI write a good description of the kanban requests?
- add reading time estimate to all my posts except for the recipes
- make sure there is a **hard stop** before the generated program is built and
  copied to the home folder
- kanban program to track time loosely - mostly just 'add time in hours' to the
  time passed field
- would it be simple enough to have it note which kanban i am working on, then
  when i finish add the time. it could use some scratch file for tracking. add
  that to .gitignore - in fact a whole .scratch folder can be used
- a 'monthly' skill that can be run that can just check all the content, tighten
  it up, fix issues, etc
- SPEC.md file that lays out every data structure needed. Use open ddl we use in
  vintage parts. Alternatively, each spec is it's own YAML file in the /data
  folder. There is a way to output those into docs as well as raw code.

# Issues

Should I make it an issue tracker. See Pocock or other implementations for
inspiration and implementation.

I think i would prefer to keep a local ticket system instead:

- benefits: fast, easy, full disclosure to the AI and users
- cons: can't be used by outsiders, unless they do a pull request and no-one is
  doing that.
- could sync with git issues?

# Planning

Missing from archetypes is:

Plan.md, a document that lays out the planning process Architecture, might be
super of the technical spec, plan Architecture decisions, which stack,
languages, hardware, deployment system, etc Audit? Project planning, timeliness,
estimates, costs, staff assigned, etc Decisions, a list of key decisions with an
emphasis on why. Justify each decision, offer references and research

Drill right back into the whole process.

These documents will be getting read by ai keeping a permanent record.

Need a top level document that explains every document and links to it. Point ai
at the document as the root of the project. The single source of truth about our
intent.

# Decisions

Cement the methodology used for keeping Architecture Decisions Records (ADR) for
the project. The record should preserve the edict of the decision and optionally
the 'why', though that is mostly useful for humans, so it could go in a place
where the AI won't be wasting KV cache reading it.

---
name: refine-requirements
description:
    Examine a single kanban card and suggest how its requirements can be
    improved so the language is specific, unambiguous, concise, and precise.
    Makes suggestions only; never edits the card.
---

# Goal

Examine one kanban card in this repository and suggest improvements to how its
requirements are worded. The aim is language that is **specific, unambiguous,
concise, and precise** — a reader (or a future implementer) should be able to
tell exactly what is being asked and how they would know it is done.

You propose improvements. You do not edit any card unless the user explicitly
asks you to apply the changes.

# Input

The user names the card to examine, usually by its ID (e.g. `rq-005`) or its
path (`content/kanban/requests/rq-005-polish-codeblock-copy.md`).

- If given a path, use it.
- If given an ID prefix (e.g. `rq-005`), locate the card with
  `find content/kanban -name "<id>*.md"`.
- If no card is named, list the cards under `content/kanban/` and ask which one
  to examine.

Examine exactly one card per invocation.

# Procedure

1. **Read the card in full.** Look at the front matter (`title`, `description`,
   and the `params` block), the summary before `<!--more-->`, and the body after
   it.

2. **Explore the concepts.** Before judging the wording, make sure you actually
   understand what the requirement is about. Check related code, shortcodes,
   partials, content, or docs in this repository. If the card refers to a
   general technical concept (a browser API, a Hugo feature, an image pipeline,
   a design pattern, ...), research it — use primary documentation where
   practical — so your suggested phrasing is grounded in what the thing actually
   is and how it actually works.

3. **Evaluate the wording against four tests:**
    - **Specific** — names concrete subjects, objects, and outcomes instead of
      abstractions ("the copy button in each codeblock", not "the clipboard").
    - **Unambiguous** — a careful reader can find only one reasonable
      interpretation; no "some", "a bit", "etc", or unspecified quantities.
    - **Concise** — says the full requirement in the fewest words that keep it
      unambiguous; cuts filler and restatement.
    - **Precise** — measurable or checkable where possible (browser list,
      element count, file location, duration format), and verifiable: it is
      clear what state means "done".

4. **Report findings.** For each problem, name the exact current wording, say
   which test(s) it fails and why, and give a rewritten alternative. Suggest
   improvements for:
    - the `title`
    - the `description` (keep it within 50 characters)
    - the summary before `<!--more-->`
    - the body / task list after `<!--more-->`

    Structure the report per field, and end with a clean consolidated draft of
    the proposed wording for the card's requirement text. Do not propose changes
    to `params` data values (stage, status, times, dependencies) unless the
    wording itself depends on them.

# Output discipline

- Quote the current wording verbatim before proposing a replacement.
- Keep every proposed sentence at or near plain sentence case and imperative or
  "should" form, consistently, across the card.
- Never edit the file. End by asking whether the user wants the suggested
  wording applied to the card.

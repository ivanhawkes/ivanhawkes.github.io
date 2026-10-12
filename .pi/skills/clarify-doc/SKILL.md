---
name: clarify-doc
description:
    Improve the prose and factual accuracy of a project document. Use when asked
    to "clarify", "clean up", "tighten", or "make accurate" a doc (e.g.,
    README.md), or to remove stale change logs from one.
argument-hint: '<path or URL of the target document>'
---

# clarify-doc

One parameter: a path (or bare filename) of a document in the working folder, or
a URL pointing to one. That document is the only file this skill edits.

## Phase 1 — Resolve the target

1. If the argument is a local path or filename, resolve it against the working
   folder. A bare name matching exactly one file is fine; if it matches several,
   list the candidates and ask which one.
2. If the argument is a URL:
    - If it points to a file in this repo (e.g., a GitHub link), use the local
      copy instead.
    - Otherwise fetch it (`curl -sL <url> > /tmp/clarify-doc-target.md`) and
      treat that as the target. State at approval time that changes can only be
      applied to the local copy, and ask where to write it.
3. Read the target in full — it is a document, not a codebase.

## Phase 2 — Audit against the project

Verify every factual claim in the document against the repo:

- Claims about files, scripts, flags, paths, ports, models, or hardware → check
  the actual file or run one bounded command (`| head -50`).
- Claims you cannot verify → mark them "unverified" and flag them. Do not
  silently keep or delete them.

Collect findings in five buckets:

1. **Ambiguous language** — words with multiple readings ("it", "this",
   "usually", "should", vague quantities).
2. **Ambiguous ideas** — concepts stated but not defined, or whose intent is
   unclear.
3. **Wrong information** — statements contradicted by the repo (cite the
   contradicting evidence).
4. **Missing information** — facts a reader needs that the document omits
   (prerequisites, failure modes, where things live).
5. **Stale change logs** — changelog or agent-notes entries describing issues
   already fixed or workarounds no longer in use.

Also flag prose that is not terse: filler, hedging, repetition, passive
constructions that hide the actor.

## Phase 3 — Propose (do not edit yet)

Present:

- A numbered list of proposed changes, one per finding: what to change, why, and
  (for factual fixes) the evidence.
- The rewritten document, or only the changed sections if it is long.

Then stop and wait for explicit approval. Do not modify the target before the
user approves. If the user approves only part, apply only that part.

## Phase 4 — Apply

1. Apply all approved changes in one pass (one `edit` call with multiple
   entries, or a full rewrite via `write` if most of the document changes).
2. Re-read the file to confirm it matches what was approved.
3. If the file is tracked by git, commit it with a short message
   (`docs: clarify <file>`).

## Rules

- Never edit the target before approval.
- Every factual correction must cite its evidence (a file path or command
  output).
- Keep the document's structure and headings unless the user asks to
  restructure; this skill fixes prose and facts, not organization.
- Do not add sections beyond what the missing-information findings justify.
- Preserve code blocks, commands, and configuration verbatim unless they are
  factually wrong.

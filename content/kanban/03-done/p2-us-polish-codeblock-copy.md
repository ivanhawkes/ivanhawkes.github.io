---
title: 'Polish Codeblock'
description: 'Modern, sleek layout for every code block'
date: '2026-04-28'
author: Ivan Hawkes
params:
    due: 2026-10-01
    completionDate: '2026-10-25'
    dependencies: null
    references:
        - p2-us-code-to-clipboard
---

The code block becomes one sleek card: bar, chip, copy button, field.

<!--more-->

The clipboard path is sound and is kept. Verified against built output
(`hugo build -D` of a probe page holding every fence form): the text
`copy-codeblock.ts` writes is byte-identical to the fenced source for plain
blocks, `linenos=true`, `linenos=table`, `hl_lines`, tab-indented,
trailing-space, and `file=` blocks, and the line-number column is never
included, because Chroma carries each line's newline inside its `.cl` span. The
styling around that path is what fails.

## Current State

- [x] `render-codeblock.html` and `_partials/codeblock.html` hold the same
      markup twice; the render hook never calls the partial, so every change is
      written twice and drifts.
- [x] The shell carries `container`, so it inherits Tailwind's container
      max-widths **and** the unlayered `.container` rule in `layout.css`
      (`border: 1px solid var(--border)`, `padding: min(2em, 10%)`,
      `border-radius: 1em`, `margin-bottom: 20px`, which beats `mb-8`). A code
      block is therefore a framed card with 10 % padding inside a frame, capped
      at 40rem by `sm:w-120 md:w-160` and never filling the column.
- [x] Colours are literal Tailwind greys, not the token layer: `bg-gray-600`
      bar, `bg-gray-300 dark:bg-slate-700` file band,
      `border-gray-200 dark:border-gray-800`, `fill="#FFFFFF"` icon.
      `bg-gray-600` (#4b5563) is the same in both schemes, and the `Copy` label
      inherits the page foreground: about 1.9:1 on the grey bar in the light
      scheme, so the label is close to invisible there.
- [x] The bar is `flex h-10 w-full justify-between` holding a 1.5rem icon at the
      left, the label in the middle, and a dead `h-7 w-full` div on the right.
      The whole 10rem-tall row is `.copy-button`, so any click in it copies, and
      the `id`s `codeblock-NNN` / `codeblock-button-NNN` are dead weight: the
      script selects `.code` and `.copy-button` by class.
- [x] The control is a `div`, not a `button`: no tab stop, no accessible name,
      no Enter/Space, no focus ring. `eleButton.innerText = 'Copied!'`
      overwrites the `<p>`, so the icon never changes, and each click stacks a
      fresh 2 second timer that can revert the label early.
- [x] `details="true"` is broken: both templates emit
      `<details><summary>…</summary></details>` and then the block **beside**
      it, so nothing collapses and the print control's "open every closed
      `details`" pass in `site-header.ts` has nothing to open.
- [x] `.highlight` sets `overflow: scroll`, painting both scrollbars
      permanently, and `font-size: 1rem`; `--code-font-family` is read by
      `syntax-highlight.css` and defined nowhere, so the family is inherited by
      accident.
- [x] Syntax palette audit against the `#282c34` field (WCAG 2.2 AA needs
      4.5:1): `.nt` 1.64, `.go` 1.47, `.ln`/`.lnt` 3.50, the `.err`/`.kc`/`.ne`
      /`.nl`/`.gd`/`.gr`/`.gs`/`.gu` group 3.52, the `.na`/`.nv`/`.o`/`.ow`
      /`.kn`/`.kp` group 4.29. The last two groups are `vulcan` colours that
      were tuned for a light field.

## Target Design

One card, `overflow: hidden` and `border-radius: var(--radius)`, full column
width, hairline border, `--shadow-sm`, 1.5rem above and 2rem below:

- **Bar**, 44px, `--code-bar` surface, hairline bottom edge: file name (mono,
  0.875rem, ellipsised with the full path in `title`), a language chip
  (uppercase, 0.6875rem, `letter-spacing: 0.05em`, `--radius-sm`, the same
  overline chip as `.brand-mark` and `.footer-copy`), and the copy button at the
  right, `margin-left: auto`.
- **Chip text** is the extension of `file`, else the fence language, mapped to a
  display name (`cpp` → C++, `bash` → Bash, `dosbatch` → Batch, `xml` → HTML,
  `gotmpl` → Go Template, `md` → Markdown, `text` → Text); with no file and no
  language it reads Text.
- **Copy button**, a real `<button type="button">`: 32px tall, icon plus label,
  `--radius-sm`, `--code-hover` on hover, 180ms ease-out colour transition,
  `:focus-visible` ring 2px `--code-focus` at 2px offset,
  `aria-label="Copy <file> code to clipboard"`. Two inline SVGs (copy, check)
  and a `.is-copied` class swap icon and label, while a visually-hidden
  `role="status"` region in the bar announces "Code copied to clipboard", and
  `.is-failed` carries "Copy failed". Below 480px the label is dropped and the
  button is icon-only, at least 44px square on coarse pointers.
- **Field**, `--code-bg` (#282c34, kept in both schemes: the `vulcan` palette is
  built for a dark field, and a dark code card in a light page is the convention
  GitHub and Vercel set): `overflow-x: auto` only, 0.75rem/1rem padding,
  `font-size: 0.875rem`, `line-height: 1.6`, `tab-size: 4`, gutter numbers
  right-aligned with a hairline rule and `user-select: none`.
- **Colours come from tokens** added to `tokens.css` (`--code-bg`, `--code-bar`,
  `--code-bar-text`, `--code-bar-muted`, `--code-chip`, `--code-chip-text`,
  `--code-hover`, `--code-focus`, `--code-border`, `--code-gutter`,
  `--code-font-family: var(--font-mono)`), each declared light first, dark in
  `.dark`, and paired through `light-dark()` in the `@supports` block, with the
  print and `forced-colors` blocks of the component stylesheet flattening them.
- **Contrast fixes** in `syntax-highlight.css`, all measured on `#282c34`: `.nt`
  `#7ee0a8` (8.7:1), `.go`/`.ln`/`.lnt` `#9aa3ad` (5.5:1), the red group
  `#ef8a97` (5.8:1), the purple group `#cf96d6` (6.0:1). Bar text `#dfe3e6`
  (9.7:1), chip text `#cfd6dd` (8.6:1), muted label `#aab2bb` (5.9:1), focus
  ring `#48c9b0` (6.1:1).
- **Details** collapses the whole card: `<details>` wraps bar and field, with a
  `--surface-2` summary row carrying a chevron that rotates 90° when open,
  `list-style: none` markers, and the `summary` text as supplied.
- **Scripts off** hides the copy button, as
  `html:not([data-theme]) #theme-switch` hides the scheme switch.
- **Print** keeps the card: `.codeblock`, `.highlight`, `.code`, `.chroma`,
  `.copy-button` and `button` are the hooks `print.css` already uses, so the bar
  prints white with `#9a9a9a` rules, the button disappears, and the collapsed
  blocks reach the paper once `details` works. No `h1`-`h6` element goes in the
  bar, leaving the one-`h1`-per-page check untouched.

## Work

- [x] Rewrite `_partials/codeblock.html` to the markup above, and reduce
      `_markup/render-codeblock.html` to attribute parsing plus a partial call.
      Keep the attribute contract intact: `file`, `copy` (default true),
      `details`, `open`, `summary`, `trim`.
- [x] Drop the dead `codeblock-NNN` / `codeblock-button-NNN` ids from the
      templates and the `print-code` shortcode; the script selects by class, and
      the shortcode's filename-derived ids collide when one data file is printed
      twice.
- [x] Fix `details` to wrap the card in both templates, and style
      `.codeblock-details` and `.codeblock-summary`.
- [x] Add `be-best/assets/css/codeblock.css` (the pattern of `table.css`,
      `footer.css`): component classes `.codeblock`, `.codeblock-bar`,
      `.codeblock-name`, `.codeblock-lang`, `.codeblock-copy`,
      `.codeblock-details`, `.codeblock-summary`, the reduced-motion and
      `forced-colors` blocks, imported by `main.css` ahead of `print.css`.
- [x] Add the `--code-*` tokens to `tokens.css`, keeping the four resolution
      paths that file already documents (light, `.dark`, `light-dark()`, print,
      forced colours), and map `--font-code` in `@theme inline`.
- [x] Rewrite the copy control in `copy-codeblock.ts`: bind to the real button,
      guard a missing `navigator.clipboard` with a hidden-textarea fallback for
      insecure origins, one timer per button cleared on re-click, the
      `.is-copied` class and the announced result, and a reported failure state
      instead of a console line. The text extraction is kept, and widened: the
      numbering column is skipped wherever it sits (`.ln`, `.lnt`, `.linenos`,
      `.ln_table`, `.lnt_table`, so inline numbering is excluded as table
      numbering always was), and a code element holding bare text, which is what
      Chroma emits for a language it has no lexer for, is copied whole instead
      of empty.
- [x] Move the surface, scrollbar, size and family rules out of `.highlight` in
      `syntax-highlight.css` into `codeblock.css`, define `--code-font-family`
      for real, and land the contrast colours listed above.
- [x] Highlight markdown fences: map `md` to Chroma's `markdown` lexer instead
      of `text`, and keep `text`/plaintext unhighlighted.
- [x] Update `print.css` for the bar (white surface, `#9a9a9a` rules, button
      removed) in both the `@media print` block and the `html.print-mode`
      preview, and drop its now-false comment about a fixed 160 column width.
- [x] Re-state the presentation in the specifications: the codeblock sentence in
      `content/specification/functional/index.md`, and the render-hook,
      print-chrome and width passages in
      `content/specification/technical/index.md`.

A finding, not a task: `{hl_lines=[2,3]}` in a fence's attributes produces no
`.hl` element in Hugo 0.166, so the band styles apply to highlighted lines only
when `hl_lines` is set in the site or page configuration. The fence attribute
changes nothing in the built markup, and the copy text of such a block is the
source, as the criterion requires.

## Acceptance Criteria

The checks below are run against built output and against `be-best/`; the
clipboard text is checked by replaying the script's extraction over the built
markup of a probe page holding every fence form. The criteria that need a
browsing context - real clicks, the clipboard in three browsers, the widths, the
paper, and the page without scripts - were checked by hand on the served site.

- [x] The literal greys, the fixed widths and the dead ids are gone:
      `grep -rE 'bg-gray-600|bg-gray-300|sm:w-120|md:w-160' be-best/layouts/`
      prints nothing, and so does the same for `codeblock-button-`.
- [x] The markup exists once, in the partial:
      `grep -c 'class="codeblock"' be-best/layouts/_markup/` is 0.
- [x] In built output the card runs bar, file name, language chip, copy button,
      in that order; the bar is `.codeblock-bar`, the button is a real
      `<button type="button">` with an `aria-label` and the `.copy-button` hook,
      and no `h1`-`h6` element sits inside the card.
- [x] Clicking, Enter and Space on the button all copy; the icon and label
      change to the copied state, are announced, and revert once, about 2s
      later, whatever the click pattern. The bar outside the button does not
      copy.
- [x] On the probe page the clipboard text equals the fenced source exactly for
      the plain, `file=`, `linenos=true`, `linenos=table`, `hl_lines`,
      tab-indented, trailing-space and `text` cases in Chrome, Firefox and
      Safari, with no line numbers, and `http://` origins copy through the
      fallback.
- [x] Every fenced block fills the content column at 320, 768, 1280 and 1920px;
      long lines scroll in the field only, with no vertical scrollbar and no
      inner frame or 10 % padding.
- [x] In both schemes the bar text, chip, label and focus ring clear 4.5:1 (bar
      text 9.7:1, chip 6.3:1, label 9.7:1, focus ring 6.1:1, the answer colours
      7.8:1 copied and 5.2:1 failed, all of them 5.4:1 or better on the hover
      and pressed surfaces) and every `.chroma` token class used by the corpus
      (cpp, bash, xml, yaml, dosbatch, json, basic, text) clears 4.5:1 on the
      field. The 21 token classes the corpus produces measure 5.0:1 to 8.7:1;
      the line numbers, which are decoration and are never selected, sit at
      4.0:1 on the `hl_lines` band.
- [x] `details="true"` renders the card inside `<details>`, collapsed by default
      and open with `open="true"`, keyboard operable, and the print control
      opens it so the code reaches the paper, where the card is one white block
      with no copy control.
- [x] A page whose root carries no `data-theme` shows no copy button and every
      block reads normally.
- [x] `pnpm run test` passes, including clean `test:html`, the one-`h1` check
      and `test:kanban`, and `npx stylelint "be-best/assets/css/*.css"` is clean
      under the theme's own config. `pnpm stylelint "**/*.css"` is not a gate
      this repository meets: it also lints the generated stylesheet, and
      Tailwind's output has carried 968 of those complaints since before this
      card, 1027 with this card's file added.

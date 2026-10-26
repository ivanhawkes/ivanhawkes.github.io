// The codeblock card's copy control.
//
// The card is rendered by be-best/layouts/_partials/codeblock.html, which
// places a real button in the bar: the browser puts it in the tab order and
// answers Enter and Space, so this script only has to handle the click.
//
// The text is taken from the highlighted markup, not from the page's visible
// text: Chroma writes every line as one element that carries its own newline,
// so the text nodes of the code element concatenate back into the source. The
// highlighting spans add nothing of their own, the numbering column is skipped
// wherever it sits, and a block whose language Chroma has no lexer for holds
// plain text, which is the source too.

const COPY_LABEL = 'Copy';
const COPIED_LABEL = 'Copied';
const FAILED_LABEL = 'Copy failed';

// How long the control keeps its answer before it asks again.
const REVERT_DELAY = 2000;

// One timer per button, cleared when the button is pressed again, so a visitor
// who clicks twice is never served the first click's revert early.
const revertTimers = new WeakMap<HTMLButtonElement, number>();

function codeElement(field: HTMLElement): HTMLElement | null {
    // A block with a line-number column is a table: the numbers in the first
    // cell, the code in the last.
    const cells = field.querySelectorAll<HTMLElement>('.lntd');

    if (cells.length > 0) {
        return cells[cells.length - 1].querySelector<HTMLElement>('code');
    }

    return field.querySelector<HTMLElement>('code');
}

// The numbering column, in the cells of a table, in the inline spans, and in
// the div a block numbered inline and in a table is laid out in.
const GUTTER_SELECTOR = '.ln, .lnt, .linenos, .ln_table, .lnt_table';

// The text of a node, with the numbering column left out: the numbers are not
// code, are not selected on screen, and do not travel to the clipboard.
function textOf(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
    }

    const element = node as HTMLElement;

    if (element.matches(GUTTER_SELECTOR)) {
        return '';
    }

    let text = '';
    for (const child of Array.from(element.childNodes)) {
        text += textOf(child);
    }

    return text;
}

// The source text of a code block, or null when the block holds no code.
export function codeText(block: HTMLElement): string | null {
    const field = block.querySelector<HTMLElement>('.code');

    if (field === null) {
        return null;
    }

    const code = codeElement(field);

    if (code === null) {
        return null;
    }

    return textOf(code);
}

// An origin that is not a secure context has no clipboard API, so the text
// travels through a field put on the page just long enough to be selected.
function copyThroughField(text: string): boolean {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    document.body.appendChild(field);
    field.select();

    let copied: boolean;
    try {
        copied = document.execCommand('copy');
    } catch {
        copied = false;
    }

    field.remove();

    return copied;
}

async function copyTextToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);

            return true;
        } catch {
            // The visitor refused, or the page is not focused: the legacy path
            // has nothing to add to either answer.
            return false;
        }
    }

    return copyThroughField(text);
}

// Copies the text of a code block to the clipboard, reporting whether the
// clipboard took it.
export async function copyCodeToClipboard(
    block: HTMLElement
): Promise<boolean> {
    const text = codeText(block);

    if (text === null) {
        console.error(
            "Failed to copy the code block. Couldn't find the code element.",
            block
        );

        return false;
    }

    return copyTextToClipboard(text);
}

function showResult(
    button: HTMLButtonElement,
    status: HTMLElement | null,
    copied: boolean
) {
    const label = button.querySelector<HTMLElement>('.codeblock-copy-label');
    button.classList.remove('is-copied', 'is-failed');
    button.classList.add(copied ? 'is-copied' : 'is-failed');

    if (label !== null) {
        label.textContent = copied ? COPIED_LABEL : FAILED_LABEL;
    }

    // The bar's live region: the icon and the label change for the eye, and
    // this says the same thing for a screen reader.
    if (status !== null) {
        status.textContent = copied
            ? 'Code copied to clipboard'
            : 'Copy failed';
    }

    const timer = revertTimers.get(button);
    if (timer !== undefined) {
        window.clearTimeout(timer);
    }

    revertTimers.set(
        button,
        window.setTimeout(() => {
            button.classList.remove('is-copied', 'is-failed');

            if (label !== null) {
                label.textContent = COPY_LABEL;
            }

            if (status !== null) {
                status.textContent = '';
            }
        }, REVERT_DELAY)
    );
}

function wireUpCopyButtons(block: HTMLElement) {
    const button = block.querySelector<HTMLButtonElement>('.codeblock-copy');

    // A block rendered with copy=false has no control: that is the point of
    // the attribute, not a fault to report.
    if (button === null) {
        return;
    }

    const status = block.querySelector<HTMLElement>('.codeblock-copy-status');

    button.addEventListener('click', () => {
        copyCodeToClipboard(block).then((copied) => {
            showResult(button, status, copied);
        });
    });
}

const codeblocks = document.querySelectorAll<HTMLElement>('.codeblock');

if (codeblocks.length > 0) {
    codeblocks.forEach(wireUpCopyButtons);
}

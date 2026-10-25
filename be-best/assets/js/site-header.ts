/* The top bar's own behaviour: the elevation that appears once the page has
   moved, the overflow menu that keeps the row inside the bar, and the search
   box that searches this site.

   None of them is a scroll listener. The bar watches a probe above it with an
   IntersectionObserver, and the row watches its own width with a
   ResizeObserver, so neither costs the page a frame. */

const MORE_WIDTH = 96;

const header = document.getElementById('site-header');
const sentinel = document.getElementById('header-sentinel');
const list = document.getElementById('nav-list');
const more = document.getElementById('nav-more');
const moreList = document.querySelector<HTMLElement>('#nav-panel-more ul');
const search = document.getElementById('site-search') as HTMLFormElement | null;
const printButton = document.getElementById('print-page');

const bar = window.matchMedia('(min-width: 1024px)');

/* Elevation after the first four pixels of scroll: the probe leaves the
   viewport, and the bar gains its shadow. No probe, no observer, no shadow -
   the bar is usable flat. */
const initElevation = () => {
    if (!header || !sentinel || typeof IntersectionObserver === 'undefined') {
        return;
    }

    const observer = new IntersectionObserver(
        ([entry]) => {
            header.classList.toggle('is-elevated', !entry.isIntersecting);
        },
        // The bar stays flat for the first few pixels of scroll.
        { rootMargin: '-4px 0px 0px 0px' }
    );

    observer.observe(sentinel);
};

/* The overflow menu: the entries the bar has no room for move into a "More"
   panel, in order, so the row never scrolls sideways and no label is clipped.
   In the drawer every entry is in the list, where there is room for all. */
const initOverflow = () => {
    if (!list || !more || !moreList) {
        return;
    }

    const restore = (entries: HTMLElement[]) => {
        entries.forEach((entry) => {
            list.insertBefore(entry, more);
        });
    };

    /* The last entry of the row is the one with no room to its right: the
       stylesheet hangs its panel from its right edge. */
    const markEdge = () => {
        const entries = Array.from(
            list.querySelectorAll(':scope > .nav-item')
        ).filter((entry) => entry !== more);

        entries.forEach((entry, index) => {
            entry.classList.toggle(
                'nav-item--edge',
                index === entries.length - 1
            );
        });
    };

    const layout = () => {
        // The row holds the entries that fit, in order, and the panel holds
        // the rest: reading both lists in that order gives every entry back in
        // the order the menu defines.
        const entries = Array.from(list.children)
            .concat(Array.from(moreList.children))
            .filter((entry) => entry !== more) as HTMLElement[];

        // In the drawer, and with no bar to measure, every entry is listed.
        if (!bar.matches) {
            restore(entries);
            more.hidden = true;
            markEdge();

            return;
        }

        // Measure with every entry in the row: an entry parked in the overflow
        // panel has no width to measure.
        restore(entries);

        const available = list.clientWidth - MORE_WIDTH;
        let used = 0;
        let overflowing = -1;

        entries.forEach((entry, index) => {
            used += entry.offsetWidth;

            if (overflowing < 0 && used > available) {
                overflowing = index;
            }
        });

        if (overflowing < 0) {
            more.hidden = true;
            markEdge();

            return;
        }

        entries.slice(overflowing).forEach((entry) => {
            moreList.appendChild(entry);
        });

        more.hidden = false;
        markEdge();
    };

    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(layout).observe(list);
    }

    bar.addEventListener('change', layout);
    window.addEventListener('load', layout);

    // A label's width settles when the web font arrives, so lay out again.
    if (document.fonts) {
        document.fonts.ready.then(layout);
    }

    layout();
};

/* The search box: a Google search, scoped to this site. The scope is prefixed
   to the query on submit, which is what a site search needs and what a visitor
   typing a phrase expects. Without scripts the box still searches Google. */
const initSearch = () => {
    if (!search) {
        return;
    }

    const scope = search.dataset.scope;

    if (!scope) {
        return;
    }

    search.addEventListener('submit', () => {
        const field = search.elements.namedItem('q');

        if (!(field instanceof HTMLInputElement)) {
            return;
        }

        const query = field.value.trim();

        if (query && !query.startsWith('site:')) {
            field.value = `site:${scope} ${query}`;
        }
    });
};

/* Print: the sheet. The control asks the driver for paper, and puts the paper
   on the screen while the dialog is open, so the reader sees the sheet the
   driver will render - the top bar, the drawer and the rest of the chrome are
   gone, and the column is plain black on white. print.css carries the
   presentation, scoped to the print medium for the driver and to html.print-mode
   on screen.

   Paper has one colour scheme, and the screen has the visitor's. The medium
   resets the palette tokens in tokens.css; a preview has no medium to reset, so
   it puts the dark class away for as long as the sheet is on screen and puts it
   back afterwards.

   A closed details element renders nothing at all, so no rule can print it: the
   collapsible codeblocks are opened for the sheet and shut again once it has
   left. Both the button and the browser's own flow (Ctrl+P) are handled, and
   the print media query is the signal every driver sends. */

const root = document.documentElement;

/* The sheet is on screen. One driver announces it several times, so the sheet
   is laid out once and put away once. */
let showing = false;

/* The scheme the screen had before the sheet, so the page comes back as it
   was left. */
let wasDark = false;

/* The elements the control opened, so they go back as they were. */
let opened: HTMLDetailsElement[] = [];

const openDetails = () => {
    opened = Array.from(
        document.querySelectorAll<HTMLDetailsElement>('details:not([open])')
    );

    opened.forEach((details) => {
        details.open = true;
    });
};

const closeDetails = () => {
    opened.forEach((details) => {
        details.open = false;
    });

    opened = [];
};

const setPreview = (on: boolean) => {
    root.classList.toggle('print-mode', on);
    printButton?.setAttribute('aria-pressed', on ? 'true' : 'false');
};

const showSheet = () => {
    if (showing) {
        return;
    }

    showing = true;

    openDetails();

    wasDark = root.classList.contains('dark');
    root.classList.remove('dark');

    setPreview(true);
};

const hideSheet = () => {
    if (!showing) {
        return;
    }

    showing = false;

    root.classList.toggle('dark', wasDark);
    wasDark = false;

    setPreview(false);
    closeDetails();
};

const initPrint = () => {
    if (!printButton) {
        return;
    }

    printButton.addEventListener('click', () => {
        // The sheet is on screen before the dialog opens, so the preview the
        // driver shows is built from the page as printed.
        showSheet();
        window.print();
    });

    const printing = window.matchMedia('print');

    /* The keyboard flow (Ctrl+P, Cmd+P) gets the same sheet as the button, and
       the sheet is put away when the dialog closes. */
    printing.addEventListener('change', (event) => {
        if (event.matches) {
            showSheet();
        } else {
            hideSheet();
        }
    });

    // The media query is not fired everywhere; the print events are.
    window.addEventListener('beforeprint', showSheet);
    window.addEventListener('afterprint', hideSheet);

    // Escape leaves a preview no dialog was opened from.
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && showing) {
            hideSheet();
            printButton.focus();
        }
    });
};

export const initSiteHeader = () => {
    initElevation();
    initOverflow();
    initSearch();
    initPrint();
};

// Initialize the top bar on page load.
initSiteHeader();

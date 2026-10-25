/* The navigation: the dropdown and flyout panels of the top bar, the drawer
   below 1024 pixels, and the keyboard and pointer behaviour they share.

   One list serves both shapes, so the same panel is a dropdown under a top bar
   entry, a flyout beside a nested one, and an accordion section in the drawer.
   Every panel is a child of its entry, so closing, roving and trapping all walk
   the DOM from the focused element; nothing is duplicated to be kept in step.

   CSS opens a panel on hover and on keyboard focus, which is how the menu
   behaves with scripts off. This script adds the state a click leaves behind,
   the aria-expanded values, the keys, and the drawer's focus handling. */

const BAR_QUERY = '(min-width: 1024px)';
const bar = window.matchMedia(BAR_QUERY);

const root = document.documentElement;

const header = document.getElementById('site-header');
const nav = document.getElementById('primary-nav');
const topList = document.getElementById('nav-list');
const toggle = document.getElementById('nav-toggle');
const scrim = document.getElementById('nav-scrim');

const CONTROL =
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* The entry an element belongs to. */
const itemOf = (element: Element): HTMLElement | null =>
    element.closest<HTMLElement>('.nav-item');

/* A panel is on screen when its entry is on screen: the list is in the bar, in
   the drawer, or parked inside the overflow menu. */
const onScreen = (element: HTMLElement) => element.getClientRects().length > 0;

const panelOf = (item: HTMLElement) =>
    item.querySelector<HTMLElement>(':scope > .nav-panel');

const triggerOf = (item: HTMLElement) =>
    item.querySelector<HTMLElement>(':scope > .nav-trigger');

const isOpen = (item: HTMLElement) => item.classList.contains('is-open');

const openItem = (item: HTMLElement) => {
    item.classList.add('is-open');
    triggerOf(item)?.setAttribute('aria-expanded', 'true');
};

const closeItem = (item: HTMLElement) => {
    item.classList.remove('is-open');
    triggerOf(item)?.setAttribute('aria-expanded', 'false');
};

/* The entries whose panels are open and reachable, deepest first, so Escape
   leaves the innermost panel before the outer ones. */
const openItems = (): HTMLElement[] =>
    Array.from(nav.querySelectorAll<HTMLElement>('.nav-item.is-open'))
        .filter((item) => {
            const panel = panelOf(item);
            return panel ? onScreen(panel) : false;
        })
        .reverse();

const closeAll = (keep?: HTMLElement) => {
    openItems().forEach((item) => {
        if (keep && keep.contains(item)) {
            return;
        }

        closeItem(item);
    });
};

/* Closing the panels beside one that opens: the bar shows one panel at a time. */
const closeSiblings = (item: HTMLElement) => {
    const list = item.parentElement;

    if (!list) {
        return;
    }

    Array.from(list.children).forEach((sibling) => {
        if (sibling !== item && isOpen(sibling as HTMLElement)) {
            closeItem(sibling as HTMLElement);
        }
    });
};

/* The controls of the level an element sits in: the list of its siblings, not
   the entries nested below them. */
const levelControls = (element: Element): HTMLElement[] => {
    const list = element.closest('ul');

    if (!list) {
        return [];
    }

    return Array.from(list.children)
        .map((entry) => entry.firstElementChild as HTMLElement | null)
        .filter((control): control is HTMLElement => control !== null);
};

const focusables = (scope: ParentNode): HTMLElement[] =>
    Array.from(scope.querySelectorAll<HTMLElement>(CONTROL)).filter(onScreen);

const focusEdge = (controls: HTMLElement[], edge: 'first' | 'last') => {
    const target =
        edge === 'first' ? controls[0] : controls[controls.length - 1];

    target?.focus();

    return target !== undefined;
};

/* Roving the level with the arrow keys: from the last entry to the first. */
const rove = (
    element: Element,
    direction: 'next' | 'previous',
    event: KeyboardEvent
) => {
    const controls = levelControls(element);
    const current = controls.indexOf(element as HTMLElement);

    if (controls.length === 0 || current < 0) {
        return;
    }

    const step = direction === 'next' ? 1 : -1;
    const next = (current + step + controls.length) % controls.length;

    controls[next].focus();
    event.preventDefault();
};

/* Opening an entry and moving into its panel. */
const enter = (item: HTMLElement, edge: 'first' | 'last' = 'first') => {
    const panel = panelOf(item);

    if (!panel) {
        return false;
    }

    openItem(item);
    closeSiblings(item);

    return focusEdge(focusables(panel), edge);
};

/* The drawer: the list below 1024 pixels, where there is no room for a bar. */

const drawerOpen = () => root.classList.contains('nav-open');

const openDrawer = () => {
    root.classList.add('nav-open', 'nav-scroll-lock');

    nav.setAttribute('role', 'dialog');
    nav.setAttribute('aria-modal', 'true');
    nav.setAttribute('aria-label', 'Site menu');
    nav.setAttribute('tabindex', '-1');

    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close the site menu');

    // The path to the current page opens, so its section is where the visitor
    // starts; everything else stays a section they can open in place.
    Array.from(
        nav.querySelectorAll<HTMLElement>('.nav-item[data-trail]')
    ).forEach(openItem);

    const first = focusables(nav)[0];

    (first ?? nav).focus();
};

const closeDrawer = (returnFocus = true) => {
    root.classList.remove('nav-open', 'nav-scroll-lock');

    nav.removeAttribute('role');
    nav.removeAttribute('aria-modal');
    nav.setAttribute('aria-label', 'Primary');
    nav.removeAttribute('tabindex');

    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open the site menu');

    closeAll();

    if (returnFocus) {
        toggle.focus();
    }
};

/* The deepest open panel an element sits in, its entry's trigger, and the
   panel's own list. */
const panelContext = (element: Element) => {
    const panel = element.closest<HTMLElement>('.nav-panel');
    const item = panel ? itemOf(panel) : null;

    if (!panel || !item) {
        return null;
    }

    return { panel, item, trigger: triggerOf(item) };
};

const wireUp = () => {
    /* A trigger opens its panel, on its own, and closes the ones beside it. A
       link is a navigation: it leaves the menu behind, open or not. */
    header.addEventListener('click', (event) => {
        const target = event.target as Element;
        const trigger = target.closest<HTMLElement>('.nav-trigger');

        if (trigger) {
            const item = itemOf(trigger);

            if (item) {
                closeSiblings(item);

                if (isOpen(item)) {
                    closeItem(item);
                } else {
                    openItem(item);
                }
            }

            return;
        }

        if (target.closest('a')) {
            closeAll();

            if (drawerOpen()) {
                closeDrawer(false);
            }
        }
    });

    /* Keys, from the focused entry outwards: the arrows rove the level, go into
       a panel and come back out of one. */
    nav.addEventListener('keydown', (event) => {
        const target = event.target as HTMLElement;
        const item = itemOf(target);

        if (!item) {
            return;
        }

        const context = panelContext(target);
        const inDrawer = drawerOpen();
        const inBar = !inDrawer && bar.matches;

        /* The focus trap: Tab stays inside the drawer while it is open. */
        if (event.key === 'Tab' && inDrawer) {
            const controls = focusables(nav);

            if (controls.length > 0) {
                const first = controls[0];
                const last = controls[controls.length - 1];
                const active = document.activeElement as HTMLElement | null;

                if (
                    event.shiftKey &&
                    (active === first || !nav.contains(active))
                ) {
                    last.focus();
                    event.preventDefault();
                } else if (!event.shiftKey && active === last) {
                    first.focus();
                    event.preventDefault();
                }
            }

            return;
        }

        switch (event.key) {
            case 'Escape':
                if (inDrawer) {
                    closeDrawer();
                } else if (context) {
                    closeItem(context.item);
                    context.trigger?.focus();
                } else {
                    // A top level entry, in focus with a panel open below it.
                    closeAll();
                }

                break;

            case 'ArrowDown':
                if (context) {
                    rove(target, 'next', event);
                } else if (inBar) {
                    // Into the panel below the entry, at its first link.
                    if (enter(item, 'first')) {
                        event.preventDefault();
                    }
                }

                break;

            case 'ArrowUp':
                if (context) {
                    rove(target, 'previous', event);
                } else if (inBar) {
                    if (enter(item, 'last')) {
                        event.preventDefault();
                    }
                }

                break;

            case 'Home':
                if (context) {
                    if (focusEdge(levelControls(target), 'first')) {
                        event.preventDefault();
                    }
                }

                break;

            case 'End':
                if (context) {
                    if (focusEdge(levelControls(target), 'last')) {
                        event.preventDefault();
                    }
                }

                break;

            case 'ArrowRight':
                // A nested entry opens to the right of its parent's panel; in
                // the bar the arrows walk along the row of entries.
                if (context && panelOf(item)) {
                    if (enter(item, 'first')) {
                        event.preventDefault();
                    }
                } else if (inBar) {
                    rove(target, 'next', event);
                }

                break;

            case 'ArrowLeft':
                if (context) {
                    closeItem(context.item);
                    context.trigger?.focus();
                    event.preventDefault();
                } else if (inBar) {
                    rove(target, 'previous', event);
                }

                break;

            default:
                break;
        }
    });

    /* Clicking away closes the panels, as does leaving the page. */
    document.addEventListener('pointerdown', (event) => {
        const target = event.target as Element;

        if (!header.contains(target) && !nav.contains(target)) {
            closeAll();
        }
    });

    /* Escape closes the drawer from anywhere, including the scrim and the bar
       around it. */
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && drawerOpen()) {
            closeDrawer();
        }
    });

    toggle.addEventListener('click', () => {
        if (drawerOpen()) {
            closeDrawer();
        } else {
            openDrawer();
        }
    });

    scrim.addEventListener('click', () => {
        if (drawerOpen()) {
            closeDrawer();
        }
    });

    /* Widening past the bar's width leaves no drawer to hold open, and no
       panel that should stay shut. */
    bar.addEventListener('change', () => {
        if (drawerOpen()) {
            closeDrawer(false);
        }

        closeAll();
    });
};

export const initNavMenu = () => {
    if (!header || !nav || !topList || !toggle || !scrim) {
        return;
    }

    wireUp();
};

// Initialize the navigation on page load.
initNavMenu();

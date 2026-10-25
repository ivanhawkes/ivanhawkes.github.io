/* The colour scheme: the visitor's setting and the scheme it resolves to.
   Shared by the head script (theme-init.ts, which runs before the first
   paint) and the switch button (dark-mode.ts). */

export type Theme = 'light' | 'dark' | 'system';

/* The settings, in the order the button cycles through them. */
export const THEME_ORDER = ['light', 'dark', 'system'];

export const STORAGE_KEY = 'theme';

/* The key written before the scheme had three settings: 'enabled' was dark,
   'disabled' was light. Migrated on the next read. */
const LEGACY_KEY = 'darkMode';

const isTheme = (value) =>
    value === 'light' || value === 'dark' || value === 'system';

/* The stored setting, defaulting to following the operating system. */
export const readTheme = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (isTheme(stored)) {
            return stored;
        }

        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy === 'enabled') {
            return 'dark';
        }
        if (legacy === 'disabled') {
            return 'light';
        }
    } catch {
        /* Storage is unavailable: private mode, or cookies disabled. */
    }

    return 'system';
};

/* Remember the setting so the next visit starts with the same scheme. */
export const storeTheme = (theme) => {
    try {
        localStorage.setItem(STORAGE_KEY, theme);
        localStorage.removeItem(LEGACY_KEY);
    } catch {
        /* The scheme is not remembered, but the page still changes. */
    }
};

/* The setting the switch selects next. */
export const nextSetting = (theme) =>
    THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];

export const prefersDark = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches;

/* The scheme in effect. The system setting follows the operating system. */
export const isDark = (theme) =>
    theme === 'dark' || (theme === 'system' && prefersDark());

/* Record the setting and the resolved scheme on the root element. The
   data-theme attribute selects the icon on the switch; the dark class drives
   Tailwind's dark: variant and the token overrides in the stylesheet. */
export const applyTheme = (theme) => {
    const root = document.documentElement;

    root.dataset.theme = theme;
    root.classList.toggle('dark', isDark(theme));

    return theme;
};

/* Apply the stored setting, as early in the page as possible. */
export const initTheme = () => applyTheme(readTheme());

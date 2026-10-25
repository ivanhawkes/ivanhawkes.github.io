/* The colour scheme switch: one button, three settings. Each press cycles
   light, dark and system; the choice is remembered, and system follows the
   operating system as it changes. */

import {
    applyTheme,
    initTheme,
    nextSetting,
    readTheme,
    storeTheme,
} from './theme-mode.ts';

const LABELS = {
    light: 'Light theme',
    dark: 'Dark theme',
    system: 'System theme, following the operating system',
};

// The label names the scheme in effect and the one the next press selects.
const labelFor = (theme) =>
    `${LABELS[theme]} in effect. Activate to select the ${LABELS[nextSetting(theme)]}.`;

export const initDarkMode = () => {
    const button = document.getElementById('theme-switch');
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    let theme = initTheme();

    const render = () => {
        if (button) {
            button.setAttribute('aria-label', labelFor(theme));
        }
    };

    render();

    if (button) {
        button.addEventListener(
            'click',
            () => {
                theme = applyTheme(nextSetting(theme));
                storeTheme(theme);
                render();
            },
            false
        );
    }

    // Only the system setting depends on the operating system, so re-applying
    // the stored setting is enough to pick up a change.
    media.addEventListener('change', () => {
        theme = applyTheme(readTheme());
        render();
    });
};

// Initialize the colour scheme on page load.
initDarkMode();

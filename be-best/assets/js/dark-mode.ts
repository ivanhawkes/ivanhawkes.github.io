// Enable dark mode by adding the 'dark' class to the body
// and updating localStorage.
const enableDarkMode = () => {
    document.body.classList.add('dark');
    localStorage.setItem('darkMode', 'enabled');
};

// Disable dark mode by removing the 'dark' class from the body
// and updating localStorage.
const disableDarkMode = () => {
    document.body.classList.remove('dark');
    localStorage.setItem('darkMode', 'disabled');
};

// Initialize dark mode based on user preference.
export const initDarkMode = () => {
    const themeSwitch = document.getElementById('theme-switch');

    if (themeSwitch) {
        themeSwitch.addEventListener(
            'click',
            () => {
                const darkMode = localStorage.getItem('darkMode') || 'disabled';

                if (darkMode !== 'enabled') {
                    enableDarkMode();
                } else {
                    disableDarkMode();
                }
            },
            false
        );

        const darkMode = localStorage.getItem('darkMode') || 'disabled';
        if (darkMode !== 'enabled') {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    }
};

// Initialize dark mode on page load.
initDarkMode();

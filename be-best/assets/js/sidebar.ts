const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

export function toggleSidebar() {
    sidebar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');

    closeAllSubMenus();
}

export function toggleSubMenu(button) {
    const subMenu = button.nextElementSibling;

    if (!subMenu.classList.contains('show')) {
        closeAllSubMenus(button);
    }

    const opened = subMenu.classList.toggle('show');
    button.classList.toggle('rotate', opened);
    button.setAttribute('aria-expanded', String(opened));

    if (sidebar.classList.contains('close')) {
        sidebar.classList.toggle('close');
        toggleButton.classList.toggle('rotate');
    }
}

// Collapse every open sub-menu, keeping the ancestors of `keep` open so that
// nested sub-menus stay reachable.
export function closeAllSubMenus(keep) {
    Array.from(sidebar.getElementsByClassName('show')).forEach((ele) => {
        if (keep && ele.contains(keep)) {
            return;
        }

        ele.classList.remove('show');

        const button = ele.previousElementSibling;
        if (button) {
            button.classList.remove('rotate');
            button.setAttribute('aria-expanded', 'false');
        }
    });
}

export const initSidebar = () => {
    if (toggleButton) {
        toggleButton.addEventListener(
            'click',
            () => {
                toggleSidebar();
            },
            false
        );
    }

    Array.from(sidebar.getElementsByClassName('dropdown-btn')).forEach(
        (ele) => {
            ele.addEventListener(
                'click',
                () => {
                    toggleSubMenu(ele);
                },
                false
            );
        }
    );
};

// Initialize sidebar on page load.
initSidebar();

const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

export function toggleSidebar() {
    sidebar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');

    closeAllSubMenus();
}

export function toggleSubMenu(button) {
    if (!button.nextElementSibling.classList.contains('show')) {
        closeAllSubMenus();
    }

    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');

    if (sidebar.classList.contains('close')) {
        sidebar.classList.toggle('close');
        toggleButton.classList.toggle('rotate');
    }
}

export function closeAllSubMenus() {
    Array.from(sidebar.getElementsByClassName('show')).forEach((ele) => {
        ele.classList.remove('show');
        ele.previousElementSibling.classList.remove('rotate');
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

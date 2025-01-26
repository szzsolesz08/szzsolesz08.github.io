/**
 * Toggles the navigation menu open and closed.
 * Adds or removes the 'open' class from the menu and 'menu-open' class from the body.
 */
function openNav() {
    const menu = $("#myNav");
    if (!menu.hasClass("open")) {
        menu.addClass("open");
        $("body").addClass("menu-open");
    } else {
        menu.removeClass("open");
        $("body").removeClass("menu-open");
    }
}

/**
 * Initializes the document ready event handler.
 * Sets up the event listener for clicking outside the menu.
 */
$(document).ready(function() {
    /**
     * Handles the document click event.
     * Closes the menu when clicking outside the menu and not on the menu icon.
     * @param {Event} event The click event.
     */
    $(document).click(function(event) {
        const menu = $("#myNav");
        const menuIcon = $(".menu-icon");
        
        // If menu is open and click is outside menu and not on menu icon
        if (menu.hasClass("open") && 
            !menu.is(event.target) && 
            menu.has(event.target).length === 0 &&
            !menuIcon.is(event.target)) {
            menu.removeClass("open");
            $("body").removeClass("menu-open");
        }
    });
});

/**
 * Toggles between dark and light modes.
 * Adds or removes the 'light-mode' class from the body and updates the theme toggle button text.
 */
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    
    const themeToggleButton = document.getElementById('themeToggle');
    if (body.classList.contains('light-mode')) {
        themeToggleButton.textContent = 'Switch to Dark Mode';
    } else {
        themeToggleButton.textContent = 'Switch to Light Mode';
    }
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    
    const themeToggleButton = document.getElementById('themeToggle');
    if (body.classList.contains('light-mode')) {
        themeToggleButton.textContent = 'Switch to Dark Mode';
    } else {
        themeToggleButton.textContent = 'Switch to Light Mode';
    }
}
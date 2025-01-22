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
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

// Close menu when clicking outside
$(document).ready(function() {
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
$(document).ready(function() {
    /**
     * Array of programming languages with their names and corresponding image paths.
     * @type {Array<{name: string, image: string}>}
     */
    const languages = [
        { name: 'C', image: 'images/c.png' },
        { name: 'C++', image: 'images/cpp.png' },
        { name: 'C#', image: 'images/csharp.png' },
        { name: 'Java', image: 'images/java.png' },
        { name: 'Python', image: 'images/python.png' },
        { name: 'HTML', image: 'images/html.png' },
        { name: 'CSS', image: 'images/css.png' },
        { name: 'JavaScript', image: 'images/javascript.png' },
        { name: 'PHP', image: 'images/php.png' },
        { name: 'Laravel', image: 'images/laravel.png' }
    ];

    // Pagination functionality
    const itemsToShow = Math.min(5, Math.floor($("#listContainer").width() / 190));
    let startIndex = 0;

    /**
     * Updates the display of the language list in the UI.
     * Clears the current items and populates the list with languages based on the current index.
     */
    function updateDisplay() {
        const $list = $("#languageList");
        $list.empty(); // Clear current items

        // Get current items to display
        const currentItems = [];
        for (let i = 0; i < itemsToShow; i++) {
            const index = (startIndex + i) % languages.length;
            currentItems.push(languages[index]);
        }

        // Create and append list items
        currentItems.forEach(lang => {
            const $li = $('<li>').addClass('language-item active');
            const $img = $('<img>').attr({
                src: lang.image,
                alt: lang.name + ' Programming'
            });
            const $p = $('<p>').text(lang.name);
            
            $li.append($img, $p);
            $list.append($li);
        });
    }

    /**
     * Event handler for the "Next Page" button click.
     * Increments the start index and updates the display of languages.
     */
    $("#nextPage").click(() => {
        startIndex = (startIndex + 1) % languages.length;
        updateDisplay();
    });

    /**
     * Event handler for the "Previous Page" button click.
     * Decrements the start index and updates the display of languages.
     */
    $("#prevPage").click(() => {
        startIndex = (startIndex - 1 + languages.length) % languages.length;
        updateDisplay();
    });

    // Initial display
    updateDisplay();
});

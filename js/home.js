$(document).ready(function() {
    // Languages array
    const languages = [
        { name: 'C', image: 'images/c.png' },
        { name: 'C++', image: 'images/cpp.png' },
        { name: 'C#', image: 'images/csharp.png' },
        { name: 'Java', image: 'images/java.png' },
        { name: 'Python', image: 'images/python.png' },
        { name: 'HTML', image: 'images/html.png' },
        { name: 'CSS', image: 'images/css.png' },
        { name: 'JavaScript', image: 'images/javascript.png' },
        { name: 'PHP', image: 'images/php.png' }
    ];

    // Pagination functionality
    const itemsToShow = 5;
    let startIndex = 0;

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

    $("#nextPage").click(() => {
        startIndex = (startIndex + 1) % languages.length;
        updateDisplay();
    });

    $("#prevPage").click(() => {
        startIndex = (startIndex - 1 + languages.length) % languages.length;
        updateDisplay();
    });

    // Initial display
    updateDisplay();
});

/**
 * Creates a project card HTML element based on the provided project data.
 * @param {Object} project - The project data to create a card for.
 * @returns {string} The HTML string for the project card.
 */
function createProjectCard(project) {
    const card = $("<div/>", {'class': 'project-card'});
    const imageDiv = $("<div/>", {'class': 'project-image'}).append(
        $("<img>", { 
            src: project.image,
            alt: project.name + ' preview'
        })
    );
    const contentDiv = $("<div/>", {'class': 'project-content'}).append(
        $("<h3/>", {'class': 'project-title'}).text(project.name),
        $("<p/>", {'class': 'project-description'}).text(project.description),
        $("<div/>", {'class': 'project-tech'}).append(
            project.technologies.map(tech => $("<span/>", {'class': 'tech-tag'}).text(tech))
        ),
        $("<div/>", {'class': 'project-links'}).append(
            $("<a/>", {'class': 'project-link', target: '_blank'}).attr('href', project.github).append(
                $("<i/>", {'class': 'fab fa-github'}).append("View on GitHub")
            )
        )
    );
    card.append(imageDiv, contentDiv);
    return card;
}

/**
 * An array of project objects, each containing project data.
 * @type {Object[]}
 */
const projects = [
    {
        name: "Servers and Clients",
        description: "A collection of server and client implementations showcasing network programming and communication protocols.",
        image: "../images/servers.png",
        technologies: ["Python", "Networking", "Socket Programming"],
        github: "https://github.com/szzsolesz08/ServersAndClients"
    },
    {
        name: "Yogi Bear Game",
        description: "A fun game implementation featuring Yogi Bear, demonstrating game development and graphics programming skills.",
        image: "../images/yogibear.png",
        technologies: ["Java", "Swing", "Game Development"],
        github: "https://github.com/szzsolesz08/YogiBear"
    },
    {
        name: "Sheep Farm",
        description: "A farm management simulation game where players manage a sheep farm, showcasing object-oriented programming.",
        image: "../images/sheepfarm.png",
        technologies: ["Java", "OOP", "Game Development"],
        github: "https://github.com/szzsolesz08/SheepFarm"
    },
    {
        name: "Go Game",
        description: "An implementation of the classic Go board game, featuring AI opponents and multiplayer capabilities.",
        image: "../images/gogame.png",
        technologies: ["Java", "Swing", "Game Development"],
        github: "https://github.com/szzsolesz08/GoGame"
    },
    {
        name: "Company App",
        description: "A comprehensive company management application for handling employees, departments, and business operations.",
        image: "../images/company.png",
        technologies: ["PHP", "Database", "Laravel", "Web Development"],
        github: "https://github.com/szzsolesz08/CompanyApp"
    },
    {
        name: "Pokemon Game PHP",
        description: "A web-based Pokemon game implementation using PHP, demonstrating web development and game mechanics.",
        image: "../images/pokemon.png",
        technologies: ["PHP", "HTML", "CSS", "Game Development"],
        github: "https://github.com/szzsolesz08/pokegame_php"
    },
    {
        name: "Super Adventure",
        description: "A role-playing game featuring character development, combat systems, and adventure elements.",
        image: "../images/superadventure.png",
        technologies: ["C#", "OOP", "Game Development"],
        github: "https://github.com/szzsolesz08/SuperAdventure"
    },
    {
        name: "Portfolio Website",
        description: "A modern, responsive portfolio website showcasing my projects and skills. Features include dynamic project cards, contact form integration, and smooth animations.",
        image: "../images/portfolio.png",
        technologies: ["HTML", "CSS", "JavaScript", "jQuery", "Formspree"],
        github: "https://github.com/szzsolesz08/PortfolioWebsite"
    }
];

/**
 * Initializes the project grid and populates it with project cards.
 */
$(document).ready(function() {
    const projectsGrid = $('.projects-grid');
    projects.forEach(project => {
        projectsGrid.append(createProjectCard(project));
    });
});

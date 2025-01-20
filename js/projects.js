// Function to create a project card
function createProjectCard(project) {
    return `
        <div class="project-card">
            <div class="project-image">
                <img src="${project.image}" alt="${project.name} preview">
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.name}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `
                        <span class="tech-tag">${tech}</span>
                    `).join('')}
                </div>
                <div class="project-links">
                    <a href="${project.github}" class="project-link" target="_blank">
                        <i class="fab fa-github"></i> View on GitHub
                    </a>
                </div>
            </div>
        </div>
    `;
}

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
        technologies: ["Java", "JavaFX", "Game Development"],
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
        technologies: ["Java", "AI", "Game Development"],
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
        name: "RPG Game",
        description: "A role-playing game featuring character development, combat systems, and adventure elements.",
        image: "../images/rpg.png",
        technologies: ["C#", "Game Development", "OOP"],
        github: "https://github.com/szzsolesz08/RPG_Game"
    },
    {
        name: "Portfolio Website",
        description: "A modern, responsive portfolio website showcasing my projects and skills. Features include dynamic project cards, contact form integration, and smooth animations.",
        image: "../images/portfolio.png",
        technologies: ["HTML", "CSS", "JavaScript", "jQuery", "Formspree"],
        github: "https://github.com/szzsolesz08/PortfolioWebsite"
    }
];

// Render projects
$(document).ready(function() {
    const projectsGrid = $('.projects-grid');
    projects.forEach(project => {
        projectsGrid.append(createProjectCard(project));
    });
});

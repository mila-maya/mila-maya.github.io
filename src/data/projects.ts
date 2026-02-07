import type { Project } from '@/types/contentful.types';

// Add your projects here - just edit this file to add/update projects!
export const projects: Project[] = [
  {
    title: "React Portfolio Website",
    slug: "react-portfolio",
    description: "A modern, interactive personal portfolio built with React, TypeScript, and Vite. Features multi-page routing, responsive design, and automated deployment.",
    technologies: ["React", "TypeScript", "Vite", "CSS Modules"],
    githubUrl: "https://github.com/mila-maya/mila-maya.github.io",
    liveUrl: "https://mila-maya.github.io",
    displayOrder: 1
  },
  {
    title: "Example Project 2",
    slug: "example-project-2",
    description: "This is a placeholder for your second project. Replace this with your actual project description.",
    technologies: ["JavaScript", "Node.js", "Express"],
    githubUrl: "https://github.com/yourusername/project",
    displayOrder: 2
  },
  {
    title: "Example Project 3",
    slug: "example-project-3",
    description: "Another example project. You can add as many projects as you want by adding more objects to this array.",
    technologies: ["Python", "Django", "PostgreSQL"],
    liveUrl: "https://example.com",
    displayOrder: 3
  }
];

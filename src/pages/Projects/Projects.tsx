import SEO from '@components/common/SEO/SEO';
import ProjectCard from '@components/projects/ProjectCard/ProjectCard';
import { useProjects } from '@hooks/useProjects';
import styles from './Projects.module.css';

const Projects = () => {
  const { projects, loading, error } = useProjects();

  return (
    <>
      <SEO
        title="Projects"
        description="Explore my portfolio of web applications, open-source projects, and software development work."
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>My Projects</h1>
          <p className={styles.description}>
            A collection of my work including web applications, open-source
            contributions, and personal projects.
          </p>
        </header>

        {loading ? (
          <div className={styles.loading}>Loading projects...</div>
        ) : error ? (
          <div className={styles.error}>
            Error loading projects. Please try again later.
          </div>
        ) : projects.length > 0 ? (
          <div className={styles.grid}>
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            No projects available yet. Check back soon!
          </div>
        )}
      </div>
    </>
  );
};

export default Projects;

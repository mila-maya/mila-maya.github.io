import type { Project } from '@/types/contentful.types';
import { Link } from 'react-router-dom';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const showLinks = !project.hideLinks && !project.cardUrl;
  const cardContent = (
    <>
      {project.featuredImage ? (
        <img
          src={project.featuredImage.url}
          alt={project.featuredImage.title || project.title}
          className={styles.image}
        />
      ) : (
        <div className={styles.imagePlaceholder}>{project.title.charAt(0)}</div>
      )}

      <h3 className={styles.title}>{project.title}</h3>
      <p className={styles.description}>{project.description}</p>

      {project.technologies && project.technologies.length > 0 && (
        <div className={styles.technologies}>
          {project.technologies.map((tech, index) => (
            <span key={index} className={styles.tech}>
              {tech}
            </span>
          ))}
        </div>
      )}

      {showLinks && (
        <div className={styles.links}>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              View on GitHub {'->'}
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Live Demo {'->'}
            </a>
          )}
        </div>
      )}
    </>
  );

  if (!project.cardUrl) {
    return <div className={styles.card}>{cardContent}</div>;
  }

  if (project.cardUrl.startsWith('/')) {
    return (
      <Link
        to={project.cardUrl}
        className={`${styles.card} ${styles.clickableCard}`}
        aria-label={`Open project ${project.title}`}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <a
      href={project.cardUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.card} ${styles.clickableCard}`}
      aria-label={`Open project ${project.title}`}
    >
      {cardContent}
    </a>
  );
};

export default ProjectCard;

import type { Project } from '@/types/content.types';
import { Link } from 'react-router-dom';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
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

      {(project.cardUrl || project.githubUrl || project.liveUrl) && (
        <div className={styles.links}>
          {project.cardUrl && project.cardUrl.startsWith('/') && (
            <Link to={project.cardUrl} className={`${styles.link} ${styles.primaryLink}`}>
              Open Case Study {'->'}
            </Link>
          )}
          {project.cardUrl && !project.cardUrl.startsWith('/') && (
            <a
              href={project.cardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.link} ${styles.primaryLink}`}
            >
              Open Project {'->'}
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Source {'->'}
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

  return <article className={styles.card}>{cardContent}</article>;
};

export default ProjectCard;

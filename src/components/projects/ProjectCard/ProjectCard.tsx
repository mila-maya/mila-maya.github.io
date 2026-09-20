import type { Project } from '@/types/content.types';
import { Link } from 'react-router-dom';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
}

/**
 * The whole card is the link.
 *
 * The link sits on the title and its ::after covers the card, rather than the
 * card being wrapped in an anchor, which keeps the heading a heading.
 *
 * Nothing else on the card is a link and nothing spells out what clicking does.
 * A card that says "Open the toolbox" underneath is telling the reader what a
 * card already does, and Source belongs on the project's own page, which is
 * where it already is.
 */
const ProjectCard = ({ project }: ProjectCardProps) => {
  const isInternal = project.cardUrl?.startsWith('/') ?? false;

  const heading = project.cardUrl ? (
    isInternal ? (
      <Link to={project.cardUrl} className={styles.cardLink}>
        {project.title}
      </Link>
    ) : (
      <a
        href={project.cardUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cardLink}
      >
        {project.title}
      </a>
    )
  ) : (
    project.title
  );

  return (
    <article className={styles.card}>
      {project.featuredImage ? (
        <img
          src={project.featuredImage.url}
          alt={project.featuredImage.title || project.title}
          className={styles.image}
        />
      ) : (
        <div className={styles.imagePlaceholder}>{project.title.charAt(0)}</div>
      )}

      <h3 className={styles.title}>{heading}</h3>
      {/* The fuller line when a project has one, the bare attribute otherwise. */}
      {(project.provenance?.summary ?? project.origin) && (
        <p className={styles.origin}>{project.provenance?.summary ?? project.origin}</p>
      )}
      <p className={styles.description}>{project.description}</p>

      {project.technologies && project.technologies.length > 0 && (
        <div className={styles.technologies}>
          {project.technologies.map((tech) => (
            <span key={tech} className={styles.tech}>
              {tech}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default ProjectCard;

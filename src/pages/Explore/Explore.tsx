import SEO from '@components/common/SEO/SEO';
import PageHeader from '@components/common/PageHeader/PageHeader';
import ProjectCard from '@components/projects/ProjectCard/ProjectCard';
import { pageMeta } from '@/config/routeMeta';
import { useProjects } from '@hooks/useProjects';
import styles from '@/styles/listPage.module.css';

const Explore = () => {
  const { projects, loading, error } = useProjects();

  return (
    <>
      <SEO title="Explore" description={pageMeta.explore.description} />

      <div className={styles.container}>
        <PageHeader title="Explore" description={pageMeta.explore.description} />

        {loading ? (
          <p className={styles.status}>Loading tools...</p>
        ) : error && projects.length === 0 ? (
          <p className={styles.status}>Could not load the tools. Please try again later.</p>
        ) : (
          <div className={styles.grid}>
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Explore;

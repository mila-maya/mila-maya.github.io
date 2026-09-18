import SEO from '@components/common/SEO/SEO';
import PageHeader from '@components/common/PageHeader/PageHeader';
import ProjectCard from '@components/projects/ProjectCard/ProjectCard';
import { useProjects } from '@hooks/useProjects';
import styles from '@/styles/listPage.module.css';

const EXPLORE_DESCRIPTION =
  'Interactive tools you can actually run. Change the inputs, watch the method react, and see where it breaks.';

const Explore = () => {
  const { projects, loading, error } = useProjects();

  return (
    <>
      <SEO title="Explore" description={EXPLORE_DESCRIPTION} />

      <div className={styles.container}>
        <PageHeader title="Explore" description={EXPLORE_DESCRIPTION} />

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

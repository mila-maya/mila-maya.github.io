import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import ProjectCard from '@components/projects/ProjectCard/ProjectCard';
import BlogCard from '@components/blog/BlogCard/BlogCard';
import { useProjects } from '@hooks/useProjects';
import { useBlogPosts } from '@hooks/useBlogPosts';
import styles from './Work.module.css';

const WORK_DESCRIPTION =
  "Projects, tutorials, and thoughts on software development - and everything I'm learning along the way.";

type WorkFilter = 'all' | 'projects' | 'posts';

const hashToFilter = (hash: string): WorkFilter => {
  if (hash === '#projects') return 'projects';
  if (hash === '#posts') return 'posts';
  return 'all';
};

const Work = () => {
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { posts, loading: postsLoading, error: postsError } = useBlogPosts();
  const location = useLocation();
  const [filter, setFilter] = useState<WorkFilter>(hashToFilter(location.hash));

  useEffect(() => {
    setFilter(hashToFilter(location.hash));
  }, [location.hash]);

  const items = useMemo(() => {
    const projectItems = projects.map((project) => ({
      kind: 'project' as const,
      key: `project-${project.slug}`,
      project
    }));

    const postItems = posts.map((post) => ({
      kind: 'post' as const,
      key: `post-${post.slug}`,
      post
    }));

    const allItems = [...projectItems, ...postItems];

    if (filter === 'projects') {
      return allItems.filter((item) => item.kind === 'project');
    }
    if (filter === 'posts') {
      return allItems.filter((item) => item.kind === 'post');
    }
    return allItems;
  }, [projects, posts, filter]);

  const loading = projectsLoading || postsLoading;
  const anyError = projectsError || postsError;
  const hasContent = projects.length > 0 || posts.length > 0;

  return (
    <>
      <SEO title="Work" description={WORK_DESCRIPTION} />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Work</h1>
          <p className={styles.description}>{WORK_DESCRIPTION}</p>
        </header>

        <div className={styles.filters} role="tablist" aria-label="Filter work items">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            className={`${styles.filter} ${filter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'projects'}
            className={`${styles.filter} ${filter === 'projects' ? styles.filterActive : ''}`}
            onClick={() => setFilter('projects')}
          >
            Projects
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'posts'}
            className={`${styles.filter} ${filter === 'posts' ? styles.filterActive : ''}`}
            onClick={() => setFilter('posts')}
          >
            Posts
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading work...</div>
        ) : anyError && !hasContent ? (
          <div className={styles.error}>Error loading content. Please try again later.</div>
        ) : items.length > 0 ? (
          <div className={styles.grid}>
            {items.map((item) => (
              <article key={item.key} className={styles.item}>
                <span className={`${styles.itemTag} ${item.kind === 'project' ? styles.projectTag : styles.postTag}`}>
                  {item.kind === 'project' ? 'Project' : 'Post'}
                </span>
                {item.kind === 'project' ? (
                  <ProjectCard project={item.project} />
                ) : (
                  <BlogCard post={item.post} />
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>No items in this filter yet. Try another view.</div>
        )}

        {anyError && hasContent && (
          <div className={styles.partialError}>
            Some items could not be loaded completely.
          </div>
        )}
      </div>
    </>
  );
};

export default Work;

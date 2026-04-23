import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import PageHeader from '@components/common/PageHeader/PageHeader';
import FilterBar, { type FilterOption } from '@components/common/FilterBar/FilterBar';
import ProjectCard from '@components/projects/ProjectCard/ProjectCard';
import BlogCard from '@components/blog/BlogCard/BlogCard';
import { useProjects } from '@hooks/useProjects';
import { useBlogPosts } from '@hooks/useBlogPosts';
import styles from './ProjectsAndPosts.module.css';

const PROJECTS_AND_POSTS_DESCRIPTION =
  "Projects, tutorials, and thoughts on software development - and everything I'm learning along the way.";

type ContentFilter = 'all' | 'projects' | 'posts';

const FILTER_OPTIONS: FilterOption<ContentFilter>[] = [
  { id: 'all', label: 'All' },
  { id: 'projects', label: 'Projects' },
  { id: 'posts', label: 'Posts' },
];

const hashToFilter = (hash: string): ContentFilter => {
  if (hash === '#projects') return 'projects';
  if (hash === '#posts') return 'posts';
  return 'all';
};

const ProjectsAndPosts = () => {
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { posts, loading: postsLoading, error: postsError } = useBlogPosts();
  const location = useLocation();
  const [filter, setFilter] = useState<ContentFilter>(hashToFilter(location.hash));

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
      <SEO title="Projects & Posts" description={PROJECTS_AND_POSTS_DESCRIPTION} />

      <div className={styles.container}>
        <PageHeader title="Projects & Posts" description={PROJECTS_AND_POSTS_DESCRIPTION} />

        <FilterBar
          options={FILTER_OPTIONS}
          activeId={filter}
          onChange={setFilter}
          ariaLabel="Filter content"
        />

        {loading ? (
          <div className={styles.loading}>Loading content...</div>
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

export default ProjectsAndPosts;

import { useLocation } from 'react-router-dom';
import { resolveMeta, type RouteMeta } from '@/config/routeMeta';
import { siteConfig } from '@/config/site';

type SEOProps = Partial<RouteMeta>;

/**
 * React hoists title, meta and link elements into <head> wherever they are
 * rendered, so this component needs no provider and no helper library. The
 * document shell deliberately carries none of these tags: hoisting appends, so
 * a copy in index.html would show up as a duplicate.
 *
 * The values come from resolveMeta, the same function scripts/prerender.mjs
 * uses, so the rendered page and the static HTML cannot disagree.
 */
const SEO = ({ path, title, description, image, type }: SEOProps) => {
  const location = useLocation();
  const meta = resolveMeta({
    path: path ?? `${location.pathname}${location.search}`,
    title,
    description: description ?? siteConfig.description,
    image,
    type,
  });

  return (
    <>
      <title>{meta.fullTitle}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={meta.url} />

      <meta property="og:type" content={meta.type} />
      <meta property="og:site_name" content={meta.siteName} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:title" content={meta.fullTitle} />
      <meta property="og:description" content={meta.description} />
      {meta.image && <meta property="og:image" content={meta.image} />}

      <meta name="twitter:card" content={meta.image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:url" content={meta.url} />
      <meta name="twitter:title" content={meta.fullTitle} />
      <meta name="twitter:description" content={meta.description} />
      {meta.image && <meta name="twitter:image" content={meta.image} />}
    </>
  );
};

export default SEO;

import { useLocation } from 'react-router-dom';
import { siteConfig } from '@/config/site';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const toAbsoluteUrl = (value: string): string => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${siteConfig.siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

/**
 * React hoists title, meta and link elements into <head> wherever they are
 * rendered, so this component needs no provider and no helper library. The
 * document shell deliberately carries none of these tags: hoisting appends,
 * so a copy in index.html would show up as a duplicate.
 */
const SEO = ({
  title,
  description = siteConfig.description,
  image = siteConfig.defaultShareImage,
  url,
  type = 'website'
}: SEOProps) => {
  const location = useLocation();
  const fullTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} | ${siteConfig.role}`;
  const resolvedUrl = toAbsoluteUrl(url ?? `${location.pathname}${location.search}`);
  const resolvedImage = image ? toAbsoluteUrl(image) : undefined;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={resolvedUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {resolvedImage && <meta property="og:image" content={resolvedImage} />}

      <meta name="twitter:card" content={resolvedImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:url" content={resolvedUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {resolvedImage && <meta name="twitter:image" content={resolvedImage} />}
    </>
  );
};

export default SEO;

import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({
  title = 'Mila - Personal Portfolio',
  description = 'Personal portfolio and blog by Mila - showcasing projects, sharing tips, and building cool stuff.',
  image = '/avatar.jpg',
  url = 'https://mila-maya.github.io',
  type = 'website'
}: SEOProps) => {
  const fullTitle = title === 'Mila - Personal Portfolio' ? title : `${title} | Mila`;

  return (
    <HelmetProvider>
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={url} />
        <meta property="twitter:title" content={fullTitle} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={image} />
      </Helmet>
    </HelmetProvider>
  );
};

export default SEO;

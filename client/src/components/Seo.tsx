import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title?: string;
  description?: string;
  type?: string;
  name?: string;
  image?: string;
  url?: string;
}

export function Seo({
  title,
  description,
  type = 'website',
  name = 'Nishanth Portfolio',
  image,
  url,
}: SeoProps) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://nishanth.qzz.io';
  const fullTitle = title ? `${title} | ${name}` : name;
  const defaultDesc = "I'm Nishanth, a creative developer building digital experiences.";
  const metaDescription = description || defaultDesc;
  const metaImage = image || `${siteUrl}/default-og-image.jpg`; // Fallback image can be updated later
  const metaUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={metaDescription} />
      
      {/* Facebook tags */}
      <meta property='og:type' content={type} />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={metaDescription} />
      <meta property='og:image' content={metaImage} />
      <meta property='og:url' content={metaUrl} />
      <meta property='og:site_name' content={name} />
      
      {/* Twitter tags */}
      <meta name='twitter:creator' content={name} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={metaDescription} />
      <meta name='twitter:image' content={metaImage} />
    </Helmet>
  );
}

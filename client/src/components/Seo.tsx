import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  type?: string;
  name?: string;
  image?: string;
  url?: string;
}

export function Seo({
  title,
  description,
  keywords,
  type = 'website',
  name,
  image,
  url,
}: SeoProps) {
  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => api.get('/public/settings').then((r) => r.data).catch(() => ({})),
    staleTime: 10 * 60 * 1000,
  });

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://nishanth.qzz.io';
  const siteTitle = name || settings?.site_title || 'Nishanth Portfolio';
  const fullTitle = title ? (title.includes(siteTitle) ? title : `${title} | ${siteTitle}`) : siteTitle;
  
  const defaultDesc = "I'm Nishanth, a creative developer building digital experiences.";
  const metaDescription = description || settings?.site_description || defaultDesc;
  const metaKeywords = keywords || settings?.seo_keywords || 'developer, portfolio, react, nodejs, fullstack';
  const metaImage = image || `${siteUrl}/default-og-image.jpg`;
  const metaUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`) : siteUrl;
  const gaId = settings?.google_analytics_id;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      
      {/* Open Graph / Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={siteTitle} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Google Analytics Tag */}
      {gaId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      )}
      {gaId && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
        </script>
      )}
    </Helmet>
  );
}

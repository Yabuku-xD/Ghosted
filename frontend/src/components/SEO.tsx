import { useEffect, useMemo } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const defaultSEO = {
  title: 'Ghosted',
  description: 'Real salary data from 23,000+ companies. Visa sponsorship tracking. H-1B lottery odds. Everything international professionals need to make informed career decisions.',
  keywords: 'H-1B, visa sponsorship, salary data, job search, international talent, lottery calculator, company ratings',
  image: '/og-image.png',
  url: 'https://ghosted.io',
  type: 'website' as const,
};

function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}: SEOProps) {
  const seo = useMemo(() => ({
    browserTitle: defaultSEO.title,
    metaTitle: title ? `${title} | Ghosted` : defaultSEO.title,
    description: description || defaultSEO.description,
    keywords: keywords || defaultSEO.keywords,
    image: image || defaultSEO.image,
    url: url || defaultSEO.url,
    type,
  }), [description, image, keywords, title, type, url]);

  useEffect(() => {
    // Update document title
    document.title = seo.metaTitle;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMeta('title', seo.metaTitle);
    updateMeta('description', seo.description);
    updateMeta('keywords', seo.keywords);

    // Open Graph
    updateMeta('og:title', seo.metaTitle, true);
    updateMeta('og:description', seo.description, true);
    updateMeta('og:image', seo.image, true);
    updateMeta('og:url', seo.url, true);
    updateMeta('og:type', seo.type, true);

    // Twitter
    updateMeta('twitter:title', seo.metaTitle, true);
    updateMeta('twitter:description', seo.description, true);
    updateMeta('twitter:image', seo.image, true);

    return () => {
      // Reset to defaults on unmount
      document.title = defaultSEO.title;
    };
  }, [seo]);

  return null;
}

export default SEO;

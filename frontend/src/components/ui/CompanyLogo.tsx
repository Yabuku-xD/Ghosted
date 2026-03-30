import { useMemo, useState } from 'react';
import { normalizeDomain, buildLogoDevUrl, buildFaviconUrl } from './logoUtils';

interface CompanyLogoProps {
  companyName: string;
  logoUrl?: string;
  website?: string;
  companyDomain?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * CompanyLogo component that prefers first-party logo URLs and falls back
 * to Logo.dev domain or name lookups before a lightweight initial avatar.
 */
export function CompanyLogo({
  companyName,
  logoUrl,
  website,
  companyDomain,
  size = 'md',
  className = '',
}: CompanyLogoProps) {
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-2xl',
  };

  const candidateUrls = useMemo(() => {
    const normalizedDomain = normalizeDomain(companyDomain) || normalizeDomain(website);

    return [
      logoUrl || null,
      buildLogoDevUrl(companyName, normalizedDomain),
      buildFaviconUrl(normalizedDomain),
      buildLogoDevUrl(companyName, null),
    ].filter((value, index, items): value is string => Boolean(value) && items.indexOf(value) === index);
  }, [companyDomain, companyName, logoUrl, website]);

  const imageUrl = candidateUrls[fallbackIndex];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${companyName} logo`}
        className={`${sizeClasses[size]} object-contain bg-white border-2 border-[#1a1a1a] flex-shrink-0 ${className}`}
        loading="lazy"
        onError={() => setFallbackIndex((current) => current + 1)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center bg-[#f5f5f0] border-2 border-[#1a1a1a] font-display font-bold text-[#1a1a1a] flex-shrink-0 ${className}`}
      aria-label={`${companyName} logo`}
    >
      {companyName.charAt(0).toUpperCase()}
    </div>
  );
}

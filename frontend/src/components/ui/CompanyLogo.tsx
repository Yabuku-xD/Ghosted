import { useMemo, useState } from 'react';

interface CompanyLogoProps {
  companyName: string;
  logoUrl?: string;
  website?: string;
  companyDomain?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LOGO_DEV_KEY = import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY;

function normalizeDomain(value?: string): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = value.includes('://') ? new URL(value) : new URL(`https://${value}`);
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return value.replace(/^www\./, '').toLowerCase();
  }
}

function buildLogoDevUrl(companyName: string, companyDomain?: string | null): string | null {
  if (!LOGO_DEV_KEY) {
    return null;
  }

  const query = new URLSearchParams({
    token: LOGO_DEV_KEY,
    size: '128',
    format: 'png',
    retina: 'true',
    fallback: companyName.slice(0, 1).toUpperCase(),
  });

  if (companyDomain) {
    return `https://img.logo.dev/${encodeURIComponent(companyDomain)}?${query.toString()}`;
  }

  return `https://img.logo.dev/name/${encodeURIComponent(companyName)}?${query.toString()}`;
}

function buildFaviconUrl(companyDomain?: string | null): string | null {
  if (!companyDomain) {
    return null;
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(companyDomain)}&sz=128`;
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

export function getCompanyLogoUrl(companyName: string, website?: string, logoUrl?: string): string | null {
  const normalizedDomain = normalizeDomain(website);
  return logoUrl || buildLogoDevUrl(companyName, normalizedDomain) || buildLogoDevUrl(companyName, null);
}

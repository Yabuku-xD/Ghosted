import { useState } from 'react';

interface CompanyLogoProps {
  companyName: string;
  logoUrl?: string;
  website?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * CompanyLogo component that prefers first-party logo URLs and falls back
 * to a lightweight initial avatar when no reliable image is available.
 */
export function CompanyLogo({
  companyName,
  logoUrl,
  size = 'md',
  className = '',
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-2xl',
  };

  if (logoUrl && !imageError) {
    return (
      <img
        src={logoUrl}
        alt={`${companyName} logo`}
        className={`${sizeClasses[size]} object-contain bg-white border-2 border-[#1a1a1a] flex-shrink-0 ${className}`}
        onError={() => setImageError(true)}
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
  void companyName;
  void website;
  return logoUrl || null;
}

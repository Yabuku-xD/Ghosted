const LOGO_DEV_KEY = import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY;

export function normalizeDomain(value?: string): string | null {
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

export function buildLogoDevUrl(companyName: string, companyDomain?: string | null): string | null {
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

export function buildFaviconUrl(companyDomain?: string | null): string | null {
  if (!companyDomain) {
    return null;
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(companyDomain)}&sz=128`;
}

export function getCompanyLogoUrl(companyName: string, website?: string, logoUrl?: string): string | null {
  const normalizedDomain = normalizeDomain(website);
  return logoUrl || buildLogoDevUrl(companyName, normalizedDomain) || buildLogoDevUrl(companyName, null);
}

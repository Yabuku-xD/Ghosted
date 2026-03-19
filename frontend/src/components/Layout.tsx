import { Link, useLocation } from 'react-router-dom';
import { Building2, TrendingUp, Calculator, Menu, X, Scale, BriefcaseBusiness } from 'lucide-react';
import { useState } from 'react';
import SkipLink from './ui/SkipLink';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/companies', label: 'Companies', icon: Building2 },
    { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
    { to: '/offers', label: 'Offers', icon: TrendingUp },
    { to: '/compare', label: 'Compare', icon: Scale },
    { to: '/predictions', label: 'Predictions', icon: Calculator },
  ];

  const hasLogoDevKey = Boolean(import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Skip Link for Accessibility */}
      <SkipLink targetId="main-content" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b-3 border-border" role="navigation" aria-label="Main navigation">
        <div className="container">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group" aria-label="Ghosted - Home">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-accent text-white flex items-center justify-center border-3 border-border shadow-solid group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-solid-lg transition-all">
                <span className="font-display text-lg sm:text-xl md:text-2xl font-bold" aria-hidden="true">G</span>
              </div>
              <span className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary hidden sm:block">Ghosted</span>
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    aria-current={isActive(link.to) ? 'page' : undefined}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 font-mono text-xs lg:text-sm uppercase tracking-wider transition-all ${
                      isActive(link.to)
                        ? 'bg-secondary border-2 border-border shadow-solid-sm'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <link.icon className="w-4 h-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 border-2 border-border hover:bg-secondary transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t-2 border-border bg-white">
            <div className="container py-4">
              <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive(link.to) ? 'page' : undefined}
                    className={`flex items-center gap-3 px-4 py-3 font-mono text-sm uppercase tracking-wider border-2 ${
                      isActive(link.to)
                        ? 'bg-secondary border-border shadow-solid-sm'
                        : 'border-transparent hover:bg-secondary'
                    }`}
                  >
                    <link.icon className="w-5 h-5" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
              </ul>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main id="main-content" className="flex-1" role="main" tabIndex={-1}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary border-t-3 border-border" role="contentinfo">
        <div className="container py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent text-white flex items-center justify-center border-3 border-border shadow-solid">
                  <span className="font-display text-lg sm:text-xl font-bold" aria-hidden="true">G</span>
                </div>
                <span className="font-display text-xl sm:text-2xl font-bold text-primary">Ghosted</span>
              </div>
              <p className="text-secondary text-xs sm:text-sm max-w-md leading-relaxed">
                Real salary data and visa sponsorship intelligence for international
                professionals. Make informed career decisions with confidence.
              </p>
            </div>

            <div>
              <h4 className="font-mono text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 text-primary font-semibold">Product</h4>
              <nav aria-label="Product links">
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <li><Link to="/companies" className="text-secondary hover:text-accent transition-colors">Companies</Link></li>
                  <li><Link to="/jobs" className="text-secondary hover:text-accent transition-colors">Jobs</Link></li>
                  <li><Link to="/offers" className="text-secondary hover:text-accent transition-colors">Salary Data</Link></li>
                  <li><Link to="/compare" className="text-secondary hover:text-accent transition-colors">Compare</Link></li>
                  <li><Link to="/predictions" className="text-secondary hover:text-accent transition-colors">Predictions</Link></li>
                  <li><Link to="/lottery-calculator" className="text-secondary hover:text-accent transition-colors">Lottery Calculator</Link></li>
                </ul>
              </nav>
            </div>

            <div>
              <h4 className="font-mono text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 text-primary font-semibold">Legal</h4>
              <nav aria-label="Legal links">
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <li><Link to="/privacy" className="text-secondary hover:text-accent transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-secondary hover:text-accent transition-colors">Terms of Service</Link></li>
                </ul>
              </nav>
            </div>
          </div>

          <div className="border-t-2 border-border mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="font-mono text-xs sm:text-sm text-secondary text-center sm:text-left">
              © {new Date().getFullYear()} Ghosted. All rights reserved.
            </p>
            <div className="flex flex-col items-center gap-2 sm:items-end">
              <p className="font-mono text-xs text-secondary text-center sm:text-left">
                Data from Department of Labor & USCIS
              </p>
              {hasLogoDevKey ? (
                <a
                  href="https://logo.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] uppercase tracking-wider text-secondary hover:text-accent transition-colors"
                >
                  Logos provided by Logo.dev
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

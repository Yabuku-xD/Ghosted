import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import SkipLink from './ui/SkipLink';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth initial render
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      <SkipLink targetId="main-content" />
      <Navbar />
      
      <AnimatePresence mode="wait">
        {isReady && (
          <motion.main
            id="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {children}
          </motion.main>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-bg-secondary/30 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-cyan-500 rounded-xl flex items-center justify-center">
                  <span className="font-bold text-lg text-white">G</span>
                </div>
                <span className="font-bold text-xl text-text-primary">Ghosted</span>
              </div>
              <p className="text-text-secondary text-sm max-w-sm mb-6">
                Job intelligence platform for international talent. Make data-driven decisions about your career with evidence-backed insights.
              </p>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 w-fit">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-medium text-accent">Beta</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Platform</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Companies', href: '/companies' },
                  { label: 'Jobs', href: '/jobs' },
                  { label: 'Compare', href: '/compare' },
                  { label: 'Offers', href: '/offers' },
                  { label: 'Predictions', href: '/predictions' },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Legal</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-muted">
              {new Date().getFullYear()} Ghosted. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-text-muted">
              <span>Data from Department of Labor</span>
              <span>•</span>
              <span>Community submissions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Compass, Database, Radar, ShieldCheck } from 'lucide-react';
import Navbar from './Navbar';
import SkipLink from './ui/SkipLink';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="theme-surface min-h-screen bg-bg-primary text-text-primary">
      <SkipLink targetId="main-content" />
      <Navbar />

      <AnimatePresence mode="wait" initial={false}>
        {isReady && (
          <motion.main
            id="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 overflow-x-hidden w-full max-w-full pt-16"
          >
            {children}
          </motion.main>
        )}
      </AnimatePresence>

      <footer className="relative z-10 border-t border-border-light px-4 pb-8 pt-20 sm:px-6 lg:px-8">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
            <div className="space-y-8">
              <span className="site-kicker">Matched signal, not noise</span>
              <div className="space-y-5">
                <h2 className="balanced-text max-w-2xl text-3xl font-black tracking-[-0.04em] text-text-primary sm:text-4xl lg:text-5xl">
                  Ghosted turns ATS sprawl into a clean career operating surface.
                </h2>
                <p className="pretty-text max-w-lg text-base text-text-secondary leading-relaxed sm:text-lg">
                  Explore sponsor companies, ranked jobs, salary evidence, and prediction tools without leaving the same system.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/jobs"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-text-primary px-6 py-3 text-sm font-semibold text-bg-primary transition-transform duration-300 ease-out active:scale-[0.96]"
                >
                  Open live jobs
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/companies"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-text-primary transition-colors duration-300 hover:bg-glass active:scale-[0.96]"
                >
                  Browse companies
                </Link>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {[
                {
                  icon: Compass,
                  title: 'Route quickly',
                  body: 'Find fit-first jobs instead of tabbing through generic boards.',
                },
                {
                  icon: Database,
                  title: 'Read real evidence',
                  body: 'Ground decisions in offers, filings, and live career-site signals.',
                },
                {
                  icon: Radar,
                  title: 'Track sponsorship',
                  body: 'See which companies keep showing up with stronger visa intent.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Stay contextual',
                  body: 'Compare multiple signals before spending time on an application.',
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="group"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition-colors duration-300 group-hover:border-border-accent group-hover:text-accent">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mb-1 text-base font-bold text-text-primary">{title}</h3>
                  <p className="pretty-text text-sm text-text-secondary leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-border-light pt-8 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/" className="transition-colors duration-300 hover:text-text-primary">
                Ghosted
              </Link>
              <Link to="/privacy" className="transition-colors duration-300 hover:text-text-primary">
                Privacy
              </Link>
              <Link to="/terms" className="transition-colors duration-300 hover:text-text-primary">
                Terms
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span>{new Date().getFullYear()} Ghosted</span>
              <span>Department of Labor + community submissions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

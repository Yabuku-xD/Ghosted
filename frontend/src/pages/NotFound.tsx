import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { Button } from '../components/ui';

function NotFound() {
  return (
    <div className="bg-bg-primary min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Visual */}
        <div className="relative mb-8 select-none">
          <div className="text-[160px] sm:text-[180px] font-display font-bold text-text-secondary opacity-[0.06] leading-none tracking-tighter">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-3xl bg-glass backdrop-blur-xl border border-border flex items-center justify-center shadow-lg">
              <Compass className="w-12 h-12 text-accent" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="headline-lg mb-4">Page not found</h1>
        <p className="text-body mb-10">
          The page you're looking for doesn't exist or has moved. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link to="/">
            <Button variant="primary">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Button variant="secondary" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>

        {/* Help Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-text-muted mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Companies', to: '/companies' },
              { label: 'Jobs', to: '/jobs' },
              { label: 'Salary Data', to: '/offers' },
              { label: 'Predictions', to: '/predictions' },
              { label: 'Calculator', to: '/lottery-calculator' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-accent hover:bg-accent/5 border border-border hover:border-border-accent transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
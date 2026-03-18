import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';

function NotFound() {
  return (
    <div className="bg-bg-primary min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Visual */}
        <div className="relative mb-8">
          <div className="text-[180px] font-display font-bold text-secondary opacity-10 leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-accent border-3 border-border flex items-center justify-center">
              <span className="text-6xl">!</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="headline-lg mb-4">Page Not Found</h1>
        <p className="text-secondary mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        <div className="mt-12 pt-8 border-t-2 border-border-light">
          <p className="text-sm text-secondary mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/companies" className="text-accent font-semibold hover:underline text-sm">
              Companies
            </Link>
            <Link to="/offers" className="text-accent font-semibold hover:underline text-sm">
              Salary Data
            </Link>
            <Link to="/predictions" className="text-accent font-semibold hover:underline text-sm">
              Lottery Odds
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
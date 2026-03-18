import { Link } from 'react-router-dom';
import { FileText, Check, AlertTriangle, Scale, Mail, Ban, RefreshCw } from 'lucide-react';

function Terms() {
  return (
    <div className="bg-bg-primary min-h-screen">
      {/* Header */}
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-12">
          <div className="section-marker mb-2">
            <span>Legal</span>
          </div>
          <h1 className="headline-lg">Terms of Service</h1>
          <p className="text-secondary mt-2">Last updated: March 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Agreement Notice */}
          <div className="alert alert-info mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-info flex-shrink-0" />
              <div>
                <p className="font-semibold text-primary">Important Notice</p>
                <p className="text-sm text-secondary mt-1">
                  By using Ghosted, you agree to these terms. Please read them carefully.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Introduction */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">1. Acceptance of Terms</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>
                  Welcome to Ghosted. By accessing or using our platform, you agree to be bound by
                  these Terms of Service and all applicable laws and regulations. If you do not agree
                  with any of these terms, you are prohibited from using or accessing this site.
                </p>
              </div>
            </div>

            {/* Use License */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Check className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">2. Use License</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>Permission is granted to temporarily use Ghosted for personal or commercial purposes. This includes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Viewing company and salary data</li>
                  <li>Using prediction and analysis tools</li>
                  <li>Submitting anonymous salary reports</li>
                  <li>Accessing public company information</li>
                </ul>
                <p className="mt-4">Restrictions:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Reproducing or duplicating material for commercial purposes</li>
                  <li>Using automated systems to scrape data</li>
                  <li>Redistributing content without permission</li>
                </ul>
              </div>
            </div>

            {/* User Accounts */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">3. User Accounts</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>You are responsible for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account</li>
                  <li>All activities under your account</li>
                  <li>Providing accurate information</li>
                  <li>Notifying us of unauthorized access</li>
                </ul>
              </div>
            </div>

            {/* User Content */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">4. User Submissions</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>
                  By submitting salary data or company reviews, you grant Ghosted a non-exclusive,
                  worldwide, royalty-free license to use, analyze, and display aggregated insights
                  derived from your submissions.
                </p>
                <p>
                  We will <strong className="text-primary">never</strong> publicly display your personal
                  information alongside your submissions without explicit consent.
                </p>
              </div>
            </div>

            {/* Prohibited Activities */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Ban className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">5. Prohibited Activities</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>You may not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Submit false or misleading information</li>
                  <li>Attempt to access other users' accounts</li>
                  <li>Interfere with the platform's operation</li>
                  <li>Use the platform for illegal purposes</li>
                  <li>Harass or harm other users</li>
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">6. Disclaimer</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>
                  Ghosted provides data and predictions for informational purposes only. We do not
                  guarantee the accuracy, completeness, or usefulness of any information. Salary data
                  and visa predictions are estimates based on publicly available information and user
                  submissions.
                </p>
                <p>
                  <strong className="text-primary">Use this information at your own risk.</strong> We are
                  not liable for any decisions made based on data from our platform.
                </p>
              </div>
            </div>

            {/* Limitations */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">7. Limitations</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>
                  In no event shall Ghosted or its operators be liable for any damages arising out of
                  the use or inability to use the platform, even if we have been notified of the
                  possibility of such damages.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">8. Contact</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>
                  Questions about the Terms of Service should be sent to:
                </p>
                <div className="bg-secondary p-4 border-2 border-border">
                  <p className="font-mono text-primary">legal@ghosted.io</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t-2 border-border-light flex items-center justify-between">
            <Link to="/privacy" className="text-accent font-semibold hover:underline">
              Privacy Policy
            </Link>
            <Link to="/" className="btn btn-secondary btn-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;
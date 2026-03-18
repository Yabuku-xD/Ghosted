import { Link } from 'react-router-dom';
import { Shield, Mail, Lock, Database, Users, AlertTriangle } from 'lucide-react';

function Privacy() {
  return (
    <div className="bg-bg-primary min-h-screen">
      {/* Header */}
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-12">
          <div className="section-marker mb-2">
            <span>Legal</span>
          </div>
          <h1 className="headline-lg">Privacy Policy</h1>
          <p className="text-secondary mt-2">Last updated: March 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Introduction */}
          <div className="card-static bg-white p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-accent-light border-2 border-accent flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="headline-sm mb-2">Your Privacy Matters</h2>
                <p className="text-secondary">
                  We're committed to protecting your personal information and being transparent
                  about how we collect, use, and share your data.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Data Collection */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">Data We Collect</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>We collect information you provide directly to us:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-primary">Account Information:</strong> Email, name, and password (encrypted)</li>
                  <li><strong className="text-primary">Profile Data:</strong> Company, job title, location (optional)</li>
                  <li><strong className="text-primary">User Submissions:</strong> Salary reports, company reviews</li>
                  <li><strong className="text-primary">Usage Data:</strong> Pages visited, features used</li>
                </ul>
              </div>
            </div>

            {/* Data Usage */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">How We Use Your Data</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and improve our services</li>
                  <li>Send relevant updates and notifications</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Protect against fraud and unauthorized access</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </div>

            {/* Data Protection */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">Data Protection</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>We implement industry-standard security measures:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>End-to-end encryption for sensitive data</li>
                  <li>Secure server infrastructure with regular audits</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Regular security assessments</li>
                </ul>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">Data Sharing</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>We <strong className="text-primary">never sell</strong> your personal data. We only share:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Aggregated, anonymized statistics</li>
                  <li>Data with service providers under strict contracts</li>
                  <li>Information required by law</li>
                </ul>
              </div>
            </div>

            {/* Your Rights */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">Your Rights</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-primary">Access:</strong> Request a copy of your data</li>
                  <li><strong className="text-primary">Correction:</strong> Update or correct your information</li>
                  <li><strong className="text-primary">Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong className="text-primary">Portability:</strong> Export your data in a readable format</li>
                  <li><strong className="text-primary">Opt-out:</strong> Unsubscribe from marketing communications</li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="card-static bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">Contact Us</h2>
              </div>
              <div className="space-y-4 text-secondary">
                <p>
                  For privacy-related inquiries or to exercise your rights, contact us at:
                </p>
                <div className="bg-secondary p-4 border-2 border-border">
                  <p className="font-mono text-primary">privacy@ghosted.io</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t-2 border-border-light flex items-center justify-between">
            <Link to="/terms" className="text-accent font-semibold hover:underline">
              Terms of Service
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

export default Privacy;
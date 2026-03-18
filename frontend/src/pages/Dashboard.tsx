import { useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Clock,
  TrendingUp,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  HardDriveDownload,
} from 'lucide-react';

import { Badge, Button, Card, CardBody, EmptyState, CompanyLogo } from '../components/ui';
import { useToast } from '../components/ui/Toast';
import JobApplicationForm, { type ApplicationFormData } from '../components/JobApplicationForm';
import { useLocalApplications } from '../hooks/useLocalApplications';
import type { JobApplication } from '../types';

const statusConfig: Record<
  string,
  {
    variant: 'accent' | 'warning' | 'success' | 'danger' | 'ghost';
    label: string;
    icon: ComponentType<{ className?: string }>;
  }
> = {
  applied: { variant: 'ghost', label: 'Applied', icon: Clock },
  screening: { variant: 'warning', label: 'Screening', icon: AlertCircle },
  interview: { variant: 'accent', label: 'Interview', icon: AlertCircle },
  offer: { variant: 'success', label: 'Offer', icon: CheckCircle2 },
  accepted: { variant: 'success', label: 'Accepted', icon: CheckCircle2 },
  rejected: { variant: 'danger', label: 'Rejected', icon: XCircle },
  withdrawn: { variant: 'ghost', label: 'Withdrawn', icon: XCircle },
};

function Dashboard() {
  const toast = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { applications, stats, addApplication, removeApplication } = useLocalApplications();

  const handleCreateApplication = async (data: ApplicationFormData) => {
    if (!data.company_id) {
      throw new Error('Select a company from the directory before saving.');
    }

    addApplication({
      company: data.company_id,
      company_name: data.company_name,
      position_title: data.position_title,
      location: data.location,
      salary_range_min: data.salary_range_min,
      salary_range_max: data.salary_range_max,
      status: data.status,
      referral: data.referral,
      notes: data.notes,
    });

    setIsFormOpen(false);
    toast.success('Application added successfully!', 'Saved in this browser');
  };

  const handleRemoveApplication = (application: JobApplication) => {
    removeApplication(application.id);
    toast.success('Application removed.', application.company_name);
  };

  const exportTracker = () => {
    const blob = new Blob([JSON.stringify(applications, null, 2)], {
      type: 'application/json',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'ghosted-tracker.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="bg-bg-primary min-h-screen">
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-8 sm:py-12">
          <div className="header-layout">
            <div>
              <div className="section-marker mb-2">
                <span>No Login Required</span>
              </div>
              <h1 className="headline-lg">Application Tracker</h1>
              <p className="text-secondary mt-3 max-w-2xl">
                Track applications locally in this browser, without creating an account or waiting for auth checks.
              </p>
            </div>
            <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={exportTracker}
                disabled={applications.length === 0}
              >
                <HardDriveDownload className="w-4 h-4" />
                Export
              </Button>
              <Button variant="primary" className="w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Application
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="stat-box-responsive">
            <div className="stat-label">
              <Briefcase className="w-4 h-4 text-accent" />
              Total
            </div>
            <div className="stat-value-responsive">{stats.total}</div>
          </div>

          <div className="stat-box-responsive">
            <div className="stat-label">
              <Clock className="w-4 h-4 text-warning" />
              Active
            </div>
            <div className="stat-value-responsive text-warning">{stats.active}</div>
          </div>

          <div className="stat-box-responsive">
            <div className="stat-label">
              <TrendingUp className="w-4 h-4 text-success" />
              Offers
            </div>
            <div className="stat-value-responsive text-success">{stats.offers}</div>
          </div>

          <div className="stat-box-responsive">
            <div className="stat-label">
              <Building2 className="w-4 h-4 text-accent" />
              Companies
            </div>
            <div className="stat-value-responsive">{stats.companies}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <Card static>
              <CardBody className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="headline-sm">Recent Applications</h2>
                  <Link
                    to="/companies"
                    className="font-mono text-xs sm:text-sm text-accent hover-underline"
                  >
                    Explore Companies
                  </Link>
                </div>

                {stats.recent.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="No applications yet"
                    description="Start tracking your job applications to stay organized. Everything is stored locally on this device."
                    action={
                      <Button variant="primary" className="w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Add Your First Application
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y-2 divide-border-light">
                    {stats.recent.map((app) => {
                      const config = statusConfig[app.status] || statusConfig.applied;
                      const StatusIcon = config.icon;

                      return (
                        <div
                          key={app.id}
                          className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                              <CompanyLogo companyName={app.company_name} size="sm" />
                              <div className="min-w-0">
                                <div className="font-semibold text-primary text-sm sm:text-base truncate">
                                  {app.position_title}
                                </div>
                                <div className="font-mono text-xs sm:text-sm text-secondary truncate">
                                  {app.company_name}
                                  {app.location ? ` • ${app.location}` : ''}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                              <Badge variant={config.variant} size="sm">
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </Badge>
                              <span className="font-mono text-xs text-secondary">
                                {new Date(app.applied_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-secondary">
                              {app.referral ? 'Referral noted' : 'No referral noted'}
                              {app.salary_range_min || app.salary_range_max
                                ? ` • ${[
                                  app.salary_range_min ? `$${app.salary_range_min.toLocaleString()}` : '',
                                  app.salary_range_max ? `$${app.salary_range_max.toLocaleString()}` : '',
                                ].filter(Boolean).join(' - ')}`
                                : ''}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleRemoveApplication(app)}
                              className="font-mono text-xs uppercase tracking-wider text-secondary hover:text-accent transition-colors"
                            >
                              <span className="inline-flex items-center gap-1">
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card static>
              <CardBody className="p-4 sm:p-6">
                <h3 className="font-semibold mb-4 text-primary">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="btn btn-primary btn-full justify-between text-sm"
                  >
                    <span>Add Application</span>
                    <Plus className="w-4 h-4" />
                  </button>
                  <Link to="/companies" className="btn btn-full justify-between text-sm">
                    <span>Browse Companies</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/compare" className="btn btn-secondary btn-full justify-between text-sm">
                    <span>Compare Targets</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/offers" className="btn btn-secondary btn-full justify-between text-sm">
                    <span>Check Salaries</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardBody>
            </Card>

            <Card bento>
              <h4 className="font-mono text-xs sm:text-sm uppercase text-secondary mb-2">
                Why this is faster
              </h4>
              <p className="text-xs sm:text-sm text-primary leading-relaxed">
                Tracker data stays local, so the page opens without auth checks, token refreshes, or extra protected-route API calls.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {isFormOpen ? (
        <JobApplicationForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateApplication}
        />
      ) : null}
    </div>
  );
}

export default Dashboard;

import { useState, type ComponentType } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, TrendingUp, Plus, ArrowRight, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { applicationsApi } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import { Badge, Button, Card, CardBody, EmptyState, StatBoxSkeleton, CompanyLogo } from '../components/ui';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';
import JobApplicationForm, { type ApplicationFormData } from '../components/JobApplicationForm';
import type { JobApplication } from '../types';

const statusConfig: Record<string, { variant: 'accent' | 'warning' | 'success' | 'danger' | 'ghost'; label: string; icon: ComponentType<{ className?: string }> }> = {
  applied: { variant: 'ghost', label: 'Applied', icon: Clock },
  screening: { variant: 'warning', label: 'Screening', icon: AlertCircle },
  interview: { variant: 'accent', label: 'Interview', icon: AlertCircle },
  offer: { variant: 'success', label: 'Offer', icon: CheckCircle2 },
  accepted: { variant: 'success', label: 'Accepted', icon: CheckCircle2 },
  rejected: { variant: 'danger', label: 'Rejected', icon: XCircle },
  withdrawn: { variant: 'ghost', label: 'Withdrawn', icon: XCircle },
};

function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list(),
  });

  const createApplicationMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => applicationsApi.create(payload),
  });

  const handleCreateApplication = async (data: ApplicationFormData) => {
    const payload = {
      company: data.company_id,
      position_title: data.position_title,
      location: data.location,
      salary_range_min: data.salary_range_min,
      salary_range_max: data.salary_range_max,
      status: data.status,
      referral: data.referral,
      notes: data.notes,
    };

    try {
      await createApplicationMutation.mutateAsync(payload);
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsFormOpen(false);
      toast.success('Application added successfully!', 'Saved to dashboard');
    } catch (error: any) {
      const message =
        error.response?.data?.company?.[0] ||
        error.response?.data?.position_title?.[0] ||
        error.response?.data?.detail ||
        'Failed to add application';
      toast.error(message, 'Could not save application');
      throw new Error(message);
    }
  };

  const stats = {
    total: applications?.length || 0,
    active: applications?.filter((a: JobApplication) =>
      ['applied', 'screening', 'interview'].includes(a.status)
    ).length || 0,
    offers: applications?.filter((a: JobApplication) => a.status === 'offer').length || 0,
    companies: new Set(applications?.map((a: JobApplication) => a.company_name)).size || 0,
    recent: applications?.slice(0, 5) || [],
  };

  return (
    <div className="bg-bg-primary min-h-screen">
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-8 sm:py-12">
          <div className="header-layout">
            <div>
              <div className="section-marker mb-2">
                <span>Welcome back</span>
              </div>
              <h1 className="headline-lg">{user?.username}&apos;s Dashboard</h1>
            </div>
            <Button variant="primary" className="w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Application
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {isLoading ? (
            <>
              <StatBoxSkeleton />
              <StatBoxSkeleton />
              <StatBoxSkeleton />
              <StatBoxSkeleton />
            </>
          ) : (
            <>
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
            </>
          )}
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

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : stats.recent.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="No applications yet"
                    description="Start tracking your job applications to stay organized."
                    action={
                      <Button variant="primary" className="w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Add Your First Application
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y-2 divide-border-light">
                    {stats.recent.map((app: JobApplication) => {
                      const config = statusConfig[app.status] || statusConfig.applied;
                      const StatusIcon = config.icon;

                      return (
                        <div
                          key={app.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-3"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <CompanyLogo
                              companyName={app.company_name}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-primary text-sm sm:text-base truncate">{app.position_title}</div>
                              <div className="font-mono text-xs sm:text-sm text-secondary truncate">
                                {app.company_name}
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
                  <Link to="/offers" className="btn btn-secondary btn-full justify-between text-sm">
                    <span>Check Salaries</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/predictions" className="btn btn-secondary btn-full justify-between text-sm">
                    <span>Predictions</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardBody>
            </Card>

            <Card bento>
              <h4 className="font-mono text-xs sm:text-sm uppercase text-secondary mb-2">
                Pro Tip
              </h4>
              <p className="text-xs sm:text-sm text-primary leading-relaxed">
                Track all your applications to stay organized. Update statuses
                as you progress through interviews to get insights into your job search.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {isFormOpen ? (
        <JobApplicationForm
          onClose={() => {
            if (!createApplicationMutation.isPending) {
              setIsFormOpen(false);
            }
          }}
          onSubmit={handleCreateApplication}
        />
      ) : null}
    </div>
  );
}

export default Dashboard;

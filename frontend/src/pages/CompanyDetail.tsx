import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  CheckCircle,
  Clock3,
  Database,
  DollarSign,
  ExternalLink,
  Globe,
  MapPin,
  MessageSquare,
  Scale,
  TrendingUp,
} from 'lucide-react';
import { companiesApi, offersApi } from '../api/services';
import { Badge, Card, CardBody, Progress, EmptyState, Spinner, CompanyLogo } from '../components/ui';
import type { CompanyBenefit, JobPosting, Offer } from '../types';

function CompanyDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', slug],
    queryFn: () => companiesApi.get(slug!),
    enabled: !!slug,
  });

  const { data: offers } = useQuery({
    queryKey: ['company-offers', company?.id],
    queryFn: () => offersApi.list({ page: 1, company: company!.id }).then((response) => response.results),
    enabled: !!company?.id,
  });

  const { data: jobs } = useQuery({
    queryKey: ['company-jobs', slug],
    queryFn: () => companiesApi.getJobs(slug!),
    enabled: !!slug,
  });

  const { data: benefits } = useQuery({
    queryKey: ['company-benefits', slug],
    queryFn: () => companiesApi.getBenefits(slug!),
    enabled: !!slug && (company?.benefit_count || 0) > 0,
  });

  const { data: similarCompanies } = useQuery({
    queryKey: ['similar-companies', slug],
    queryFn: () => companiesApi.getSimilar(slug!),
    enabled: !!slug,
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-secondary';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'accent' as const, label: 'Excellent' };
    if (score >= 60) return { variant: 'success' as const, label: 'Good' };
    if (score >= 40) return { variant: 'warning' as const, label: 'Fair' };
    return { variant: 'ghost' as const, label: 'Limited' };
  };

  const getConfidenceBadge = (confidence: string | undefined) => {
    switch (confidence) {
      case 'high':
        return { variant: 'accent' as const, label: 'High Confidence' };
      case 'good':
        return { variant: 'success' as const, label: 'Good Confidence' };
      case 'emerging':
        return { variant: 'warning' as const, label: 'Emerging Data' };
      default:
        return { variant: 'ghost' as const, label: 'Limited Data' };
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return 'Unavailable';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  };

  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container py-20">
        <EmptyState
          icon={Building2}
          title="Company not found"
          action={
            <Link to="/companies">
              <Badge variant="accent">Back to Companies</Badge>
            </Link>
          }
        />
      </div>
    );
  }

  const score = parseFloat(String(company.visa_fair_score || 0));
  const badge = getScoreBadge(score);
  const confidenceBadge = getConfidenceBadge(company.data_confidence);
  const industryLabel = company.industry_display || company.industry;
  const companySizeLabel = company.company_size_display || company.company_size;
  const hasBenefitsData = (company.benefit_count || 0) > 0;
  const coverageLabel = company.first_filing_year && company.last_filing_year
    ? company.first_filing_year === company.last_filing_year
      ? `FY${company.last_filing_year}`
      : `FY${company.first_filing_year}-FY${company.last_filing_year}`
    : 'Coverage pending';
  const activeYearsLabel = company.first_filing_year && company.last_filing_year
    ? company.first_filing_year === company.last_filing_year
      ? `${company.last_filing_year}`
      : `${company.first_filing_year}-${company.last_filing_year}`
    : company.last_filing_year
      ? `${company.last_filing_year}`
      : 'N/A';
  const applicantInsights = (company.actionable_insights && company.actionable_insights.length > 0)
    ? company.actionable_insights
    : [
      'Historical sponsorship data is still limited here, so treat the current score as directional.',
      'More salary and hiring coverage will make future recommendations stronger for this employer.',
    ];

  return (
    <div className="bg-bg-primary min-h-screen">
      {/* Header */}
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-6 sm:py-8">
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm text-secondary hover:text-accent transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Companies
          </Link>

          <div className="flex flex-col sm:flex-row flex-wrap items-start gap-4 sm:gap-6">
            <CompanyLogo
              companyName={company.name}
              logoUrl={company.logo_url}
              companyDomain={company.company_domain}
              website={company.website}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h1 className="headline-lg mb-2">{company.name}</h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-xs sm:text-sm text-secondary">
                {industryLabel && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    {industryLabel}
                  </span>
                )}
                {company.headquarters && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    {company.headquarters}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-accent hover-underline"
                  >
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    Website
                    <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3" />
                  </a>
                )}
                {company.careers_url && (
                  <a
                    href={company.careers_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-accent hover-underline"
                  >
                    <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                    Careers
                    <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="company-score-card">
              <div className="text-xs font-mono uppercase tracking-widest text-secondary">Visa Score</div>
              <div className={`company-score-value ${getScoreColor(score)}`}>
                {score.toFixed(1)}
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge variant={badge.variant}>{badge.label}</Badge>
                <Badge variant={confidenceBadge.variant} size="sm">{confidenceBadge.label}</Badge>
              </div>
              <div className="w-full pt-1">
                <Link to={`/compare?left=${company.slug}`} className="btn btn-secondary w-full justify-center text-xs sm:text-sm">
                  <Scale className="w-4 h-4" />
                  Compare
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Score Breakdown */}
            <Card static>
              <CardBody className="p-4 sm:p-6">
                <h2 className="headline-sm mb-4 sm:mb-6 flex items-center gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  Visa Fair Score Breakdown
                </h2>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
                  <div className={`text-4xl sm:text-5xl font-bold font-display ${getScoreColor(score)}`}>
                    {score.toFixed(1)}
                  </div>
                  <div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <p className="text-xs sm:text-sm text-secondary mt-2">
                      Based on {company.total_h1b_filings?.toLocaleString() || 0} H-1B filings
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {[
                    { label: 'Approval Rate', value: parseFloat(String(company.h1b_approval_rate || 0)), icon: CheckCircle },
                    { label: 'Average Salary vs Market', value: company.avg_salary_percentile || 0, icon: DollarSign },
                    { label: 'Consistency Score', value: parseFloat(String(company.sponsorship_consistency_score || 0)), icon: TrendingUp },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 sm:gap-4">
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono uppercase text-secondary mb-1">{item.label}</div>
                        <Progress value={item.value} showLabel />
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* H-1B Stats */}
            <Card static>
              <CardBody className="p-4 sm:p-6">
                <h2 className="headline-sm mb-4 sm:mb-6">H-1B Sponsorship History</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="stat-box-responsive">
                    <div className="stat-label">Total Filings</div>
                    <div className="stat-value-responsive">{company.total_h1b_filings?.toLocaleString() || 0}</div>
                  </div>
                  <div className="stat-box-responsive">
                    <div className="stat-label text-success">Approved</div>
                    <div className="stat-value-responsive text-success">{company.total_h1b_approvals?.toLocaleString() || 0}</div>
                  </div>
                  <div className="stat-box-responsive">
                    <div className="stat-label text-danger">Approval Rate</div>
                    <div className="stat-value-responsive text-success">{parseFloat(String(company.h1b_approval_rate || 0)).toFixed(1)}%</div>
                  </div>
                  <div className="stat-box-responsive">
                    <div className="stat-label">Active Years</div>
                    <div className="stat-value-responsive">{activeYearsLabel}</div>
                  </div>
                </div>

                <Progress value={parseFloat(String(company.h1b_approval_rate || 0))} showLabel />
              </CardBody>
            </Card>

            {/* Recent Offers */}
            {offers && offers.length > 0 && (
              <Card static>
                <CardBody className="p-4 sm:p-6">
                  <h2 className="headline-sm mb-4 sm:mb-6">Recent Salary Data</h2>

                  {/* Mobile View */}
                  <div className="lg:hidden space-y-3">
                    {offers.slice(0, 5).map((offer: Offer) => (
                      <div key={offer.id} className="bg-secondary border-2 border-border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <CompanyLogo
                              companyName={company.name}
                              logoUrl={company.logo_url}
                              companyDomain={company.company_domain}
                              website={company.website}
                              size="sm"
                            />
                            <span className="font-semibold text-primary text-sm truncate">{offer.position_title}</span>
                            <span className="text-secondary hidden sm:inline">•</span>
                            <span className="text-secondary text-sm truncate hidden sm:inline">
                              {offer.location || 'USA'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <Badge variant="outline" size="sm">{offer.visa_type_display || offer.visa_type || 'N/A'}</Badge>
                            <Badge variant="ghost" size="sm">
                              {offer.data_source === 'community_submission' ? 'Community' : 'Gov Data'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-secondary sm:hidden">{offer.location || 'USA'}</span>
                          <span className="font-mono font-bold text-accent">
                            ${(offer.base_salary || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden lg:block divide-y-2 divide-border-light">
                    {offers.slice(0, 5).map((offer: Offer) => (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">{offer.position_title}</span>
                          <span className="text-secondary">•</span>
                          <span className="text-sm text-secondary">
                            {offer.location || 'USA'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-accent">
                            ${(offer.base_salary || 0).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2 justify-end mt-1">
                            <Badge variant="outline">{offer.visa_type_display || offer.visa_type || 'N/A'}</Badge>
                            <Badge variant="ghost">
                              {offer.data_source === 'community_submission' ? 'Community' : 'Gov Data'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link to="/offers" className="btn btn-secondary btn-full mt-4 sm:mt-6">
                    View All Offers
                  </Link>
                </CardBody>
              </Card>
            )}

            <section className="company-story-section">
              <div className="company-story-header">
                <div>
                  <div className="section-marker mb-2">
                    <span>Applicant Readout</span>
                  </div>
                  <h2 className="headline-sm">What This Means For Applicants</h2>
                </div>
                <p className="company-story-kicker">
                  A quicker read on what the current filing, pay, and enrichment data actually suggests.
                </p>
              </div>

              <div className="company-insight-stream">
                {applicantInsights.map((insight, index) => (
                  <div key={insight} className="company-insight-item">
                    <div className="company-insight-index">{String(index + 1).padStart(2, '0')}</div>
                    <p className="company-insight-copy">{insight}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="company-story-section company-story-section-light">
              <div className="company-section-head">
                <div>
                  <div className="section-marker mb-2">
                    <span>Hiring Signal</span>
                  </div>
                  <h2 className="headline-sm">Live Jobs</h2>
                  <p className="company-section-copy">
                    Public ATS roles appear here when this employer has a supported board we currently track.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{(jobs || []).length.toLocaleString()} tracked</Badge>
                  <Link to={`/jobs?company_slug=${company.slug}`} className="btn btn-secondary text-xs sm:text-sm">
                    View All Jobs
                  </Link>
                </div>
              </div>

              {jobs && jobs.length > 0 ? (
                <div className="company-open-list">
                  {jobs.slice(0, 6).map((job: JobPosting) => (
                    <a
                      key={job.id}
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="company-open-row"
                    >
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                        <div className="min-w-0">
                          <div className="font-semibold text-primary leading-snug">{job.title}</div>
                          <div className="text-sm text-secondary mt-1 leading-relaxed">
                            {[job.team, job.location].filter(Boolean).join(' • ') || 'Location pending'}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          <Badge variant="outline" size="sm">{job.remote_policy || 'unknown'}</Badge>
                          <Badge variant="ghost" size="sm">{job.source}</Badge>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="company-empty-band">
                  <div className="company-empty-band-icon">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="company-empty-band-title">No live jobs tracked yet</h3>
                    <p className="company-empty-band-description">
                      This company will show public ATS roles once a supported board is imported.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {hasBenefitsData ? (
              <section className="company-story-section company-story-section-light">
                <div className="company-section-head">
                  <div>
                    <div className="section-marker mb-2">
                      <span>Benefits Signal</span>
                    </div>
                    <h2 className="headline-sm">Benefits Coverage</h2>
                    <p className="company-section-copy">
                      This section turns real benefits data into a quick quality-of-life snapshot for applicants.
                    </p>
                  </div>
                  <Badge variant="outline">{(benefits || []).length.toLocaleString()} items</Badge>
                </div>

                {benefits && benefits.length > 0 ? (
                  <div className="company-benefit-grid">
                    {benefits.slice(0, 6).map((benefit: CompanyBenefit) => (
                      <div key={benefit.id} className="company-benefit-card">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-semibold text-primary">{benefit.title}</span>
                          <Badge variant={benefit.is_verified ? 'accent' : 'ghost'} size="sm">
                            {benefit.category_display || benefit.category}
                          </Badge>
                        </div>
                        {benefit.value ? (
                          <div className="font-mono text-xs uppercase text-accent mb-2">{benefit.value}</div>
                        ) : null}
                        {benefit.description ? (
                          <p className="text-sm text-secondary leading-relaxed">{benefit.description}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Actions */}
            <Card static>
              <CardBody className="p-4 sm:p-6">
                <h3 className="font-semibold mb-4 text-primary">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/predictions" className="btn btn-full text-sm">
                    Check Sponsorship Odds
                  </Link>
                  <Link to="/offers" className="btn btn-secondary btn-full text-sm">
                    Compare Salaries
                  </Link>
                </div>
              </CardBody>
            </Card>

            {/* Company Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              {industryLabel && (
                <Card bento>
                  <h3 className="font-mono text-xs uppercase text-secondary mb-1">Industry</h3>
                  <p className="font-semibold text-primary text-sm sm:text-base">{industryLabel}</p>
                </Card>
              )}

              {companySizeLabel && (
                <Card bento>
                  <h3 className="font-mono text-xs uppercase text-secondary mb-1">Company Size</h3>
                  <p className="font-semibold text-primary text-sm sm:text-base">{companySizeLabel}</p>
                </Card>
              )}

              {company.headquarters && (
                <Card bento className="sm:col-span-2 lg:col-span-1">
                  <h3 className="font-mono text-xs uppercase text-secondary mb-1">Headquarters</h3>
                  <p className="font-semibold text-primary text-sm sm:text-base">{company.headquarters}</p>
                </Card>
              )}
            </div>

            <Card static>
              <CardBody className="p-4 sm:p-6">
                <h3 className="font-semibold mb-4 text-primary">Data Trust</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-secondary text-sm">
                      <Database className="w-4 h-4" />
                      Coverage
                    </div>
                    <span className="font-semibold text-primary text-sm">{coverageLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-secondary text-sm">
                      <DollarSign className="w-4 h-4" />
                      Salary Records
                    </div>
                    <span className="font-semibold text-primary text-sm">
                      {(company.offer_count || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-secondary text-sm">
                      <MessageSquare className="w-4 h-4" />
                      Reviews
                    </div>
                    <span className="font-semibold text-primary text-sm">
                      {(company.review_count || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-secondary text-sm">
                      <Clock3 className="w-4 h-4" />
                      Last H-1B Decision
                    </div>
                    <span className="font-semibold text-primary text-sm text-right">
                      {formatDate(company.latest_h1b_decision_date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-secondary text-sm">
                      <Globe className="w-4 h-4" />
                      Domain
                    </div>
                    <span className="font-semibold text-primary text-sm text-right">
                      {company.company_domain || 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-secondary text-sm">
                      <Briefcase className="w-4 h-4" />
                      Active Jobs
                    </div>
                    <span className="font-semibold text-primary text-sm">
                      {(company.active_job_count || 0).toLocaleString()}
                    </span>
                  </div>
                  {hasBenefitsData ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-secondary text-sm">
                        <Building2 className="w-4 h-4" />
                        Benefits
                      </div>
                      <span className="font-semibold text-primary text-sm">
                        {(company.benefit_count || 0).toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                  <div className="pt-2">
                    <Badge variant={confidenceBadge.variant}>{confidenceBadge.label}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(company.data_sources || []).map((source) => (
                      <Badge key={source} variant="outline" size="sm">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {similarCompanies && similarCompanies.length > 0 ? (
              <Card static>
                <CardBody className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-4 text-primary">Similar Companies</h3>
                  <div className="space-y-3">
                    {similarCompanies.slice(0, 4).map((similar) => (
                      <Link
                        key={similar.id}
                        to={`/companies/${similar.slug}`}
                        className="flex items-center gap-3 border-2 border-border p-3 hover:bg-secondary transition-colors"
                      >
                        <CompanyLogo
                          companyName={similar.name}
                          logoUrl={similar.logo_url}
                          companyDomain={similar.company_domain}
                          website={similar.website}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-primary truncate">{similar.name}</div>
                          <div className="text-xs text-secondary truncate">
                            {similar.industry_display || similar.industry || 'Industry pending'}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetail;

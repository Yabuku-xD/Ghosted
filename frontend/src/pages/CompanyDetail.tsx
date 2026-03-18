import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Award,
  Building2,
  CheckCircle,
  Clock3,
  Database,
  DollarSign,
  ExternalLink,
  Globe,
  MapPin,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { companiesApi, offersApi } from '../api/services';
import { Badge, Card, CardBody, Progress, EmptyState, Spinner, CompanyLogo } from '../components/ui';
import type { Offer } from '../types';

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
  const coverageLabel = company.first_filing_year && company.last_filing_year
    ? company.first_filing_year === company.last_filing_year
      ? `FY${company.last_filing_year}`
      : `FY${company.first_filing_year}-FY${company.last_filing_year}`
    : 'Coverage pending';

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
              </div>
            </div>

            <div className="flex items-center sm:block gap-4 sm:text-right">
              <div className="sm:block">
                <div className="text-xs font-mono uppercase text-secondary mb-1 hidden sm:block">Visa Score</div>
                <div className={`text-3xl sm:text-4xl md:text-5xl font-bold font-display ${getScoreColor(score)}`}>
                  {score}
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <Badge variant={badge.variant}>{badge.label}</Badge>
                <Badge variant={confidenceBadge.variant} size="sm">{confidenceBadge.label}</Badge>
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
                    {score}
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
                    <div className="stat-value-responsive">{company.first_filing_year && company.last_filing_year ? `${company.first_filing_year}-${company.last_filing_year}` : 'N/A'}</div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetail;

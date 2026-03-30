import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
  Users,
  Target,
  Sparkles,
  ChevronRight,
  Star,
  BarChart3,
  BriefcaseBusiness,
  Shield,
  Zap,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react';
import { companiesApi, offersApi } from '../api/services';
import { Badge, Progress, CompanyLogo } from '../components/ui';
import type { CompanyBenefit, JobPosting, Offer } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const bentoItemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

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
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-text-muted';
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
    if (!value) return 'Unavailable';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  };

  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-12 h-12 border-2 border-bg-tertiary border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container py-20">
        <div className="card-static py-16 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-text-muted" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Company not found</h2>
          <Link to="/companies" className="btn btn-secondary mt-4">
            Back to Companies
          </Link>
        </div>
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
    : company.last_filing_year || 'N/A';

  const applicantInsights = (company.actionable_insights && company.actionable_insights.length > 0)
    ? company.actionable_insights
    : [
      'Historical sponsorship data is still limited here, so treat the current score as directional.',
      'More salary and hiring coverage will make future recommendations stronger for this employer.',
    ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-b border-white/5 bg-bg-secondary/30"
      >
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to="/companies"
              className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Companies
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-start gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <CompanyLogo
                    companyName={company.name}
                    logoUrl={company.logo_url}
                    companyDomain={company.company_domain}
                    website={company.website}
                    size="lg"
                  />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl sm:text-4xl font-bold text-text-primary mb-3"
                  >
                    {company.name}
                  </motion.h1>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap items-center gap-4 text-sm text-text-secondary"
                  >
                    {industryLabel && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        {industryLabel}
                      </span>
                    )}
                    {company.headquarters && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {company.headquarters}
                      </span>
                    )}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-accent hover:underline"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card-glass p-6 min-w-[180px] text-center"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-text-muted mb-2">Visa Score</div>
              <div className={`text-5xl font-bold ${getScoreColor(score)} mb-3`}>
                {score.toFixed(1)}
              </div>
              <Badge variant={badge.variant} className="mb-3">
                {badge.label}
              </Badge>
              <Link
                to={`/compare?left=${company.slug}`}
                className="btn btn-secondary btn-full btn-sm"
              >
                <Scale className="w-4 h-4" />
                Compare
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Dashboard */}
      <div className="container py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Score Breakdown - Large */}
          <motion.div variants={bentoItemVariants} className="lg:col-span-2">
            <div className="card h-full">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">Score Breakdown</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                  {score.toFixed(1)}
                </div>
                <div>
                  <Badge variant={badge.variant} size="lg" className="mb-2">
                    {badge.label}
                  </Badge>
                  <p className="text-sm text-text-muted">
                    Based on {company.total_h1b_filings?.toLocaleString() || 0} H-1B filings
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {[
                  { 
                    label: 'Approval Rate', 
                    value: parseFloat(String(company.h1b_approval_rate || 0)),
                    icon: CheckCircle,
                    color: 'bg-emerald-500'
                  },
                  { 
                    label: 'Salary Percentile', 
                    value: company.avg_salary_percentile || 0,
                    icon: DollarSign,
                    color: 'bg-blue-500'
                  },
                  { 
                    label: 'Consistency Score', 
                    value: parseFloat(String(company.sponsorship_consistency_score || 0)),
                    icon: TrendingUp,
                    color: 'bg-violet-500'
                  },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </div>
                      <span className="font-medium text-text-primary">{item.value.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={bentoItemVariants}>
            <div className="card h-full">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">H-1B Stats</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Filings', value: company.total_h1b_filings || 0, color: 'text-text-primary' },
                  { label: 'Approved', value: company.total_h1b_approvals || 0, color: 'text-emerald-400' },
                  { label: 'Approval Rate', value: `${parseFloat(String(company.h1b_approval_rate || 0)).toFixed(1)}%`, color: 'text-emerald-400' },
                  { label: 'Active Years', value: activeYearsLabel, color: 'text-text-primary' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl bg-bg-glass">
                    <div className="text-xs text-text-muted mb-1">{stat.label}</div>
                    <div className={`text-xl font-bold ${stat.color}`}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-muted">Approval Progress</span>
                  <span className="font-medium text-emerald-400">
                    {parseFloat(String(company.h1b_approval_rate || 0)).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${company.h1b_approval_rate || 0}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Data Trust */}
          <motion.div variants={bentoItemVariants}>
            <div className="card h-full">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">Data Trust</h2>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Coverage', value: coverageLabel, icon: Calendar },
                  { label: 'Salary Records', value: (company.offer_count || 0).toLocaleString(), icon: DollarSign },
                  { label: 'Active Jobs', value: (company.active_job_count || 0).toLocaleString(), icon: BriefcaseBusiness },
                  { label: 'Reviews', value: (company.review_count || 0).toLocaleString(), icon: MessageSquare },
                  { label: 'Last H-1B', value: formatDate(company.latest_h1b_decision_date), icon: Clock3 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="font-medium text-text-primary text-sm">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <Badge variant={confidenceBadge.variant} size="lg" className="w-full justify-center">
                  {confidenceBadge.label}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Company Info */}
          <motion.div variants={bentoItemVariants}>
            <div className="card h-full">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">Company Info</h2>
              </div>

              <div className="space-y-4">
                {industryLabel && (
                  <div className="p-4 rounded-xl bg-bg-glass">
                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Industry</div>
                    <div className="font-medium text-text-primary">{industryLabel}</div>
                  </div>
                )}
                
                {companySizeLabel && (
                  <div className="p-4 rounded-xl bg-bg-glass">
                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Company Size</div>
                    <div className="font-medium text-text-primary">{companySizeLabel}</div>
                  </div>
                )}
                
                {company.headquarters && (
                  <div className="p-4 rounded-xl bg-bg-glass">
                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Headquarters</div>
                    <div className="font-medium text-text-primary">{company.headquarters}</div>
                  </div>
                )}
                
                {company.company_domain && (
                  <div className="p-4 rounded-xl bg-bg-glass">
                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Domain</div>
                    <div className="font-medium text-text-primary flex items-center gap-2">
                      <LinkIcon className="w-3 h-3" />
                      {company.company_domain}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Salary Data */}
          {offers && offers.length > 0 && (
            <motion.div variants={bentoItemVariants} className="lg:col-span-2">
              <div className="card h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-semibold text-text-primary">Recent Salary Data</h2>
                  </div>
                  <Link to="/offers" className="text-sm text-accent hover:underline flex items-center gap-1">
                    View all
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {offers.slice(0, 5).map((offer: Offer, index) => (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-4 rounded-xl bg-bg-glass hover:bg-bg-glass-hover transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-text-muted" />
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">{offer.position_title}</div>
                          <div className="text-sm text-text-muted">{offer.location || 'USA'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">
                          ${(offer.base_salary || 0).toLocaleString()}
                        </div>
                        <Badge variant="outline" size="sm" className="mt-1">
                          {offer.visa_type_display || offer.visa_type || 'N/A'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Live Jobs */}
          {jobs && jobs.length > 0 && (
            <motion.div variants={bentoItemVariants} className="lg:col-span-3">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-semibold text-text-primary">Live Jobs</h2>
                    <Badge variant="accent" size="sm">
                      {jobs.length} open
                    </Badge>
                  </div>
                  <Link
                    to={`/jobs?company_slug=${company.slug}`}
                    className="text-sm text-accent hover:underline flex items-center gap-1"
                  >
                    View all jobs
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.slice(0, 6).map((job: JobPosting, index) => (
                    <motion.a
                      key={job.id}
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="p-4 rounded-xl bg-bg-glass hover:bg-bg-glass-hover border border-transparent hover:border-border-accent transition-all group"
                    >
                      <div className="font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2 mb-2">
                        {job.title}
                      </div>
                      <div className="text-sm text-text-muted mb-3">
                        {[job.team, job.location].filter(Boolean).join(' • ')}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.remote_policy && (
                          <Badge variant="outline" size="sm">{job.remote_policy}</Badge>
                        )}
                        <Badge variant="ghost" size="sm">{job.source}</Badge>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Benefits */}
          {hasBenefitsData && benefits && benefits.length > 0 && (
            <motion.div variants={bentoItemVariants} className="lg:col-span-3">
              <div className="card">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold text-text-primary">Benefits</h2>
                  <Badge variant="outline" size="sm">{benefits.length} items</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {benefits.slice(0, 6).map((benefit: CompanyBenefit, index) => (
                    <motion.div
                      key={benefit.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                      className="p-4 rounded-xl bg-bg-glass"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-text-primary">{benefit.title}</span>
                        <Badge variant={benefit.is_verified ? 'accent' : 'ghost'} size="sm">
                          {benefit.category_display || benefit.category}
                        </Badge>
                      </div>
                      {benefit.value && (
                        <div className="text-sm text-accent font-medium mb-2">{benefit.value}</div>
                      )}
                      {benefit.description && (
                        <p className="text-sm text-text-secondary">{benefit.description}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Applicant Insights */}
          <motion.div variants={bentoItemVariants} className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">What This Means For Applicants</h2>
              </div>

              <div className="space-y-4">
                {applicantInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex gap-4 p-4 rounded-xl bg-bg-glass hover:bg-bg-glass-hover transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-accent">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="text-text-secondary leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Similar Companies */}
          {similarCompanies && similarCompanies.length > 0 && (
            <motion.div variants={bentoItemVariants}>
              <div className="card h-full">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold text-text-primary">Similar Companies</h2>
                </div>

                <div className="space-y-3">
                  {similarCompanies.slice(0, 4).map((similar, index) => (
                    <motion.div
                      key={similar.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Link
                        to={`/companies/${similar.slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-bg-glass hover:bg-bg-glass-hover transition-all group"
                      >
                        <CompanyLogo
                          companyName={similar.name}
                          logoUrl={similar.logo_url}
                          companyDomain={similar.company_domain}
                          website={similar.website}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                            {similar.name}
                          </div>
                          <div className="text-xs text-text-muted truncate">
                            {similar.industry_display || similar.industry || 'Industry pending'}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default CompanyDetail;

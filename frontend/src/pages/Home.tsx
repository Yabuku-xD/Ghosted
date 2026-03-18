import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calculator,
  Database,
  Scale,
  TrendingUp,
  Users,
} from 'lucide-react';

import { companiesApi } from '../api/services';
import { CompanyLogo } from '../components/ui';

function Home() {
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['company-insights'],
    queryFn: () => companiesApi.getInsights(),
  });

  const { data: topSponsors, isLoading: topSponsorsLoading } = useQuery({
    queryKey: ['top-sponsors'],
    queryFn: () => companiesApi.topSponsors(),
  });

  const { data: topHiring, isLoading: topHiringLoading } = useQuery({
    queryKey: ['top-hiring'],
    queryFn: () => companiesApi.topHiring(),
  });

  const coverageLabel = (() => {
    if (insightsLoading) {
      return 'Loading...';
    }

    if (!insights?.coverage_years.last) {
      return 'Coverage pending';
    }

    if (insights.coverage_years.first === insights.coverage_years.last) {
      return `FY${insights.coverage_years.last}`;
    }

    return `FY${insights.coverage_years.first}-FY${insights.coverage_years.last}`;
  })();

  const hasCommunityData = (insights?.community_offers || 0) > 0;
  const hasBenefitsData = (insights?.total_benefits || 0) > 0;

  const stats = [
    {
      value: insightsLoading ? 'Loading...' : insights?.total_companies?.toLocaleString() || '0',
      label: 'Companies',
      detail: 'Indexed across the searchable directory',
      icon: Building2,
    },
    {
      value: insightsLoading ? 'Loading...' : insights?.total_h1b_records?.toLocaleString() || '0',
      label: 'Gov Records',
      detail: 'Historical filings loaded into the platform',
      icon: Database,
    },
    {
      value: coverageLabel,
      label: 'Coverage',
      detail: 'Current fiscal-year range in the dataset',
      icon: BarChart3,
    },
  ];

  const features = [
    {
      icon: Building2,
      title: 'Company Database',
      description: 'Search the full directory by sponsor history, salary coverage, and confidence level.',
      link: '/companies',
      color: 'bg-accent',
    },
    {
      icon: TrendingUp,
      title: 'Salary Intelligence',
      description: hasCommunityData
        ? 'Compare government-derived salary records with community submissions and trust signals.'
        : 'Explore government-derived salary records with clearer source and confidence signals.',
      link: '/offers',
      color: 'bg-info',
    },
    {
      icon: Calculator,
      title: 'Lottery Calculator',
      description: 'Estimate your H-1B lottery odds using the app’s current assumptions and year coverage.',
      link: '/predictions',
      color: 'bg-success',
    },
    {
      icon: Scale,
      title: 'Compare Companies',
      description: 'See sponsorship strength, salary coverage, and live jobs side by side before you apply.',
      link: '/compare',
      color: 'bg-warning',
    },
  ];

  const enrichmentItems = [
    {
      label: 'Domains',
      value: insightsLoading ? 'Loading...' : insights?.companies_with_domains?.toLocaleString() || '0',
    },
    {
      label: 'Logo-ready',
      value: insightsLoading ? 'Loading...' : insights?.companies_with_logos?.toLocaleString() || '0',
    },
    {
      label: 'Live Jobs',
      value: insightsLoading ? 'Loading...' : insights?.total_jobs?.toLocaleString() || '0',
    },
    hasBenefitsData
      ? {
          label: 'Benefits',
          value: insightsLoading ? 'Loading...' : insights?.total_benefits?.toLocaleString() || '0',
        }
      : {
          label: 'Salary-backed',
          value: insightsLoading ? 'Loading...' : insights?.companies_with_salary_data?.toLocaleString() || '0',
        },
  ];

  const featuredCompanies = topSponsors?.slice(0, 3) || [];
  const featuredHiring = topHiring?.slice(0, 3) || [];

  return (
    <div className="bg-bg-primary">
      <section className="border-b-3 border-border">
        <div className="container py-12 sm:py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-slide-up">
              <div className="section-marker mb-4 sm:mb-6">
                <span>Job Intelligence for International Talent</span>
              </div>

              <h1 className="headline-xl mb-4 sm:mb-6">
                Know your worth.
                <br />
                <span className="text-accent">With better evidence.</span>
              </h1>

              <p className="text-base sm:text-lg text-secondary mb-6 sm:mb-8 leading-relaxed max-w-xl">
                Explore sponsor history, salary records, and confidence signals in one place.
                The app now shows exactly how much data backs each company, where that data came from,
                and how sponsorship, salary, and hiring signals line up before you apply.
              </p>

              <div className="btn-group">
                <Link to="/companies" className="btn btn-primary w-full sm:w-auto">
                  Explore Companies
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/jobs" className="btn btn-secondary w-full sm:w-auto">
                  Browse Live Jobs
                </Link>
              </div>

              <div className="card-static mt-6 p-4 bg-white">
                <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-2">Transparency</div>
                <p className="text-sm text-primary font-medium">
                  Current loaded coverage: {coverageLabel}. Importing more fiscal years will expand employer coverage beyond the present dataset.
                </p>
              </div>

              <div className="home-stat-grid mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-3 border-border">
                {stats.map((stat) => (
                  <div key={stat.label} className="home-stat-card">
                    <div className="home-stat-card-label">
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {stat.label}
                    </div>
                    <div className="home-stat-card-value">{stat.value}</div>
                    <div className="home-stat-card-detail">{stat.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-slide-up order-first lg:order-last" style={{ animationDelay: '100ms' }}>
              <div className="card-static p-4 sm:p-6 relative z-10 bg-white">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="section-marker mb-0">
                    <span>Featured: Top Sponsors</span>
                  </div>
                  <span className="badge badge-accent">Live</span>
                </div>

                <div className="space-y-0">
                  {topSponsorsLoading ? (
                    <div className="py-6 text-sm text-secondary">
                      Loading sponsor rankings...
                    </div>
                  ) : featuredCompanies.length > 0 ? featuredCompanies.map((company) => (
                    <Link
                      key={company.id}
                      to={`/companies/${company.slug}`}
                      className="flex items-center justify-between py-3 sm:py-4 border-b-2 border-border-light last:border-b-0 hover:bg-secondary/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <CompanyLogo
                          companyName={company.name}
                          logoUrl={company.logo_url}
                          companyDomain={company.company_domain}
                          website={company.website}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-primary text-sm sm:text-base truncate">{company.name}</div>
                          <div className="font-mono text-xs sm:text-sm text-secondary">
                            {(company.total_h1b_filings || 0).toLocaleString()} filings
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono font-bold text-primary text-base sm:text-lg">
                          {Number(company.h1b_approval_rate || 0).toFixed(1)}%
                        </div>
                        <div className="font-mono text-xs text-secondary uppercase">Approval</div>
                      </div>
                    </Link>
                  )) : (
                    <div className="py-6 text-sm text-secondary">
                      Top sponsors will appear here once the directory finishes loading.
                    </div>
                  )}
                </div>

                <Link to="/companies" className="btn btn-secondary btn-full mt-4 sm:mt-6">
                  View All Companies
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="absolute -bottom-3 sm:-bottom-4 -right-3 sm:-right-4 w-full h-full bg-accent border-3 border-border -z-0" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary border-b-3 border-border">
        <div className="container py-12 sm:py-16 md:py-24">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="section-marker justify-center mb-3 sm:mb-4">
              <span>Features</span>
            </div>
            <h2 className="headline-lg">
              Everything you need to navigate
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>the U.S. job market
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                to={feature.link}
                className="card-bento group block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${feature.color} text-white flex items-center justify-center border-2 border-border mb-3 sm:mb-4 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform`}>
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="headline-sm text-primary mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-secondary text-sm leading-relaxed mb-3 sm:mb-4">
                  {feature.description}
                </p>
                <div className="font-mono text-xs sm:text-sm text-accent uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-3 border-border">
        <div className="container py-12 sm:py-16">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card-static p-5 sm:p-6 bg-white">
              <div className="section-marker mb-3">
                <span>Hiring Signals</span>
              </div>
              <h2 className="headline-sm mb-4">Companies hiring now</h2>
              <div className="space-y-0">
                {featuredHiring.length > 0 ? featuredHiring.map((company) => (
                  <Link
                    key={company.id}
                    to={`/jobs?company_slug=${company.slug}`}
                    className="flex items-center justify-between py-3 border-b-2 border-border-light last:border-b-0 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CompanyLogo
                        companyName={company.name}
                        logoUrl={company.logo_url}
                        companyDomain={company.company_domain}
                        website={company.website}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-primary truncate">{company.name}</div>
                        <div className="font-mono text-xs text-secondary">
                          {(company.active_job_count || 0).toLocaleString()} live jobs
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-secondary" />
                  </Link>
                )) : topHiringLoading ? (
                  <p className="text-sm text-secondary">Loading live hiring signals...</p>
                ) : (
                  <p className="text-sm text-secondary">Automated ATS sync will surface live hiring signals here once supported boards are discovered.</p>
                )}
              </div>
              <Link to="/jobs" className="btn btn-secondary btn-full mt-4">
                Browse Live Jobs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="card-static p-5 sm:p-6 bg-white">
              <div className="section-marker mb-3">
                <span>Enrichment</span>
              </div>
              <h2 className="headline-sm mb-4">Branding and coverage progress</h2>
              <div className="grid grid-cols-2 gap-4">
                {enrichmentItems.map((item) => (
                  <div key={item.label} className="stat-box-responsive">
                    <div className="stat-label">{item.label}</div>
                    <div className="stat-value-responsive">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24">
        <div className="container">
          <div className="card p-6 sm:p-8 md:p-12 text-center relative overflow-hidden bg-white">
            <div className="relative z-10">
              <Scale className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-accent" />
              <h2 className="headline-lg mb-3 sm:mb-4">
                Ready to find your next opportunity?
              </h2>
              <p className="text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto text-base sm:text-lg px-4">
                Use company data, salary history, and compare views together to shortlist better targets faster.
              </p>
              <div className="btn-group justify-center">
                <Link to="/companies" className="btn btn-primary w-full sm:w-auto">
                  <Building2 className="w-5 h-5" />
                  Browse Companies
                </Link>
                <Link to="/jobs" className="btn btn-secondary w-full sm:w-auto">
                  Browse Jobs
                </Link>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-accent opacity-5" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-secondary opacity-50" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }} aria-hidden="true"></div>
          </div>
        </div>
      </section>

      <section className="bg-secondary border-t-3 border-border py-8 sm:py-12">
        <div className="container">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 text-secondary">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-wider">Data sources:</span>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-primary text-sm sm:text-base">Department of Labor</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-primary text-sm sm:text-base">Community submissions</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Calculator,
  Database,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';

import { companiesApi } from '../api/services';
import { CompanyLogo } from '../components/ui';

function Home() {
  const { data: insights } = useQuery({
    queryKey: ['company-insights'],
    queryFn: () => companiesApi.getInsights(),
  });

  const { data: topSponsors } = useQuery({
    queryKey: ['top-sponsors'],
    queryFn: () => companiesApi.topSponsors(),
  });

  const { data: topHiring } = useQuery({
    queryKey: ['top-hiring'],
    queryFn: () => companiesApi.topHiring(),
  });

  const coverageLabel = (() => {
    if (!insights?.coverage_years.last) {
      return 'Coverage pending';
    }

    if (insights.coverage_years.first === insights.coverage_years.last) {
      return `FY${insights.coverage_years.last}`;
    }

    return `FY${insights.coverage_years.first}-FY${insights.coverage_years.last}`;
  })();

  const stats = [
    { value: insights?.total_companies?.toLocaleString() || '0', label: 'Companies', icon: Building2 },
    { value: insights?.total_h1b_records?.toLocaleString() || '0', label: 'Gov Records', icon: Database },
    { value: coverageLabel, label: 'Coverage', icon: BarChart3 },
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
      description: 'Compare government-derived salary records with community submissions and trust signals.',
      link: '/offers',
      color: 'bg-primary',
    },
    {
      icon: Calculator,
      title: 'Lottery Calculator',
      description: 'Estimate your H-1B lottery odds using the app’s current assumptions and year coverage.',
      link: '/predictions',
      color: 'bg-success',
    },
    {
      icon: Briefcase,
      title: 'Compare Companies',
      description: 'See sponsorship strength, salary coverage, and live jobs side by side before you apply.',
      link: '/compare',
      color: 'bg-primary',
    },
    {
      icon: ShieldCheck,
      title: 'Local Tracker',
      description: 'Save applications in your browser instantly, without creating an account or waiting on auth.',
      link: '/tracker',
      color: 'bg-warning',
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
                and lets you track targets locally without creating an account.
              </p>

              <div className="btn-group">
                <Link to="/companies" className="btn btn-primary w-full sm:w-auto">
                  Explore Companies
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/offers" className="btn btn-secondary w-full sm:w-auto">
                  Explore Salary Data
                </Link>
              </div>

              <div className="card-static mt-6 p-4 bg-white">
                <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-2">Transparency</div>
                <p className="text-sm text-primary font-medium">
                  Current loaded coverage: {coverageLabel}. Importing more fiscal years will expand employer coverage beyond the present dataset.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-3 border-border">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-accent flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      {stat.value}
                    </div>
                    <div className="font-mono text-xs sm:text-sm text-secondary uppercase mt-1">{stat.label}</div>
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
                  {featuredCompanies.length > 0 ? featuredCompanies.map((company) => (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
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
                    to={`/companies/${company.slug}`}
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
                )) : (
                  <p className="text-sm text-secondary">Run the Greenhouse import to surface live hiring signals here.</p>
                )}
              </div>
            </div>

            <div className="card-static p-5 sm:p-6 bg-white">
              <div className="section-marker mb-3">
                <span>Enrichment</span>
              </div>
              <h2 className="headline-sm mb-4">Branding and coverage progress</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="stat-box-responsive">
                  <div className="stat-label">Domains</div>
                  <div className="stat-value-responsive">{insights?.companies_with_domains?.toLocaleString() || '0'}</div>
                </div>
                <div className="stat-box-responsive">
                  <div className="stat-label">Logo-ready</div>
                  <div className="stat-value-responsive">{insights?.companies_with_logos?.toLocaleString() || '0'}</div>
                </div>
                <div className="stat-box-responsive">
                  <div className="stat-label">Live Jobs</div>
                  <div className="stat-value-responsive">{insights?.total_jobs?.toLocaleString() || '0'}</div>
                </div>
                <div className="stat-box-responsive">
                  <div className="stat-label">Benefits</div>
                  <div className="stat-value-responsive">{insights?.total_benefits?.toLocaleString() || '0'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24">
        <div className="container">
          <div className="card p-6 sm:p-8 md:p-12 text-center relative overflow-hidden bg-white">
            <div className="relative z-10">
              <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-accent" />
              <h2 className="headline-lg mb-3 sm:mb-4">
                Ready to find your next opportunity?
              </h2>
              <p className="text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto text-base sm:text-lg px-4">
                Use government records for coverage, community submissions for nuance, and a local tracker that stays on your device.
              </p>
              <div className="btn-group justify-center">
                <Link to="/tracker" className="btn btn-primary w-full sm:w-auto">
                  <Briefcase className="w-5 h-5" />
                  Open Tracker
                </Link>
                <Link to="/companies" className="btn btn-secondary w-full sm:w-auto">
                  Browse Companies
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
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-primary text-sm sm:text-base">
                  {insights?.total_offers?.toLocaleString() || '0'} salary records
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-primary text-sm sm:text-base">
                  {insights?.community_offers?.toLocaleString() || '0'} community submissions
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

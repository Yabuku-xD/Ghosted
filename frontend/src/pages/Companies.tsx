import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Database,
  Filter,
  Search,
  ShieldCheck,
  Scale,
} from 'lucide-react';

import { companiesApi } from '../api/services';
import { Badge, CompanyLogo, EmptyState, Select } from '../components/ui';
import { CardSkeleton } from '../components/ui/Skeleton';
import type { Company } from '../types';

const PAGE_SIZE = 10;

function Companies() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState('');
  const [sponsorsOnly, setSponsorsOnly] = useState(false);
  const [hasOffers, setHasOffers] = useState(false);
  const [hasJobs, setHasJobs] = useState(false);
  const [ordering, setOrdering] = useState('name');
  const [page, setPage] = useState(1);

  const deferredSearch = useDeferredValue(search.trim());

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, minScore, sponsorsOnly, hasOffers, hasJobs, ordering]);

  const queryParams = useMemo(() => ({
    page,
    page_size: PAGE_SIZE,
    search: deferredSearch || undefined,
    min_score: minScore ? parseInt(minScore, 10) : undefined,
    sponsors_only: sponsorsOnly || undefined,
    has_offers: hasOffers || undefined,
    has_jobs: hasJobs || undefined,
    ordering,
  }), [deferredSearch, hasJobs, hasOffers, minScore, ordering, page, sponsorsOnly]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['companies', queryParams],
    queryFn: () => companiesApi.list(queryParams),
    placeholderData: keepPreviousData,
  });

  const { data: insights } = useQuery({
    queryKey: ['company-insights'],
    queryFn: () => companiesApi.getInsights(),
  });

  const companies = data?.results || [];
  const totalCount = data?.count || 0;
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const totalCountLabel = isLoading && !data
    ? 'Loading companies...'
    : `${totalCount.toLocaleString()} matching companies`;

  const prefetchPage = (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) {
      return;
    }

    const targetParams = { ...queryParams, page: targetPage };
    void queryClient.prefetchQuery({
      queryKey: ['companies', targetParams],
      queryFn: () => companiesApi.list(targetParams),
    });
  };

  useEffect(() => {
    if (hasNext) {
      prefetchPage(page + 1);
    }

    if (hasPrevious && page > 1) {
      prefetchPage(page - 1);
    }
  }, [hasNext, hasPrevious, page, queryClient, queryParams, totalPages]);

  const goToPreviousPage = () => {
    if (!hasPrevious) {
      return;
    }

    prefetchPage(page - 1);

    startTransition(() => {
      setPage((current) => Math.max(1, current - 1));
    });
  };

  const goToNextPage = () => {
    if (!hasNext) {
      return;
    }

    prefetchPage(page + 1);

    startTransition(() => {
      setPage((current) => Math.min(totalPages, current + 1));
    });
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

  const coverageLabel = (company: Company) => {
    if (company.first_filing_year && company.last_filing_year) {
      if (company.first_filing_year === company.last_filing_year) {
        return `FY${company.last_filing_year}`;
      }
      return `FY${company.first_filing_year}-FY${company.last_filing_year}`;
    }

    if (company.last_filing_year) {
      return `FY${company.last_filing_year}`;
    }

    return 'No FY range yet';
  };

  const coverageWindowLabel = (() => {
    if (!insights?.coverage_years.last) {
      return 'coverage data unavailable';
    }

    if (insights.coverage_years.first === insights.coverage_years.last) {
      return `FY${insights.coverage_years.last} only`;
    }

    return `FY${insights.coverage_years.first} to FY${insights.coverage_years.last}`;
  })();
  const hasBenefitsData = (insights?.total_benefits || 0) > 0;

  return (
    <div className="bg-bg-primary min-h-screen">
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-8 sm:py-12">
          <div className="header-layout mb-6 gap-4">
            <div>
              <div className="section-marker mb-2">
                <span>Directory</span>
              </div>
              <h1 className="headline-lg">Companies</h1>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="font-mono text-sm text-secondary text-left sm:text-right">
                {totalCountLabel}
                {isFetching && !isLoading ? ' • updating' : ''}
              </div>
              <Link to="/compare" className="btn btn-secondary text-sm">
                <Scale className="w-4 h-4" />
                Compare Companies
              </Link>
            </div>
          </div>

          <div className="filter-grid">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted" />
              <input
                type="text"
                placeholder="Search companies, industries, or cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 sm:pl-12 text-sm sm:text-base"
              />
            </div>

            <Select
              value={minScore}
              onChange={setMinScore}
              icon={<ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-muted" />}
              ariaLabel="Visa score filter"
              buttonClassName="text-sm sm:text-base"
              options={[
                { value: '', label: 'All Visa Scores' },
                { value: '80', label: 'Excellent (80+)' },
                { value: '60', label: 'Good (60+)' },
                { value: '40', label: 'Fair (40+)' },
              ]}
            />

            <Select
              value={ordering}
              onChange={setOrdering}
              icon={<Filter className="w-4 h-4 sm:w-5 sm:h-5 text-muted" />}
              ariaLabel="Company sort order"
              buttonClassName="text-sm sm:text-base"
              options={[
                { value: 'name', label: 'Sort by Name (A-Z)' },
                { value: '-visa_fair_score', label: 'Sort by Visa Score' },
                { value: '-total_h1b_filings', label: 'Sort by H-1B Volume' },
                { value: '-offer_count', label: 'Sort by Salary Records' },
                { value: '-active_job_count', label: 'Sort by Live Jobs' },
                { value: '-last_filing_year', label: 'Sort by Freshness' },
              ]}
            />

            <label className="flex items-center gap-3 cursor-pointer bg-white border-2 border-border px-3 sm:px-4 py-3 hover:bg-secondary transition-colors">
              <input
                type="checkbox"
                checked={sponsorsOnly}
                onChange={(e) => setSponsorsOnly(e.target.checked)}
                className="checkbox"
              />
              <span className="font-mono text-xs sm:text-sm uppercase text-primary">Sponsors Only</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer bg-white border-2 border-border px-3 sm:px-4 py-3 hover:bg-secondary transition-colors">
              <input
                type="checkbox"
                checked={hasOffers}
                onChange={(e) => setHasOffers(e.target.checked)}
                className="checkbox"
              />
              <span className="font-mono text-xs sm:text-sm uppercase text-primary">Has Salary Data</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer bg-white border-2 border-border px-3 sm:px-4 py-3 hover:bg-secondary transition-colors">
              <input
                type="checkbox"
                checked={hasJobs}
                onChange={(e) => setHasJobs(e.target.checked)}
                className="checkbox"
              />
              <span className="font-mono text-xs sm:text-sm uppercase text-primary">Has Live Jobs</span>
            </label>
          </div>
        </div>
      </div>

      <div className="container py-8 sm:py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No companies found"
            description="Try a broader search or remove one of the filters."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {companies.map((company: Company, index: number) => {
                const score = Number(company.visa_fair_score || 0);
                const scoreBadge = getScoreBadge(score);
                const confidenceBadge = getConfidenceBadge(company.data_confidence);
                const industryLabel = company.industry_display || company.industry || 'Other';
                const isOddLastCard = companies.length % 2 === 1 && index === companies.length - 1;

                return (
                  <Link
                    key={company.id}
                    to={`/companies/${company.slug}`}
                    className={`card group block p-4 sm:p-6 ${isOddLastCard ? 'lg:col-span-2' : ''}`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <CompanyLogo
                        companyName={company.name}
                        logoUrl={company.logo_url}
                        companyDomain={company.company_domain}
                        website={company.website}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg leading-tight truncate text-primary group-hover:text-accent transition-colors">
                          {company.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-secondary truncate">
                          {industryLabel}
                          {company.headquarters ? ` • ${company.headquarters}` : ''}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>

                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t-2 border-border-light">
                      <div>
                        <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                          Visa Score
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base sm:text-lg text-primary">{score}</span>
                          <Badge variant={scoreBadge.variant} size="sm">
                            {scoreBadge.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                          H-1B Count
                        </div>
                        <div className="font-bold text-base sm:text-lg text-primary">
                          {company.total_h1b_filings?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t-2 border-border-light">
                      <div>
                        <div className="font-mono text-xs uppercase text-secondary mb-1">Coverage</div>
                        <div className="text-sm font-semibold text-primary">{coverageLabel(company)}</div>
                      </div>
                      <div>
                        <div className="font-mono text-xs uppercase text-secondary mb-1">Salary Records</div>
                        <div className="text-sm font-semibold text-primary">
                          {(company.offer_count || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-xs uppercase text-secondary mb-1">Live Jobs</div>
                        <div className="text-sm font-semibold text-primary">
                          {(company.active_job_count || 0).toLocaleString()}
                        </div>
                      </div>
                      {hasBenefitsData ? (
                        <div>
                          <div className="font-mono text-xs uppercase text-secondary mb-1">Benefits</div>
                          <div className="text-sm font-semibold text-primary">
                            {(company.benefit_count || 0).toLocaleString()}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <Badge variant={confidenceBadge.variant} size="sm">
                        {confidenceBadge.label}
                      </Badge>
                      {(company.review_count || 0) > 0 ? (
                        <Badge variant="outline" size="sm">
                          {(company.review_count || 0).toLocaleString()} reviews
                        </Badge>
                      ) : null}
                      {(company.data_sources || []).slice(0, 2).map((source) => (
                        <Badge key={source} variant="outline" size="sm">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 ? (
              <div className="flex flex-col items-center justify-center gap-3 mt-8 pt-8 border-t-2 border-border sm:flex-row sm:gap-4">
                <button
                  onClick={goToPreviousPage}
                  onMouseEnter={() => prefetchPage(page - 1)}
                  onFocus={() => prefetchPage(page - 1)}
                  disabled={!hasPrevious}
                  className="btn btn-secondary flex w-full items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="text-secondary">Page</span>
                  <span className="font-bold text-primary">{page}</span>
                  <span className="text-secondary">of</span>
                  <span className="font-bold text-primary">{totalPages}</span>
                </div>

                <button
                  onClick={goToNextPage}
                  onMouseEnter={() => prefetchPage(page + 1)}
                  onFocus={() => prefetchPage(page + 1)}
                  disabled={!hasNext}
                  className="btn btn-secondary flex w-full items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {insights ? (
              <div className="card-static mt-8 p-4 sm:p-6 bg-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="section-marker mb-2">
                      <span>Data Quality</span>
                    </div>
                    <p className="text-primary font-semibold">
                      This directory currently covers {coverageWindowLabel} and
                      {' '}{insights.total_h1b_records.toLocaleString()} government records.
                    </p>
                    <p className="text-sm text-secondary mt-2">
                      Importing additional fiscal years will expand employer coverage and improve confidence for smaller companies.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline">
                      <Database className="w-3 h-3" />
                      {insights.total_h1b_records.toLocaleString()} filings
                    </Badge>
                    <Badge variant="outline">
                      {insights.total_offers.toLocaleString()} salary records
                    </Badge>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default Companies;

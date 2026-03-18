import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';

import { companiesApi } from '../api/services';
import { Badge, CompanyLogo, EmptyState } from '../components/ui';
import { CardSkeleton } from '../components/ui/Skeleton';
import type { Company } from '../types';

const PAGE_SIZE = 15;

function Companies() {
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState('');
  const [sponsorsOnly, setSponsorsOnly] = useState(false);
  const [hasOffers, setHasOffers] = useState(false);
  const [ordering, setOrdering] = useState('name');
  const [page, setPage] = useState(1);

  const deferredSearch = useDeferredValue(search.trim());

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, minScore, sponsorsOnly, hasOffers, ordering]);

  const queryParams = useMemo(() => ({
    page,
    page_size: PAGE_SIZE,
    search: deferredSearch || undefined,
    min_score: minScore ? parseInt(minScore, 10) : undefined,
    sponsors_only: sponsorsOnly || undefined,
    has_offers: hasOffers || undefined,
    ordering,
  }), [deferredSearch, hasOffers, minScore, ordering, page, sponsorsOnly]);

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
            <div className="font-mono text-sm text-secondary text-left sm:text-right">
              {totalCount.toLocaleString()} matching companies
              {isFetching && !isLoading ? ' • updating' : ''}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="card-static p-4 bg-white">
              <div className="font-mono text-xs uppercase text-secondary mb-2">Global Search</div>
              <div className="text-primary font-semibold">
                Query all {insights?.total_companies?.toLocaleString() || '0'} indexed companies
              </div>
            </div>
            <div className="card-static p-4 bg-white">
              <div className="font-mono text-xs uppercase text-secondary mb-2">Coverage</div>
              <div className="text-primary font-semibold">Current dataset coverage: {coverageWindowLabel}</div>
            </div>
            <div className="card-static p-4 bg-white">
              <div className="font-mono text-xs uppercase text-secondary mb-2">Salary Data</div>
              <div className="text-primary font-semibold">
                {insights?.companies_with_salary_data?.toLocaleString() || '0'} companies with offer records
              </div>
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

            <div className="relative">
              <ShieldCheck className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted" />
              <select
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                className="select pl-10 sm:pl-12 text-sm sm:text-base"
              >
                <option value="">All Visa Scores</option>
                <option value="80">Excellent (80+)</option>
                <option value="60">Good (60+)</option>
                <option value="40">Fair (40+)</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted" />
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="select pl-10 sm:pl-12 text-sm sm:text-base"
              >
                <option value="name">Sort by Name (A-Z)</option>
                <option value="-visa_fair_score">Sort by Visa Score</option>
                <option value="-total_h1b_filings">Sort by H-1B Volume</option>
                <option value="-offer_count">Sort by Salary Records</option>
                <option value="-last_filing_year">Sort by Freshness</option>
              </select>
            </div>

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
          </div>
        </div>
      </div>

      <div className="container py-8 sm:py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {companies.map((company: Company) => {
                const score = Number(company.visa_fair_score || 0);
                const scoreBadge = getScoreBadge(score);
                const confidenceBadge = getConfidenceBadge(company.data_confidence);
                const industryLabel = company.industry_display || company.industry || 'Other';

                return (
                  <Link
                    key={company.id}
                    to={`/companies/${company.slug}`}
                    className="card group block p-4 sm:p-6"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <CompanyLogo
                        companyName={company.name}
                        logoUrl={company.logo_url}
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
              <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t-2 border-border">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={!hasPrevious}
                  className="btn btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={!hasNext}
                  className="btn btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

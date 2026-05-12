import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  Scale,
  X,
} from 'lucide-react';

import { companiesApi } from '../api/services';
import { Badge, CompanyLogo } from '../components/ui';
import type { Company } from '../types';

const PAGE_SIZE = 12;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

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
    startTransition(() => {
      setPage(1);
    });
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

  const companies = data?.results || [];
  const totalCount = data?.count || 0;
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const prefetchPage = useCallback((targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) {
      return;
    }

    const targetParams = { ...queryParams, page: targetPage };
    void queryClient.prefetchQuery({
      queryKey: ['companies', targetParams],
      queryFn: () => companiesApi.list(targetParams),
    });
  }, [page, queryClient, queryParams, totalPages]);

  useEffect(() => {
    if (hasNext) {
      prefetchPage(page + 1);
    }
    if (hasPrevious && page > 1) {
      prefetchPage(page - 1);
    }
  }, [hasNext, hasPrevious, page, prefetchPage]);

  const goToPreviousPage = () => {
    if (!hasPrevious) return;
    prefetchPage(page - 1);
    startTransition(() => {
      setPage((current) => Math.max(1, current - 1));
    });
  };

  const goToNextPage = () => {
    if (!hasNext) return;
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
        return { variant: 'accent' as const, label: 'High' };
      case 'good':
        return { variant: 'success' as const, label: 'Good' };
      case 'emerging':
        return { variant: 'warning' as const, label: 'Emerging' };
      default:
        return { variant: 'ghost' as const, label: 'Limited' };
    }
  };


  const activeFiltersCount = [
    minScore,
    sponsorsOnly,
    hasOffers,
    hasJobs,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setMinScore('');
    setSponsorsOnly(false);
    setHasOffers(false);
    setHasJobs(false);
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-bg-tertiary border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="container-wide px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-accent" />
                <span className="text-xs uppercase tracking-[0.2em] text-text-muted">Directory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-text-primary">
                Companies
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-text-muted">
                {totalCount.toLocaleString()} companies
                {isFetching && <span className="ml-2 text-accent">• updating</span>}
              </div>
              <Link
                to="/compare"
                className="inline-flex min-h-[36px] items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-white/5"
              >
                <Scale className="w-3.5 h-3.5" />
                Compare
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search companies, industries, or cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-11 pr-10 text-sm h-11 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-bg-tertiary transition-colors"
              >
                <X className="w-3.5 h-3.5 text-text-muted" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
            {/* Score dropdown */}
            <select
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="select h-8 px-3 py-1.5 text-xs"
            >
              <option value="">All Scores</option>
              <option value="80">Excellent (80+)</option>
              <option value="60">Good (60+)</option>
              <option value="40">Fair (40+)</option>
            </select>

            {/* Sort dropdown */}
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="select h-8 px-3 py-1.5 text-xs"
            >
              <option value="name">Name (A-Z)</option>
              <option value="-visa_fair_score">Visa Score</option>
              <option value="-total_h1b_filings">H-1B Volume</option>
              <option value="-offer_count">Salary Records</option>
              <option value="-active_job_count">Live Jobs</option>
            </select>

          {/* Toggle pills */}
          {[
            { checked: sponsorsOnly, set: setSponsorsOnly, label: 'H-1B Sponsors' },
            { checked: hasOffers, set: setHasOffers, label: 'Has Salary Data' },
            { checked: hasJobs, set: setHasJobs, label: 'Has Live Jobs' },
          ].map((toggle) => (
            <button
              key={toggle.label}
              onClick={() => toggle.set((v) => !v)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                toggle.checked
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-white/5 text-text-muted hover:text-text-primary hover:border-white/10'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${toggle.checked ? 'bg-accent' : 'bg-text-muted'}`} />
              {toggle.label}
            </button>
          ))}

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-accent hover:underline ml-auto"
            >
              Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Companies Grid */}
        {companies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-bg-tertiary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No companies found</h3>
            <p className="text-text-secondary mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {companies.map((company: Company) => {
                const score = Number(company.visa_fair_score || 0);
                const scoreBadge = getScoreBadge(score);
                const confidenceBadge = getConfidenceBadge(company.data_confidence);
                const industryLabel = company.industry_display || company.industry || 'Other';

                return (
                  <div key={company.id}>
                    <Link
                      to={`/companies/${company.slug}`}
                      className="group block h-full"
                    >
                      <div className="card h-full">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-4">
                          <CompanyLogo
                            companyName={company.name}
                            logoUrl={company.logo_url}
                            companyDomain={company.company_domain}
                            website={company.website}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                              {company.name}
                            </h3>
                            <p className="text-xs text-text-muted truncate">
                              {industryLabel}
                              {company.headquarters && ` • ${company.headquarters}`}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 mb-4 border-t border-white/5 pt-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Score</div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-base font-bold text-text-primary">{score}</span>
                              <Badge variant={scoreBadge.variant} size="sm">
                                {scoreBadge.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="h-6 w-px bg-white/5" />
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">H-1B</div>
                            <div className="text-base font-bold text-text-primary">
                              {company.total_h1b_filings?.toLocaleString() || 0}
                            </div>
                          </div>
                          <div className="h-6 w-px bg-white/5" />
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Jobs</div>
                            <div className="text-base font-bold text-text-primary">
                              {(company.active_job_count || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={confidenceBadge.variant} size="sm">
                            {confidenceBadge.label}
                          </Badge>
                          {(company.review_count || 0) > 0 && (
                            <Badge variant="outline" size="sm">
                              {(company.review_count || 0).toLocaleString()} reviews
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-4 mt-12"
              >
                <button
                  onClick={goToPreviousPage}
                  disabled={!hasPrevious}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">Page</span>
                  <span className="font-semibold text-text-primary">{page}</span>
                  <span className="text-sm text-text-muted">of</span>
                  <span className="font-semibold text-text-primary">{totalPages}</span>
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={!hasNext}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Companies;

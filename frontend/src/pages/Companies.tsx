import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  X,
  SlidersHorizontal,
  TrendingUp,
  MapPin,
  Briefcase,
  ChevronDown,
} from 'lucide-react';

import { companiesApi } from '../api/services';
import { Badge, CompanyLogo, EmptyState, Select } from '../components/ui';
import type { Company } from '../types';

const PAGE_SIZE = 12;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const deferredSearch = useDeferredValue(search.trim());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const { data: insights } = useQuery({
    queryKey: ['company-insights'],
    queryFn: () => companiesApi.getInsights(),
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
    return 'No data';
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
      {/* Sticky Header with Glassmorphism */}
      <motion.div
        className={`sticky top-16 sm:top-20 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-bg-primary/90 backdrop-blur-2xl border-b border-white/5' : ''
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-2"
              >
                <Building2 className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-text-secondary">Directory</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl font-bold text-text-primary"
              >
                Companies
              </motion.h1>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="text-sm text-text-muted">
                {totalCount.toLocaleString()} companies
                {isFetching && <span className="ml-2 text-accent">• updating</span>}
              </div>
              <Link to="/compare" className="btn btn-secondary btn-sm">
                <Scale className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </Link>
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-2xl"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search companies, industries, or cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-12 pr-12 text-base h-14"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-bg-tertiary transition-colors"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden lg:block w-72 flex-shrink-0"
          >
            <div className="sticky top-40 space-y-6">
              {/* Filters Card */}
              <div className="card-static p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-text-primary">Filters</span>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-accent hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Score Filter */}
                  <div>
                    <label className="label mb-3">Visa Score</label>
                    <Select
                      value={minScore}
                      onChange={setMinScore}
                      icon={<ShieldCheck className="w-4 h-4 text-text-muted" />}
                      ariaLabel="Visa score filter"
                      options={[
                        { value: '', label: 'All Scores' },
                        { value: '80', label: 'Excellent (80+)' },
                        { value: '60', label: 'Good (60+)' },
                        { value: '40', label: 'Fair (40+)' },
                      ]}
                    />
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="label mb-3">Sort By</label>
                    <Select
                      value={ordering}
                      onChange={setOrdering}
                      icon={<TrendingUp className="w-4 h-4 text-text-muted" />}
                      ariaLabel="Sort order"
                      options={[
                        { value: 'name', label: 'Name (A-Z)' },
                        { value: '-visa_fair_score', label: 'Visa Score' },
                        { value: '-total_h1b_filings', label: 'H-1B Volume' },
                        { value: '-offer_count', label: 'Salary Records' },
                        { value: '-active_job_count', label: 'Live Jobs' },
                      ]}
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sponsorsOnly}
                        onChange={(e) => setSponsorsOnly(e.target.checked)}
                        className="checkbox"
                      />
                      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                        H-1B Sponsors Only
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={hasOffers}
                        onChange={(e) => setHasOffers(e.target.checked)}
                        className="checkbox"
                      />
                      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                        Has Salary Data
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={hasJobs}
                        onChange={(e) => setHasJobs(e.target.checked)}
                        className="checkbox"
                      />
                      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                        Has Live Jobs
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Data Info */}
              {insights && (
                <div className="card-static p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-text-primary text-sm">Data Coverage</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Covering {insights.total_h1b_records.toLocaleString()} H-1B records from{' '}
                    {insights.coverage_years.first === insights.coverage_years.last
                      ? `FY${insights.coverage_years.last}`
                      : `FY${insights.coverage_years.first}-FY${insights.coverage_years.last}`}
                  </p>
                </div>
              )}
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="btn btn-secondary w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-accent text-white text-xs">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showMobileFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="card-static p-4 mt-3 space-y-4">
                      <Select
                        value={minScore}
                        onChange={setMinScore}
                        ariaLabel="Visa score filter"
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
                        ariaLabel="Sort order"
                        options={[
                          { value: 'name', label: 'Sort by Name' },
                          { value: '-visa_fair_score', label: 'Sort by Visa Score' },
                          { value: '-total_h1b_filings', label: 'Sort by H-1B Volume' },
                        ]}
                      />
                      <div className="space-y-2">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={sponsorsOnly}
                            onChange={(e) => setSponsorsOnly(e.target.checked)}
                            className="checkbox"
                          />
                          <span className="text-sm text-text-secondary">Sponsors Only</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={hasOffers}
                            onChange={(e) => setHasOffers(e.target.checked)}
                            className="checkbox"
                          />
                          <span className="text-sm text-text-secondary">Has Salary Data</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={hasJobs}
                            onChange={(e) => setHasJobs(e.target.checked)}
                            className="checkbox"
                          />
                          <span className="text-sm text-text-secondary">Has Live Jobs</span>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Companies Grid */}
            {companies.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-static py-16 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-bg-tertiary flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-text-muted" />
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
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                  {companies.map((company: Company) => {
                    const score = Number(company.visa_fair_score || 0);
                    const scoreBadge = getScoreBadge(score);
                    const confidenceBadge = getConfidenceBadge(company.data_confidence);
                    const industryLabel = company.industry_display || company.industry || 'Other';

                    return (
                      <motion.div
                        key={company.id}
                        variants={itemVariants}
                        layout
                      >
                        <Link
                          to={`/companies/${company.slug}`}
                          className="group block h-full"
                        >
                          <div className="card h-full">
                            {/* Header */}
                            <div className="flex items-start gap-4 mb-5">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                              >
                                <CompanyLogo
                                  companyName={company.name}
                                  logoUrl={company.logo_url}
                                  companyDomain={company.company_domain}
                                  website={company.website}
                                  size="md"
                                />
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                                  {company.name}
                                </h3>
                                <p className="text-sm text-text-muted truncate">
                                  {industryLabel}
                                  {company.headquarters && ` • ${company.headquarters}`}
                                </p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="p-3 rounded-xl bg-bg-glass">
                                <div className="text-xs text-text-muted mb-1">Visa Score</div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-text-primary">{score}</span>
                                  <Badge variant={scoreBadge.variant} size="sm">
                                    {scoreBadge.label}
                                  </Badge>
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-bg-glass">
                                <div className="text-xs text-text-muted mb-1">H-1B Count</div>
                                <div className="font-bold text-text-primary">
                                  {company.total_h1b_filings?.toLocaleString() || 0}
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-bg-glass">
                                <div className="text-xs text-text-muted mb-1">Coverage</div>
                                <div className="font-medium text-text-primary text-sm">
                                  {coverageLabel(company)}
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-bg-glass">
                                <div className="text-xs text-text-muted mb-1">Live Jobs</div>
                                <div className="font-bold text-text-primary">
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
                      </motion.div>
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
      </div>
    </div>
  );
}

export default Companies;

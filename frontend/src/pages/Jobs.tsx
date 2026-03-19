import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Filter,
  Globe2,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';

import { jobsApi } from '../api/services';
import { Badge, Card, CardBody, CompanyLogo, EmptyState, Select, Spinner } from '../components/ui';
import type { JobPosting } from '../types';

const PAGE_SIZE = 10;

function Jobs() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [remotePolicy, setRemotePolicy] = useState(searchParams.get('remote_policy') || '');
  const [visaSignal, setVisaSignal] = useState(searchParams.get('visa_sponsorship_signal') || '');
  const [source, setSource] = useState(searchParams.get('source') || '');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-job_score');
  const [hasSalary, setHasSalary] = useState(searchParams.get('has_salary') === 'true');
  const [postedWithinDays, setPostedWithinDays] = useState(searchParams.get('posted_within_days') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || '1'));
  const [companySlug, setCompanySlug] = useState(searchParams.get('company_slug') || '');

  const deferredSearch = useDeferredValue(search.trim());
  const deferredLocation = useDeferredValue(location.trim());

  useEffect(() => {
    setPage(1);
  }, [companySlug, deferredLocation, deferredSearch, hasSalary, ordering, postedWithinDays, remotePolicy, source, visaSignal]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (deferredSearch) next.set('search', deferredSearch);
    if (deferredLocation) next.set('location', deferredLocation);
    if (remotePolicy) next.set('remote_policy', remotePolicy);
    if (visaSignal) next.set('visa_sponsorship_signal', visaSignal);
    if (source) next.set('source', source);
    if (ordering && ordering !== '-job_score') next.set('ordering', ordering);
    if (hasSalary) next.set('has_salary', 'true');
    if (postedWithinDays) next.set('posted_within_days', postedWithinDays);
    if (companySlug) next.set('company_slug', companySlug);
    if (page > 1) next.set('page', String(page));
    setSearchParams(next, { replace: true });
  }, [
    companySlug,
    deferredLocation,
    deferredSearch,
    hasSalary,
    ordering,
    page,
    postedWithinDays,
    remotePolicy,
    setSearchParams,
    source,
    visaSignal,
  ]);

  const listParams = useMemo(() => ({
    page,
    page_size: PAGE_SIZE,
    search: deferredSearch || undefined,
    location: deferredLocation || undefined,
    company_slug: companySlug || undefined,
    source: source || undefined,
    remote_policy: remotePolicy || undefined,
    visa_sponsorship_signal: visaSignal || undefined,
    has_salary: hasSalary || undefined,
    posted_within_days: postedWithinDays ? parseInt(postedWithinDays, 10) : undefined,
    ordering,
  }), [
    companySlug,
    deferredLocation,
    deferredSearch,
    hasSalary,
    ordering,
    page,
    postedWithinDays,
    remotePolicy,
    source,
    visaSignal,
  ]);

  const statsParams = useMemo(() => ({
    search: deferredSearch || undefined,
    location: deferredLocation || undefined,
    company_slug: companySlug || undefined,
    source: source || undefined,
    remote_policy: remotePolicy || undefined,
    visa_sponsorship_signal: visaSignal || undefined,
    has_salary: hasSalary || undefined,
    posted_within_days: postedWithinDays ? parseInt(postedWithinDays, 10) : undefined,
  }), [
    companySlug,
    deferredLocation,
    deferredSearch,
    hasSalary,
    postedWithinDays,
    remotePolicy,
    source,
    visaSignal,
  ]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', listParams],
    queryFn: () => jobsApi.list(listParams),
    placeholderData: keepPreviousData,
  });

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['job-statistics', statsParams],
    queryFn: () => jobsApi.statistics(statsParams),
  });

  const jobs = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;

  const prefetchPage = (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) {
      return;
    }

    const targetParams = { ...listParams, page: targetPage };
    void queryClient.prefetchQuery({
      queryKey: ['jobs', targetParams],
      queryFn: () => jobsApi.list(targetParams),
    });
  };

  useEffect(() => {
    if (hasNext) {
      prefetchPage(page + 1);
    }

    if (hasPrevious && page > 1) {
      prefetchPage(page - 1);
    }
  }, [hasNext, hasPrevious, listParams, page, queryClient, totalPages]);

  const sourceOptions = [
    { value: '', label: 'All Sources' },
    ...(statistics?.by_source || []).map((entry) => ({
      value: entry.source,
      label: `${entry.source.charAt(0).toUpperCase()}${entry.source.slice(1)}`,
    })),
  ];

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setRemotePolicy('');
    setVisaSignal('');
    setSource('');
    setOrdering('-job_score');
    setHasSalary(false);
    setPostedWithinDays('');
    setCompanySlug('');
    setPage(1);
  };

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

  const formatMoney = (value?: number | null) => {
    if (!value) {
      return null;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatRange = (job: JobPosting) => {
    const minimum = formatMoney(job.salary_min);
    const maximum = formatMoney(job.salary_max);
    if (minimum && maximum) {
      return `${minimum} - ${maximum}`;
    }
    return minimum || maximum || null;
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return 'Recently refreshed';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  };

  const getVisaBadge = (signal?: string) => {
    switch (signal) {
      case 'historically_sponsors':
        return { variant: 'accent' as const, label: 'Historically Sponsors' };
      case 'likely':
        return { variant: 'success' as const, label: 'Likely Sponsor' };
      default:
        return { variant: 'ghost' as const, label: 'Signal Limited' };
    }
  };

  const getRemoteBadge = (policy?: string) => {
    switch (policy) {
      case 'remote':
        return { variant: 'success' as const, label: 'Remote' };
      case 'hybrid':
        return { variant: 'warning' as const, label: 'Hybrid' };
      case 'onsite':
        return { variant: 'outline' as const, label: 'On-site' };
      default:
        return { variant: 'ghost' as const, label: 'Location Pending' };
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-8 sm:py-12">
          <div className="jobs-hero-grid">
            <div>
              <div className="section-marker mb-3 sm:mb-4">
                <span>Hiring</span>
              </div>
              <h1 className="headline-lg mb-4">Live Jobs, ranked for sponsorship signal</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-secondary sm:text-base">
                Browse roles from public ATS boards with company visa history, salary evidence,
                and freshness signals layered directly into each result. Once deployed, this
                surface is designed to refresh itself in the background.
              </p>

              <div className="jobs-hero-meta mt-5 sm:mt-6">
                <span>Automated ATS sync</span>
                <span>Source-linked apply flow</span>
                <span>Visa-aware ranking</span>
              </div>
            </div>

            <div className="jobs-hero-panel">
              <div className="jobs-hero-panel-label">Current search surface</div>
              {statsLoading ? (
                <div className="flex items-center gap-3 text-secondary">
                  <Spinner size="sm" />
                  Updating live hiring stats...
                </div>
              ) : (
                <div className="jobs-hero-stats">
                  <div>
                    <div className="jobs-hero-stat-value">{statistics?.total_jobs?.toLocaleString() || '0'}</div>
                    <div className="jobs-hero-stat-label">active jobs</div>
                  </div>
                  <div>
                    <div className="jobs-hero-stat-value">{statistics?.company_count?.toLocaleString() || '0'}</div>
                    <div className="jobs-hero-stat-label">hiring companies</div>
                  </div>
                  <div>
                    <div className="jobs-hero-stat-value">{statistics?.remote_jobs?.toLocaleString() || '0'}</div>
                    <div className="jobs-hero-stat-label">remote jobs</div>
                  </div>
                  <div>
                    <div className="jobs-hero-stat-value">{statistics?.salary_visible_jobs?.toLocaleString() || '0'}</div>
                    <div className="jobs-hero-stat-label">salary-visible jobs</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="jobs-filters mt-8">
            <div className="jobs-filter-field jobs-filter-field-wide relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search jobs or companies"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input jobs-filter-input pl-11"
              />
            </div>

            <div className="jobs-filter-field relative">
              <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Location or remote"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="input jobs-filter-input pl-11"
              />
            </div>

            <Select
              value={remotePolicy}
              onChange={setRemotePolicy}
              ariaLabel="Remote policy filter"
              icon={<Globe2 className="h-4 w-4 text-muted" />}
              className="jobs-filter-field"
              buttonClassName="jobs-filter-select"
              options={[
                { value: '', label: 'Any workplace' },
                { value: 'remote', label: 'Remote' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'onsite', label: 'On-site' },
              ]}
            />

            <Select
              value={visaSignal}
              onChange={setVisaSignal}
              ariaLabel="Visa sponsorship signal filter"
              icon={<Sparkles className="h-4 w-4 text-muted" />}
              className="jobs-filter-field"
              buttonClassName="jobs-filter-select"
              options={[
                { value: '', label: 'Any sponsor signal' },
                { value: 'historically_sponsors', label: 'Historically Sponsors' },
                { value: 'likely', label: 'Likely Sponsor' },
                { value: 'unknown', label: 'Signal Limited' },
              ]}
            />

            <Select
              value={source}
              onChange={setSource}
              ariaLabel="Job source filter"
              icon={<BriefcaseBusiness className="h-4 w-4 text-muted" />}
              className="jobs-filter-field"
              buttonClassName="jobs-filter-select"
              options={sourceOptions.map((option) => ({
                ...option,
                label: option.value === '' ? 'All ATS sources' : option.label,
              }))}
            />

            <Select
              value={postedWithinDays}
              onChange={setPostedWithinDays}
              ariaLabel="Recency filter"
              icon={<Clock3 className="h-4 w-4 text-muted" />}
              className="jobs-filter-field"
              buttonClassName="jobs-filter-select"
              options={[
                { value: '', label: 'Any posting age' },
                { value: '7', label: 'Last 7 Days' },
                { value: '30', label: 'Last 30 Days' },
              ]}
            />

            <Select
              value={ordering}
              onChange={setOrdering}
              ariaLabel="Job ordering"
              icon={<Filter className="h-4 w-4 text-muted" />}
              className="jobs-filter-field"
              buttonClassName="jobs-filter-select"
              options={[
                { value: '-job_score', label: 'Best match' },
                { value: '-posted_at', label: 'Newest First' },
                { value: 'company', label: 'Company A-Z' },
                { value: 'title', label: 'Title A-Z' },
              ]}
            />

            <button
              type="button"
              onClick={() => setHasSalary((current) => !current)}
              className={`jobs-toggle jobs-filter-field ${hasSalary ? 'jobs-toggle-active' : ''}`}
            >
              <DollarSign className="h-4 w-4" />
              Salary posted
            </button>
          </div>

          <div className="jobs-results-meta mt-4">
            <div className="font-mono text-xs uppercase tracking-wider text-secondary">
              {isLoading && !data ? 'Loading jobs...' : `${totalCount.toLocaleString()} matching jobs`}
              {isFetching && !isLoading ? ' • refreshing' : ''}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {companySlug ? (
                <button type="button" className="badge badge-outline" onClick={() => setCompanySlug('')}>
                  Company filter: {companySlug}
                </button>
              ) : null}
              <button type="button" className="btn btn-secondary text-xs sm:text-sm" onClick={clearFilters}>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        {isLoading && !data ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <Card key={index} static className="overflow-hidden">
                <CardBody className="space-y-4 p-5 sm:p-6">
                  <div className="h-6 w-2/3 skeleton" />
                  <div className="h-4 w-1/2 skeleton" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 skeleton" />
                    <div className="h-16 skeleton" />
                  </div>
                  <div className="h-10 w-full skeleton" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={BriefcaseBusiness}
            title="No jobs match these filters"
            description="Try broadening the title, location, or sponsorship filters. The jobs surface refreshes from supported public boards in the background."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {jobs.map((job, index) => {
                const visaBadge = getVisaBadge(job.visa_sponsorship_signal);
                const remoteBadge = getRemoteBadge(job.remote_policy);
                const compensation = formatRange(job);
                const isOddLastCard = jobs.length % 2 === 1 && index === jobs.length - 1;

                return (
                  <Card
                    key={job.id}
                    static
                    className={`jobs-result-card h-full overflow-hidden ${isOddLastCard ? 'xl:col-span-2' : ''}`}
                  >
                    <CardBody className="jobs-card-body">
                      <div className="jobs-card-top">
                        <div className="jobs-card-heading">
                          <CompanyLogo
                            companyName={job.company_name}
                            logoUrl={job.company_logo_url}
                            companyDomain={job.company_domain}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="jobs-card-badges">
                              <Badge variant={visaBadge.variant}>{visaBadge.label}</Badge>
                              <Badge variant={remoteBadge.variant}>{remoteBadge.label}</Badge>
                              <Badge variant="outline">{job.source.toUpperCase()}</Badge>
                              {job.job_score ? <Badge variant="ghost">Score {job.job_score}</Badge> : null}
                            </div>
                            <h2 className="jobs-card-title">{job.title}</h2>
                            <div className="jobs-card-meta">
                              <span className="jobs-card-company">{job.company_name}</span>
                              {job.location ? (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {job.location}
                                </span>
                              ) : null}
                              {job.team ? <span className="jobs-card-team">{job.team}</span> : null}
                            </div>
                          </div>
                        </div>

                        <div className="jobs-card-apply">
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary w-full justify-center text-sm"
                          >
                            Apply on Source
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        </div>
                      </div>

                      <div className="jobs-evidence-grid">
                        <div className="jobs-evidence-card">
                          <div className="jobs-evidence-label">Sponsorship Signal</div>
                          <div className="jobs-evidence-value">
                            {job.company_visa_fair_score ? `${job.company_visa_fair_score.toFixed(1)} visa score` : 'Signal building'}
                          </div>
                          <div className="jobs-evidence-detail">
                            {job.company_h1b_approval_rate
                              ? `${job.company_h1b_approval_rate.toFixed(1)}% historical approval rate`
                              : 'Approval history still limited'}
                          </div>
                        </div>

                        <div className="jobs-evidence-card">
                          <div className="jobs-evidence-label">Compensation Evidence</div>
                          <div className="jobs-evidence-value">{compensation || 'Salary not posted'}</div>
                          <div className="jobs-evidence-detail">
                            {compensation
                              ? 'Published directly on the board'
                              : `${job.company_offer_count || 0} salary records available for this employer`}
                          </div>
                        </div>

                        <div className="jobs-evidence-card">
                          <div className="jobs-evidence-label">Freshness</div>
                          <div className="jobs-evidence-value">{formatDate(job.posted_at)}</div>
                          <div className="jobs-evidence-detail">Last seen {formatDate(job.last_seen_at)}</div>
                        </div>
                      </div>

                      {job.match_reasons && job.match_reasons.length > 0 ? (
                        <div className="jobs-reason-list">
                          {job.match_reasons.map((reason) => (
                            <div key={reason} className="jobs-reason-item">
                              <span className="jobs-reason-dot" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="jobs-card-footer">
                        <Link to={`/companies/${job.company_slug}`} className="btn btn-secondary justify-center text-sm">
                          View Company
                        </Link>
                        <button
                          type="button"
                          className="font-mono text-xs uppercase tracking-wider text-secondary hover:text-accent transition-colors text-left sm:text-right"
                          onClick={() => setCompanySlug(job.company_slug)}
                        >
                          More roles from {job.company_name}
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 ? (
              <div className="flex flex-col items-center justify-center gap-3 pt-8 mt-8 border-t-2 border-border sm:flex-row sm:gap-4">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  onMouseEnter={() => prefetchPage(page - 1)}
                  onFocus={() => prefetchPage(page - 1)}
                  disabled={!hasPrevious}
                  className="flex w-full items-center justify-center gap-2 btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="text-secondary">Page</span>
                  <span className="font-bold text-primary">{page}</span>
                  <span className="text-secondary">of</span>
                  <span className="font-bold text-primary">{totalPages}</span>
                </div>

                <button
                  type="button"
                  onClick={goToNextPage}
                  onMouseEnter={() => prefetchPage(page + 1)}
                  onFocus={() => prefetchPage(page + 1)}
                  disabled={!hasNext}
                  className="flex w-full items-center justify-center gap-2 btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default Jobs;

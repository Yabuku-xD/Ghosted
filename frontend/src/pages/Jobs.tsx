import type { AxiosError } from 'axios';
import { type ChangeEvent, startTransition, useDeferredValue, useEffect, useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Download,
  FileText,
  Filter,
  Globe2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';

import { jobsApi } from '../api/services';
import { Alert, Badge, Button, Card, CardBody, CompanyLogo, EmptyState, Select, Spinner, useToast } from '../components/ui';
import type { JobPosting, ResumeMatchSession } from '../types';

const PAGE_SIZE = 10;
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_SESSION_STORAGE_KEY = 'ghosted:resume-match-session';

function Jobs() {
  const toast = useToast();
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
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeSessionId, setResumeSessionId] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.sessionStorage.getItem(RESUME_SESSION_STORAGE_KEY);
  });
  const searchInputId = useId();
  const locationInputId = useId();
  const resumeInputId = useId();

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (resumeSessionId) {
      window.sessionStorage.setItem(RESUME_SESSION_STORAGE_KEY, resumeSessionId);
      return;
    }

    window.sessionStorage.removeItem(RESUME_SESSION_STORAGE_KEY);
  }, [resumeSessionId]);

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

  const resumeFilters = useMemo(() => ({
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

  const resumeSessionQuery = useQuery({
    queryKey: ['job-resume-match', resumeSessionId],
    queryFn: () => jobsApi.getResumeMatchSession(resumeSessionId as string),
    enabled: Boolean(resumeSessionId),
    retry: (failureCount, error) => {
      const status = (error as AxiosError | undefined)?.response?.status;
      if (status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    refetchInterval: (query) => {
      const session = query.state.data as ResumeMatchSession | undefined;
      return session?.status === 'processing' ? 2000 : false;
    },
  });

  useEffect(() => {
    const status = (resumeSessionQuery.error as AxiosError | undefined)?.response?.status;
    if (status === 404 && resumeSessionId) {
      setResumeSessionId(null);
      setResumeFile(null);
      void queryClient.removeQueries({ queryKey: ['job-resume-match'] });
      toast.info('The temporary resume session expired or was refreshed after an update. Upload again for a fresh shortlist.', 'Session expired');
    }
  }, [queryClient, resumeSessionId, resumeSessionQuery.error, toast]);

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      if (resumeSessionId) {
        await jobsApi.clearResumeMatchSession(resumeSessionId).catch(() => undefined);
      }
      return jobsApi.createResumeMatchSession(file, resumeFilters);
    },
    onSuccess: (session) => {
      setResumeSessionId(session.session_id);
      setResumeFile(null);
      toast.success('Ghosted is tailoring a shortlist now.', 'Resume processing');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Resume upload failed.';
      toast.error(message, 'Upload failed');
    },
  });

  const clearResumeMutation = useMutation({
    mutationFn: async (sessionId: string) => jobsApi.clearResumeMatchSession(sessionId),
    onSuccess: () => {
      setResumeSessionId(null);
      setResumeFile(null);
      void queryClient.removeQueries({ queryKey: ['job-resume-match'] });
      toast.info('Temporary resume session cleared.', 'Session removed');
    },
    onError: () => {
      toast.error('Could not clear the temporary session. Please try again.', 'Clear failed');
    },
  });

  const jobs = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;
  const resumeSession = resumeSessionQuery.data;
  const resumeDownloadUrl = resumeSessionId && resumeSession?.has_download
    ? jobsApi.getResumeMatchDownloadUrl(resumeSessionId)
    : null;

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

  const handleResumeFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    event.target.value = '';

    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.warning('Please choose a PDF resume.', 'Unsupported file');
      return;
    }

    if (file.size > MAX_RESUME_BYTES) {
      toast.warning('Please keep the resume under 5 MB.', 'File too large');
      return;
    }

    setResumeFile(file);
  };

  const handleResumeUpload = () => {
    if (!resumeFile) {
      toast.info('Choose a PDF resume first.', 'Resume required');
      return;
    }

    uploadResumeMutation.mutate(resumeFile);
  };

  const handleResumeClear = () => {
    if (resumeSessionId) {
      clearResumeMutation.mutate(resumeSessionId);
      return;
    }
    setResumeFile(null);
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

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return null;
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
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

  const getMatchBadge = (band?: string) => {
    if (band === 'high') {
      return { variant: 'success' as const, label: 'High match' };
    }
    return { variant: 'warning' as const, label: 'Good match' };
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

          <Card static className="jobs-resume-shell mt-8 overflow-hidden">
            <CardBody className="jobs-resume-grid">
              <div className="jobs-resume-upload">
                <div className="section-marker mb-3">
                  <span>Temporary Resume Match</span>
                </div>
                <h2 className="headline-sm mb-3">Upload one PDF, get only the strongest-fit roles</h2>
                <p className="text-sm leading-relaxed text-secondary sm:text-base">
                  Ghosted reads your uploaded resume temporarily, scores only the higher-signal jobs against
                  the live description text and experience requirements, then generates one shared tailored
                  resume for the strongest role cluster.
                </p>

                <div className="jobs-resume-note">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <span>Raw PDFs are deleted after extraction. Reload keeps the shortlist in this tab until it expires or you clear it.</span>
                </div>

                <div className="jobs-resume-actions">
                  <label htmlFor={resumeInputId} className="jobs-resume-dropzone">
                    <Upload className="h-5 w-5 text-accent" />
                    <div>
                      <div className="font-semibold text-primary">
                        {resumeFile ? resumeFile.name : 'Choose a PDF resume'}
                      </div>
                      <div className="text-sm text-secondary">PDF only, up to 5 MB, no permanent storage</div>
                    </div>
                  </label>
                  <input
                    id={resumeInputId}
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={handleResumeFileChange}
                  />

                  <div className="jobs-resume-button-row">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleResumeUpload}
                      loading={uploadResumeMutation.isPending}
                      disabled={!resumeFile || clearResumeMutation.isPending}
                    >
                      <FileText className="h-4 w-4" />
                      Generate shortlist
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleResumeClear}
                      disabled={(!resumeFile && !resumeSessionId) || clearResumeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear session
                    </Button>
                  </div>
                </div>
              </div>

              <div className="jobs-resume-summary">
                {!resumeSessionId ? (
                  <div className="jobs-resume-empty">
                    <FileText className="h-10 w-10 text-muted" />
                    <div>
                      <div className="jobs-resume-summary-title">High-match shortlist will appear here</div>
                      <p className="mt-2 text-sm leading-relaxed text-secondary">
                        The current Jobs filters are included automatically, so the upload is scoped to what
                        you are browsing right now.
                      </p>
                    </div>
                  </div>
                ) : resumeSession?.status === 'processing' || uploadResumeMutation.isPending || resumeSessionQuery.isLoading ? (
                  <div className="jobs-resume-processing">
                    <Spinner />
                    <div>
                      <div className="jobs-resume-summary-title">Processing your temporary resume session</div>
                      <p className="mt-2 text-sm leading-relaxed text-secondary">
                        Ghosted is extracting experience, checking years requirements, and filtering out
                        low-match roles before building a common tailored PDF.
                      </p>
                    </div>
                  </div>
                ) : resumeSessionQuery.isError ? (
                  <Alert variant="warning" title="Temporary session expired">
                    The upload session is no longer available. Choose the PDF again if you want a fresh shortlist.
                  </Alert>
                ) : resumeSession?.status === 'failed' ? (
                  <Alert variant="error" title="Resume processing failed">
                    {resumeSession.error || 'The uploaded PDF could not be parsed. Try a simpler text-based PDF.'}
                  </Alert>
                ) : resumeSession?.status === 'completed' ? (
                  <div className="space-y-4">
                    <div className="jobs-resume-summary-top">
                      <div>
                        <div className="jobs-resume-summary-title">
                          {resumeSession.high_match_count || 0} high-match jobs found
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-secondary">
                          Filtered out {resumeSession.filtered_low_match_count || 0} lower-signal roles
                          and grouped the strongest fits into one tailored resume track.
                        </p>
                      </div>
                      {resumeDownloadUrl && resumeSession.resume_ready ? (
                        <a
                          href={resumeDownloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary w-full justify-center sm:w-auto"
                        >
                          <Download className="h-4 w-4" />
                          Download tailored PDF
                        </a>
                      ) : null}
                    </div>

                    <div className="jobs-resume-stat-grid">
                      <div className="jobs-resume-stat">
                        <div className="jobs-resume-stat-label">Estimated experience</div>
                        <div className="jobs-resume-stat-value">
                          {resumeSession.profile_summary?.estimated_years_experience || 0}+ years
                        </div>
                      </div>
                      <div className="jobs-resume-stat">
                        <div className="jobs-resume-stat-label">Target cluster</div>
                        <div className="jobs-resume-stat-value">
                          {resumeSession.target_cluster?.family || 'Generalist'}
                        </div>
                      </div>
                      <div className="jobs-resume-stat">
                        <div className="jobs-resume-stat-label">Expires</div>
                        <div className="jobs-resume-stat-value">
                          {formatDateTime(resumeSession.expires_at) || 'Soon'}
                        </div>
                      </div>
                    </div>

                    {resumeSession.profile_summary?.top_skills?.length ? (
                      <div className="jobs-resume-badge-row">
                        {resumeSession.profile_summary.top_skills.slice(0, 8).map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    ) : null}

                    {(resumeSession.high_match_count || 0) === 0 ? (
                      <Alert variant="warning" title="No strong matches under the current filters">
                        Try loosening the Jobs filters or uploading a resume with more machine-readable text.
                        Ghosted intentionally hides lower-signal roles instead of forcing weak matches.
                      </Alert>
                    ) : null}

                    <p className="text-xs leading-relaxed text-secondary">
                      {resumeSession.privacy_note}
                    </p>
                  </div>
                ) : null}
              </div>
            </CardBody>
          </Card>

          <div className="jobs-filters mt-8">
            <div className="jobs-filter-field jobs-filter-field-wide relative">
              <label htmlFor={searchInputId} className="sr-only">Search jobs or companies</label>
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id={searchInputId}
                type="text"
                placeholder="Search jobs or companies"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input jobs-filter-input pl-11"
              />
            </div>

            <div className="jobs-filter-field relative">
              <label htmlFor={locationInputId} className="sr-only">Filter jobs by location or remote</label>
              <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id={locationInputId}
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
            {resumeSession?.status === 'completed' && (resumeSession.high_matches?.length || 0) > 0 ? (
              <section className="jobs-resume-shortlist">
                <div className="company-section-head">
                  <div>
                    <div className="section-marker mb-3">
                      <span>Resume shortlist</span>
                    </div>
                    <h2 className="headline-sm">Top roles filtered from your temporary upload</h2>
                    <p className="company-section-copy">
                      These are the strongest matches only. The ranking combines live job-description overlap,
                      experience requirements, seniority alignment, and Ghosted’s sponsorship signal.
                    </p>
                  </div>
                  {resumeDownloadUrl && resumeSession.resume_ready ? (
                    <a
                      href={resumeDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary w-full justify-center sm:w-auto"
                    >
                      <Download className="h-4 w-4" />
                      Download tailored resume
                    </a>
                  ) : null}
                </div>

                <div className="jobs-resume-match-grid">
                  {resumeSession.high_matches?.map((match) => {
                    const visaBadge = getVisaBadge(match.visa_sponsorship_signal);
                    const remoteBadge = getRemoteBadge(match.remote_policy);
                    const matchBadge = getMatchBadge(match.resume_match_band);
                    const matchCompensation = formatRange(match);

                    return (
                      <Card key={match.id} static className="jobs-resume-match-card">
                        <CardBody className="space-y-4 p-5">
                          <div className="flex items-start gap-3">
                            <CompanyLogo
                              companyName={match.company_name}
                              logoUrl={match.company_logo_url}
                              companyDomain={match.company_domain}
                              size="sm"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="jobs-card-badges">
                                <Badge variant={matchBadge.variant}>{matchBadge.label}</Badge>
                                <Badge variant={visaBadge.variant}>{visaBadge.label}</Badge>
                                <Badge variant={remoteBadge.variant}>{remoteBadge.label}</Badge>
                              </div>
                              <h3 className="text-xl font-semibold leading-tight text-primary">{match.title}</h3>
                              <p className="mt-2 text-sm leading-relaxed text-secondary">
                                {match.company_name}
                                {match.location ? ` • ${match.location}` : ''}
                                {match.team ? ` • ${match.team}` : ''}
                              </p>
                            </div>
                            <div className="jobs-resume-score-block">
                              <div className="jobs-resume-score-value">{match.resume_match_score}</div>
                              <div className="jobs-resume-score-label">match</div>
                            </div>
                          </div>

                          <div className="jobs-resume-match-meta">
                            <div>
                              <div className="jobs-resume-match-label">Required years</div>
                              <div className="jobs-resume-match-value">
                                {match.required_years_experience ? `${match.required_years_experience}+ years` : 'Not stated'}
                              </div>
                            </div>
                            <div>
                              <div className="jobs-resume-match-label">Your fit</div>
                              <div className="jobs-resume-match-value">
                                {match.candidate_years_experience ? `${match.candidate_years_experience}+ relevant years` : 'Role-aligned'}
                              </div>
                            </div>
                            <div>
                              <div className="jobs-resume-match-label">Compensation signal</div>
                              <div className="jobs-resume-match-value">
                                {matchCompensation || `${match.company_offer_count || 0} salary records`}
                              </div>
                            </div>
                          </div>

                          <div className="jobs-resume-reason-list">
                            {match.resume_match_reasons.map((reason) => (
                              <div key={reason} className="jobs-resume-reason-item">
                                <span className="jobs-reason-dot" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>

                          {match.matched_skills.length ? (
                            <div className="jobs-resume-badge-row">
                              {match.matched_skills.slice(0, 6).map((skill) => (
                                <Badge key={skill} variant="outline">{skill}</Badge>
                              ))}
                            </div>
                          ) : null}

                          <div className="jobs-card-footer">
                            <Link to={`/companies/${match.company_slug}`} className="btn btn-secondary justify-center text-sm">
                              View Company
                            </Link>
                            <a
                              href={match.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs uppercase tracking-wider text-accent hover-underline"
                            >
                              Open job posting
                            </a>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ) : null}

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

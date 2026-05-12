import { type ChangeEvent, startTransition, useEffect, useId, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  Search,
  Trash2,
  Upload,
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  MapPin,
  Globe,
  Loader2,
} from 'lucide-react';

import { jobsApi, jobDiscoveryApi } from '../api/services';
import { Badge, useToast } from '../components/ui';
import type { JobPosting } from '../types';

const PAGE_SIZE = 12;
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_SESSION_STORAGE_KEY = 'ghosted:resume-match-session';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

function Jobs() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputId = useId();
  const locationInputId = useId();
  const resumeInputId = useId();
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [remotePolicy, setRemotePolicy] = useState(searchParams.get('remote_policy') || '');
  const [visaSignal, setVisaSignal] = useState(searchParams.get('visa_sponsorship_signal') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employment_type') || '');
  const [sourceFilters, setSourceFilters] = useState<string[]>(
    searchParams.get('source') ? searchParams.get('source')!.split(',').filter(Boolean) : []
  );
  const [degreeLevel, setDegreeLevel] = useState(searchParams.get('degree_level') || '');
  const [maxExperience, setMaxExperience] = useState(searchParams.get('max_experience') || '');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-job_score');
  const [hasSalary, setHasSalary] = useState(searchParams.get('has_salary') === 'true');
  const [postedWithinDays, setPostedWithinDays] = useState(searchParams.get('posted_within_days') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || '1'));
  const [companySlug, setCompanySlug] = useState(searchParams.get('company_slug') || '');

  // Resume states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeSessionId, setResumeSessionId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage.getItem(RESUME_SESSION_STORAGE_KEY);
  });

  const [debouncedSearch, setDebouncedSearch] = useState(search.trim());
  const [debouncedLocation, setDebouncedLocation] = useState(location.trim());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLocation(location.trim()), 300);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    startTransition(() => setPage(1));
  }, [companySlug, debouncedLocation, debouncedSearch, employmentType, degreeLevel, maxExperience, hasSalary, ordering, postedWithinDays, remotePolicy, sourceFilters, visaSignal]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedSearch) next.set('search', debouncedSearch);
    if (debouncedLocation) next.set('location', debouncedLocation);
    if (remotePolicy) next.set('remote_policy', remotePolicy);
    if (visaSignal) next.set('visa_sponsorship_signal', visaSignal);
    if (employmentType) next.set('employment_type', employmentType);
    if (sourceFilters.length > 0) next.set('source', sourceFilters.join(','));
    if (degreeLevel) next.set('degree_level', degreeLevel);
    if (maxExperience) next.set('max_experience', maxExperience);
    if (ordering && ordering !== '-job_score') next.set('ordering', ordering);
    if (hasSalary) next.set('has_salary', 'true');
    if (postedWithinDays) next.set('posted_within_days', postedWithinDays);
    if (companySlug) next.set('company_slug', companySlug);
    if (page > 1) next.set('page', String(page));
    setSearchParams(next, { replace: true });
  }, [companySlug, debouncedLocation, debouncedSearch, employmentType, degreeLevel, maxExperience, hasSalary, ordering, page, postedWithinDays, remotePolicy, setSearchParams, sourceFilters, visaSignal]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (resumeSessionId) {
      window.sessionStorage.setItem(RESUME_SESSION_STORAGE_KEY, resumeSessionId);
    } else {
      window.sessionStorage.removeItem(RESUME_SESSION_STORAGE_KEY);
    }
  }, [resumeSessionId]);

  const sourceValue = sourceFilters.length > 0 ? sourceFilters.join(',') : undefined;
  const listParams = useMemo(() => ({
    page,
    page_size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    location: debouncedLocation || undefined,
    company_slug: companySlug || undefined,
    source: sourceValue,
    remote_policy: remotePolicy || undefined,
    visa_sponsorship_signal: visaSignal || undefined,
    employment_type: employmentType || undefined,
    degree_level: degreeLevel || undefined,
    max_experience: maxExperience || undefined,
    has_salary: hasSalary || undefined,
    posted_within_days: postedWithinDays ? parseInt(postedWithinDays, 10) : undefined,
    ordering,
  }), [companySlug, debouncedLocation, debouncedSearch, degreeLevel, employmentType, hasSalary, maxExperience, ordering, page, postedWithinDays, remotePolicy, sourceValue, visaSignal]);

  const queryClient = useQueryClient();
  const [hasAttemptedDiscovery, setHasAttemptedDiscovery] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', listParams],
    queryFn: () => jobsApi.list(listParams),
    placeholderData: keepPreviousData,
  });

  const discoveryMutation = useMutation({
    mutationFn: (searchTerm: string) => jobDiscoveryApi.discover(searchTerm),
    onSuccess: (result) => {
      if (result.total_new_jobs > 0) {
        toast.success(`Found ${result.total_new_jobs} new job${result.total_new_jobs > 1 ? 's' : ''} from ${result.discovered.length} portal${result.discovered.length > 1 ? 's' : ''}!`, 'Jobs Discovered');
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
      }
      setHasAttemptedDiscovery(true);
    },
    onError: () => {
      setHasAttemptedDiscovery(true);
    },
  });

  // Auto-trigger discovery when no results and search term exists
  useEffect(() => {
    if (!isLoading && data && jobs.length === 0 && debouncedSearch && !hasAttemptedDiscovery && !discoveryMutation.isPending) {
      discoveryMutation.mutate(debouncedSearch);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, data, debouncedSearch, hasAttemptedDiscovery]);

  // Reset discovery attempt when search changes
  useEffect(() => {
    setHasAttemptedDiscovery(false);
  }, [debouncedSearch]);

  const jobs = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const activeFiltersCount = [
    remotePolicy,
    visaSignal,
    employmentType,
    degreeLevel,
    maxExperience,
    hasSalary,
    postedWithinDays,
    companySlug,
    ...sourceFilters,
  ].filter(Boolean).length + (debouncedSearch ? 1 : 0) + (debouncedLocation ? 1 : 0);

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setRemotePolicy('');
    setVisaSignal('');
    setEmploymentType('');
    setSourceFilters([]);
    setDegreeLevel('');
    setMaxExperience('');
    setHasSalary(false);
    setPostedWithinDays('');
    setCompanySlug('');
    setOrdering('-job_score');
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `From $${(min / 1000).toFixed(0)}k`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
    return 'Not specified';
  };

  const getSourceBadgeClass = (src: string | null | undefined): string => {
    if (!src) return 'badge-source-default';
    const key = src.toLowerCase().replace(/[^a-z]/g, '');
    const map: Record<string, string> = {
      greenhouse: 'badge-source-greenhouse',
      lever: 'badge-source-lever',
      ashby: 'badge-source-ashby',
      workday: 'badge-source-workday',
      workable: 'badge-source-workable',
      bamboohr: 'badge-source-bamboohr',
    };
    return map[key] || 'badge-source-default';
  };

  const formatRelativeDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleResumeUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_RESUME_BYTES) {
      toast.error('Resume must be under 5MB');
      return;
    }
    setResumeFile(file);
  };

  const clearResume = () => {
    setResumeFile(null);
    setResumeSessionId(null);
  };

  const toggleSource = (src: string) => {
    setSourceFilters((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    );
  };

  const ATS_SOURCES = [
    { value: 'greenhouse', label: 'Greenhouse' },
    { value: 'workday', label: 'Workday' },
    { value: 'lever', label: 'Lever' },
    { value: 'ashby', label: 'Ashby' },
    { value: 'workable', label: 'Workable' },
    { value: 'bamboohr', label: 'BambooHR' },
  ];

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
                <BriefcaseBusiness className="w-4 h-4 text-accent" />
                <span className="text-xs uppercase tracking-[0.2em] text-text-muted">Opportunities</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-text-primary">
                Jobs
              </h1>
            </div>
            <div className="text-sm text-text-muted">
              {totalCount.toLocaleString()} jobs
              {isFetching && <span className="ml-2 text-accent">• updating</span>}
            </div>
          </div>

          {/* Search row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id={searchInputId}
                type="text"
                placeholder="Job title, keywords, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-11 pr-10 text-sm h-11"
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
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id={locationInputId}
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input pl-11 pr-10 text-sm h-11"
              />
              {location && (
                <button
                  onClick={() => setLocation('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-bg-tertiary transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-text-muted" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter toolbar */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Row 1: Workplace + Employment type pills */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-text-muted w-20 flex-shrink-0">Workplace</span>
            <div className="flex items-center gap-1 rounded-lg border border-white/5 p-1">
              {[
                { value: '', label: 'All' },
                { value: 'remote', label: 'Remote' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'onsite', label: 'On-site' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRemotePolicy(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    remotePolicy === opt.value
                      ? 'bg-white/10 text-text-primary'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-text-muted w-20 flex-shrink-0">Employment</span>
            <div className="flex items-center gap-1 rounded-lg border border-white/5 p-1">
              {[
                { value: '', label: 'All' },
                { value: 'Full-time', label: 'Full-time' },
                { value: 'Part-time', label: 'Part-time' },
                { value: 'Contract', label: 'Contract' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setEmploymentType(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    employmentType === opt.value
                      ? 'bg-white/10 text-text-primary'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Visa + Degree pills */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-text-muted w-20 flex-shrink-0">Visa</span>
            <div className="flex items-center gap-1 rounded-lg border border-white/5 p-1">
              {[
                { value: '', label: 'Any Visa' },
                { value: 'likely', label: 'Likely Sponsors' },
                { value: 'possible', label: 'Possible' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVisaSignal(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    visaSignal === opt.value
                      ? 'bg-white/10 text-text-primary'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-text-muted w-20 flex-shrink-0">Degree</span>
            <div className="flex items-center gap-1 rounded-lg border border-white/5 p-1">
              {[
                { value: '', label: 'Any' },
                { value: 'bachelors', label: 'Bachelor\'s' },
                { value: 'masters', label: 'Master\'s' },
                { value: 'doctorate', label: 'Doctorate' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDegreeLevel(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    degreeLevel === opt.value
                      ? 'bg-white/10 text-text-primary'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Date + Max Experience + Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-text-muted w-20 flex-shrink-0">Posted</span>
            <select
              value={postedWithinDays}
              onChange={(e) => setPostedWithinDays(e.target.value)}
              className="select h-8 px-3 py-1.5 text-xs !w-auto"
            >
              <option value="">Any time</option>
              <option value="1">Past 24 hours</option>
              <option value="7">Past week</option>
              <option value="30">Past month</option>
              <option value="90">Past 3 months</option>
            </select>

            <span className="text-[10px] uppercase tracking-wider text-text-muted ml-4">Max Exp</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={maxExperience || '0'}
                onChange={(e) => setMaxExperience(e.target.value === '0' ? '' : e.target.value)}
                className="w-24 h-2 accent-accent cursor-pointer"
              />
              <span className="text-xs font-mono text-text-primary w-12 text-right">
                {maxExperience ? `${maxExperience}y` : 'Any'}
              </span>
            </div>

            <span className="text-[10px] uppercase tracking-wider text-text-muted ml-4">Sort</span>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="select h-8 px-3 py-1.5 text-xs !w-auto"
            >
              <option value="-job_score">Best Match</option>
              <option value="-posted_at">Newest</option>
              <option value="-salary_max">Highest Salary</option>
            </select>

            {/* Has salary toggle */}
            <label className="flex items-center gap-2 cursor-pointer h-8 px-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
              <input
                type="checkbox"
                checked={hasSalary}
                onChange={(e) => setHasSalary(e.target.checked)}
                className="checkbox w-4 h-4"
              />
              <span className="text-xs text-text-secondary">Has Salary</span>
            </label>
          </div>

          {/* Row 4: Application System multi-select */}
          <div className="flex flex-wrap items-start gap-3">
            <span className="text-[10px] uppercase tracking-wider text-text-muted w-20 flex-shrink-0 pt-1">ATS</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {ATS_SOURCES.map((ats) => {
                const active = sourceFilters.includes(ats.value);
                return (
                  <button
                    key={ats.value}
                    onClick={() => toggleSource(ats.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                      active
                        ? 'bg-accent/15 border-accent/30 text-accent'
                        : 'border-white/5 text-text-muted hover:border-white/15 hover:text-text-primary'
                    }`}
                  >
                    {ats.label}
                  </button>
                );
              })}
              {sourceFilters.length > 0 && (
                <button
                  onClick={() => setSourceFilters([])}
                  className="text-xs text-text-muted hover:text-text-primary px-1"
                >
                  clear
                </button>
              )}
            </div>
          </div>

          {/* Clear all */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center pt-1">
              <button
                onClick={clearFilters}
                className="text-xs text-accent hover:underline"
              >
                Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
              </button>
            </div>
          )}

          {/* Resume upload — collapsible */}
          <div className="border-t border-white/5 pt-3">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showFilters ? 'Hide' : 'Show'} resume matching
            </button>
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 max-w-md">
                    {resumeFile ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
                        <FileText className="w-5 h-5 text-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate">{resumeFile.name}</div>
                          <div className="text-xs text-text-muted">{(resumeFile.size / 1024).toFixed(0)} KB</div>
                        </div>
                        <button onClick={clearResume} className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors">
                          <Trash2 className="w-4 h-4 text-danger" />
                        </button>
                      </div>
                    ) : (
                      <label className="block">
                        <input
                          id={resumeInputId}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-border hover:border-accent/50 hover:bg-bg-glass transition-all cursor-pointer">
                          <Upload className="w-6 h-6 text-text-muted mb-2" />
                          <span className="text-sm font-medium text-text-secondary">Upload Resume</span>
                          <span className="text-xs text-text-muted mt-1">PDF or Word, max 5MB</span>
                        </div>
                      </label>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-bg-tertiary flex items-center justify-center">
              {discoveryMutation.isPending ? (
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
              ) : (
                <BriefcaseBusiness className="w-6 h-6 text-text-muted" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {discoveryMutation.isPending
                ? 'Searching all portals...'
                : 'No jobs found'}
            </h3>
            <p className="text-text-secondary mb-6">
              {discoveryMutation.isPending
                ? `Checking Greenhouse, Lever, Ashby, Workday, Workable, and BambooHR for "${debouncedSearch}"...`
                : hasAttemptedDiscovery && debouncedSearch
                  ? `We checked all portals but couldn't find jobs matching "${debouncedSearch}". Try a different search term.`
                  : 'Try adjusting your search or filters'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {debouncedSearch && !discoveryMutation.isPending && (
                <button
                  onClick={() => {
                    setHasAttemptedDiscovery(false);
                    discoveryMutation.mutate(debouncedSearch);
                  }}
                  className="btn btn-primary"
                >
                  <Globe className="w-4 h-4" />
                  Search All Portals
                </button>
              )}
              <button onClick={clearFilters} className="btn btn-secondary">
                Clear Filters
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-white/5"
            >
              {jobs.map((job: JobPosting) => (
                <div key={job.id}>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block py-6 transition-colors duration-200 hover:bg-white/[0.02]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-text-muted" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
                              <span className="font-medium text-text-secondary">{job.company_name}</span>
                              {job.team && (
                                <>
                                  <span>•</span>
                                  <span>{job.team}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="ghost" size="sm">
                            <MapPin className="w-3 h-3" />
                            {job.location || 'Remote'}
                          </Badge>
                          <Badge variant="ghost" size="sm">
                            <Clock3 className="w-3 h-3" />
                            {formatRelativeDate(job.posted_at)}
                          </Badge>
                          {job.salary_min || job.salary_max ? (
                            <Badge variant="accent" size="sm">
                              <DollarSign className="w-3 h-3" />
                              {formatSalary(job.salary_min, job.salary_max)}
                            </Badge>
                          ) : null}
                          {job.remote_policy && (
                            <Badge variant="outline" size="sm">
                              {job.remote_policy}
                            </Badge>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                            {job.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          {job.visa_sponsorship_signal && (
                            <Badge
                              variant={job.visa_sponsorship_signal === 'likely' ? 'success' : 'warning'}
                              size="sm"
                            >
                              {job.visa_sponsorship_signal === 'likely' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              Visa: {job.visa_sponsorship_signal}
                            </Badge>
                          )}
                          <span className={`badge badge-sm ${getSourceBadgeClass(job.source)}`}>
                            {job.source}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 self-center sm:self-start">
                        <div className="w-9 h-9 rounded-full border border-white/8 flex items-center justify-center group-hover:border-accent/30 group-hover:text-accent transition-all">
                          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
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
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50"
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
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary disabled:opacity-50"
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

export default Jobs;

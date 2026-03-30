import { type ChangeEvent, startTransition, useCallback, useDeferredValue, useEffect, useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Trash2,
  Upload,
  X,
  Building2,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

import { jobsApi } from '../api/services';
import { Badge, Button, Spinner, useToast } from '../components/ui';
import type { JobPosting, ResumeMatchSession } from '../types';

const PAGE_SIZE = 12;
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_SESSION_STORAGE_KEY = 'ghosted:resume-match-session';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

function Jobs() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputId = useId();
  const locationInputId = useId();
  const resumeInputId = useId();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Filter states
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

  // Resume states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeSessionId, setResumeSessionId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage.getItem(RESUME_SESSION_STORAGE_KEY);
  });

  const deferredSearch = useDeferredValue(search.trim());
  const deferredLocation = useDeferredValue(location.trim());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    startTransition(() => setPage(1));
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
  }, [companySlug, deferredLocation, deferredSearch, hasSalary, ordering, page, postedWithinDays, remotePolicy, setSearchParams, source, visaSignal]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (resumeSessionId) {
      window.sessionStorage.setItem(RESUME_SESSION_STORAGE_KEY, resumeSessionId);
    } else {
      window.sessionStorage.removeItem(RESUME_SESSION_STORAGE_KEY);
    }
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
  }), [companySlug, deferredLocation, deferredSearch, hasSalary, ordering, page, postedWithinDays, remotePolicy, source, visaSignal]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', listParams],
    queryFn: () => jobsApi.list(listParams),
    placeholderData: keepPreviousData,
  });

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['job-statistics', listParams],
    queryFn: () => jobsApi.statistics(listParams),
  });

  const jobs = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const activeFiltersCount = [
    remotePolicy,
    visaSignal,
    source,
    hasSalary,
    postedWithinDays,
    companySlug,
  ].filter(Boolean).length + (deferredSearch ? 1 : 0) + (deferredLocation ? 1 : 0);

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setRemotePolicy('');
    setVisaSignal('');
    setSource('');
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

  const formatRelativeDate = (dateStr: string) => {
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

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-bg-tertiary border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Sticky Header */}
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
                <BriefcaseBusiness className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-text-secondary">Opportunities</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl font-bold text-text-primary"
              >
                Jobs
              </motion.h1>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="text-sm text-text-muted">
                {totalCount.toLocaleString()} jobs
                {isFetching && <span className="ml-2 text-accent">• updating</span>}
              </div>
            </motion.div>
          </div>

          {/* Search Bars */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                id={searchInputId}
                type="text"
                placeholder="Job title, keywords, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-12 pr-10 text-base h-12"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-bg-tertiary transition-colors"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              )}
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                id={locationInputId}
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input pl-12 pr-10 text-base h-12"
              />
              {location && (
                <button
                  onClick={() => setLocation('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-bg-tertiary transition-colors"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden lg:block w-72 flex-shrink-0"
          >
            <div className="sticky top-40 space-y-6">
              {/* Filters */}
              <div className="card-static p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-text-primary">Filters</span>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-accent hover:underline">
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Remote Policy */}
                  <div>
                    <label className="label mb-3">Work Type</label>
                    <select
                      value={remotePolicy}
                      onChange={(e) => setRemotePolicy(e.target.value)}
                      className="select w-full"
                    >
                      <option value="">All Types</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>

                  {/* Visa Signal */}
                  <div>
                    <label className="label mb-3">Visa Sponsorship</label>
                    <select
                      value={visaSignal}
                      onChange={(e) => setVisaSignal(e.target.value)}
                      className="select w-full"
                    >
                      <option value="">Any</option>
                      <option value="likely">Likely</option>
                      <option value="possible">Possible</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  {/* Salary Filter */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hasSalary}
                      onChange={(e) => setHasSalary(e.target.checked)}
                      className="checkbox"
                    />
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      Has Salary Info
                    </span>
                  </label>

                  {/* Sort */}
                  <div>
                    <label className="label mb-3">Sort By</label>
                    <select
                      value={ordering}
                      onChange={(e) => setOrdering(e.target.value)}
                      className="select w-full"
                    >
                      <option value="-job_score">Best Match</option>
                      <option value="-posted_at">Newest</option>
                      <option value="-salary_max">Highest Salary</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="card-static p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-text-primary text-sm">Resume Matching</span>
                </div>
                
                {resumeFile ? (
                  <div className="space-y-3">
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
                    <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/50 hover:bg-bg-glass transition-all cursor-pointer">
                      <Upload className="w-8 h-8 text-text-muted mb-2" />
                      <span className="text-sm font-medium text-text-secondary">Upload Resume</span>
                      <span className="text-xs text-text-muted mt-1">PDF or Word, max 5MB</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters */}
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
                      <select
                        value={remotePolicy}
                        onChange={(e) => setRemotePolicy(e.target.value)}
                        className="select w-full"
                      >
                        <option value="">All Work Types</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">On-site</option>
                      </select>
                      <select
                        value={visaSignal}
                        onChange={(e) => setVisaSignal(e.target.value)}
                        className="select w-full"
                      >
                        <option value="">Any Visa Sponsorship</option>
                        <option value="likely">Likely</option>
                        <option value="possible">Possible</option>
                      </select>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={hasSalary}
                          onChange={(e) => setHasSalary(e.target.checked)}
                          className="checkbox"
                        />
                        <span className="text-sm text-text-secondary">Has Salary Info</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Jobs Grid */}
            {jobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-static py-16 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-bg-tertiary flex items-center justify-center">
                  <BriefcaseBusiness className="w-8 h-8 text-text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">No jobs found</h3>
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
                  className="space-y-4"
                >
                  {jobs.map((job: JobPosting) => (
                    <motion.div key={job.id} variants={itemVariants} layout>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        <div className="card">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            {/* Left Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                                  <Building2 className="w-6 h-6 text-text-muted" />
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
                                <Badge variant="outline" size="sm">
                                  {job.source}
                                </Badge>
                              </div>
                            </div>

                            {/* Right Arrow */}
                            <div className="flex-shrink-0 self-center sm:self-start">
                              <div className="w-10 h-10 rounded-xl bg-bg-glass flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-all">
                                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </motion.div>
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
      </div>
    </div>
  );
}

export default Jobs;

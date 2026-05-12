import { useState, useMemo, useId } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  TrendingUp,
  Globe,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from 'lucide-react';

import { h1bApi } from '../api/services';
import { Badge } from '../components/ui';
import type { H1BApplication, LotteryYear, CountryCapStatus } from '../types';

const PAGE_SIZE = 12;
const FISCAL_YEARS = [2024, 2023, 2022, 2021, 2020];
const CASE_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'certified', label: 'Certified' },
  { value: 'certified_withdrawn', label: 'Certified-Withdrawn' },
  { value: 'denied', label: 'Denied' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

function H1BData() {
  const [searchParams] = useSearchParams();
  const searchInputId = useId();

  // Tab state
  const [activeTab, setActiveTab] = useState<'applications' | 'lottery' | 'community'>('applications');

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [caseStatus, setCaseStatus] = useState(searchParams.get('case_status') || '');
  const [fiscalYear, setFiscalYear] = useState(searchParams.get('fiscal_year') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || '1'));

  const listParams = useMemo(() => ({
    page,
    page_size: PAGE_SIZE,
    search: search.trim() || undefined,
    case_status: caseStatus || undefined,
    fiscal_year: fiscalYear ? parseInt(fiscalYear, 10) : undefined,
    ordering: '-fiscal_year',
  }), [search, caseStatus, fiscalYear, page]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['h1b-applications', listParams],
    queryFn: () => h1bApi.applications(listParams),
    placeholderData: keepPreviousData,
    enabled: activeTab === 'applications',
  });

  const { data: lotteryData } = useQuery({
    queryKey: ['lottery-years'],
    queryFn: () => h1bApi.lotteryYears(),
    enabled: activeTab === 'lottery',
  });

  const { data: countryCapData } = useQuery({
    queryKey: ['country-cap-status'],
    queryFn: () => h1bApi.countryCapStatuses({}),
    enabled: activeTab === 'lottery',
  });

  const applications = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const lotteryYears = lotteryData || [];
  const countryCaps = countryCapData?.results || [];

  const clearFilters = () => {
    setSearch('');
    setCaseStatus('');
    setFiscalYear('');
    setPage(1);
  };

  const activeFiltersCount = [
    caseStatus,
    fiscalYear,
  ].filter(Boolean).length + (search.trim() ? 1 : 0);

  const formatWage = (wage: string | number | undefined) => {
    if (!wage) return 'N/A';
    const num = typeof wage === 'string' ? parseFloat(wage) : wage;
    if (isNaN(num)) return 'N/A';
    return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const getStatusBadge = (status: string) => {
    const normalized = (status || '').toLowerCase();
    if (normalized.includes('certified') && !normalized.includes('withdrawn')) {
      return { variant: 'success' as const, label: status };
    }
    if (normalized.includes('withdrawn') || normalized.includes('certified')) {
      return { variant: 'warning' as const, label: status };
    }
    if (normalized.includes('denied')) {
      return { variant: 'danger' as const, label: status };
    }
    return { variant: 'ghost' as const, label: status };
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="container-wide px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-accent" />
                <span className="text-xs uppercase tracking-[0.2em] text-text-muted">Data</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-text-primary">
                H-1B Data
              </h1>
              <p className="text-sm text-text-muted mt-2 max-w-xl">
                Search H-1B LCA filings, explore lottery statistics, and see community insights from visa holders.
              </p>
            </div>
            <div className="text-sm text-text-muted">
              {totalCount.toLocaleString()} records
              {isFetching && <span className="ml-2 text-accent">• updating</span>}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-white/5 p-1 w-fit">
            {[
              { key: 'applications' as const, label: 'Applications', icon: FileText },
              { key: 'lottery' as const, label: 'Lottery Stats', icon: BarChart3 },
              { key: 'community' as const, label: 'Community', icon: Users },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white/10 text-text-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <motion.div
              key="applications"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id={searchInputId}
                    type="text"
                    placeholder="Search employer, job title, or SOC code..."
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
                <select
                  value={caseStatus}
                  onChange={(e) => setCaseStatus(e.target.value)}
                  className="select h-11 px-3 text-sm !w-auto"
                >
                  {CASE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <select
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  className="select h-11 px-3 text-sm !w-auto"
                >
                  <option value="">All Years</option>
                  {FISCAL_YEARS.map((y) => (
                    <option key={y} value={y}>FY {y}</option>
                  ))}
                </select>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-accent hover:underline self-center"
                  >
                    Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                  </button>
                )}
              </div>

              {/* Applications Table */}
              {isLoading && !data ? (
                <div className="py-20 text-center">
                  <div className="w-10 h-10 mx-auto border-2 border-bg-tertiary border-t-accent rounded-full animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-20 text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-bg-tertiary flex items-center justify-center">
                    <FileText className="w-6 h-6 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">No records found</h3>
                  <p className="text-text-secondary mb-6">Try adjusting your search or filters</p>
                  <button onClick={clearFilters} className="btn btn-secondary">
                    Clear Filters
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border border-white/5">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-bg-secondary">
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Employer</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Job Title</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Location</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Wage</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Year</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {applications.map((app: H1BApplication) => {
                          const status = getStatusBadge(app.case_status);
                          return (
                            <tr
                              key={app.id}
                              className="hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                                  <span className="font-medium text-text-primary truncate max-w-[180px]">
                                    {app.employer_name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-text-secondary truncate max-w-[200px]">{app.job_title}</div>
                                {app.soc_title && (
                                  <div className="text-xs text-text-muted mt-0.5">{app.soc_title}</div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5 text-text-muted">
                                  <MapPin className="w-3 h-3" />
                                  <span>{app.employer_city}, {app.employer_state}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5 text-text-secondary">
                                  <DollarSign className="w-3 h-3" />
                                  <span>{formatWage(app.wage_rate_of_pay_from)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={status.variant} size="sm">{status.label}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5 text-text-muted">
                                  <Calendar className="w-3 h-3" />
                                  <span>FY{app.fiscal_year}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-center gap-4 mt-8"
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
            </motion.div>
          )}

          {/* Lottery Stats Tab */}
          {activeTab === 'lottery' && (
            <motion.div
              key="lottery"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Lottery Years Cards */}
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Lottery Year Statistics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lotteryYears.map((year: LotteryYear) => (
                    <div
                      key={year.id}
                      className="rounded-xl border border-white/5 bg-bg-secondary p-5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-black text-text-primary">FY{year.fiscal_year}</span>
                        <Badge variant="accent" size="sm">
                          {(parseFloat(String(year.overall_selection_rate)) || 0).toFixed(1)}% rate
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Total Registrations</span>
                          <span className="font-mono text-text-primary">{year.total_registrations.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Selected</span>
                          <span className="font-mono text-emerald-400">{year.selected_registrations.toLocaleString()}</span>
                        </div>
                        {year.regular_cap_registrations && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-muted">Regular Cap</span>
                            <span className="font-mono text-text-secondary">
                              {year.regular_cap_selected?.toLocaleString()} / {year.regular_cap_registrations.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {year.masters_cap_registrations && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-muted">Masters Cap</span>
                            <span className="font-mono text-text-secondary">
                              {year.masters_cap_selected?.toLocaleString()} / {year.masters_cap_registrations.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {lotteryYears.length === 0 && (
                    <div className="col-span-full py-12 text-center text-text-muted">
                      <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      No lottery data available yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Country Cap Status */}
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-accent" />
                  Country Cap Status
                </h2>
                <div className="overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-bg-secondary">
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Country</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Fiscal Year</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Applications</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Approved</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Approval Rate</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Priority Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {countryCaps.map((cap: CountryCapStatus) => (
                        <tr key={cap.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 text-text-muted" />
                              <span className="font-medium text-text-primary capitalize">{cap.country}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-text-muted">FY{cap.fiscal_year}</td>
                          <td className="px-4 py-3 font-mono text-text-primary">{cap.total_applications.toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono text-emerald-400">{cap.approved.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge variant={parseFloat(String(cap.approval_rate)) >= 80 ? 'success' : 'warning'} size="sm">
                              {parseFloat(String(cap.approval_rate)).toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {cap.priority_date_current ? (
                              <Badge variant="success" size="sm">
                                <CheckCircle2 className="w-3 h-3" />
                                Current
                              </Badge>
                            ) : (
                              <Badge variant="warning" size="sm">
                                <Clock3 className="w-3 h-3" />
                                Backlogged
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                      {countryCaps.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                            <Globe className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            No country cap data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Community Tab */}
          {activeTab === 'community' && (
            <motion.div
              key="community"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              <div className="max-w-2xl mx-auto text-center py-16">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-3">Community Insights</h2>
                <p className="text-text-secondary mb-6">
                  Community-driven H-1B insights are coming soon. This section will feature:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {[
                    { icon: Award, title: 'Company Sponsorship Reviews', desc: 'Read and share experiences about H-1B sponsorship at specific companies.' },
                    { icon: TrendingUp, title: 'Approval Rate Trends', desc: 'Community-reported approval patterns and timeline data.' },
                    { icon: AlertCircle, title: 'RFE & Denial Patterns', desc: 'Learn about common RFE reasons and denial patterns by company and role.' },
                    { icon: Clock3, title: 'Processing Time Tracker', desc: 'Real-world processing timelines from filing to decision.' },
                  ].map((item) => (
                    <div key={item.title} className="p-4 rounded-xl border border-white/5 bg-bg-secondary">
                      <item.icon className="w-5 h-5 text-accent mb-2" />
                      <h3 className="font-medium text-text-primary text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default H1BData;

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Filter,
  MapPin,
  Search,
  TrendingUp,
  Briefcase,
  Database,
} from 'lucide-react';

import { offersApi } from '../api/services';
import { Badge, CompanyLogo, EmptyState } from '../components/ui';
import { StatBoxSkeleton, TableRowSkeleton } from '../components/ui/Skeleton';
import type { Offer } from '../types';

const PAGE_SIZE = 15;

function Offers() {
  const [search, setSearch] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [visaType, setVisaType] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);

  const deferredSearch = useDeferredValue(search.trim());
  const deferredLocation = useDeferredValue(location.trim());

  useEffect(() => {
    setPage(1);
  }, [deferredLocation, deferredSearch, minSalary, source, visaType]);

  const listParams = useMemo(() => ({
    page,
    page_size: PAGE_SIZE,
    search: deferredSearch || undefined,
    location: deferredLocation || undefined,
    min_salary: minSalary ? parseInt(minSalary, 10) : undefined,
    visa_type: visaType || undefined,
    source: source || undefined,
  }), [deferredLocation, deferredSearch, minSalary, page, source, visaType]);

  const statsParams = useMemo(() => ({
    search: deferredSearch || undefined,
    location: deferredLocation || undefined,
    min_salary: minSalary ? parseInt(minSalary, 10) : undefined,
    visa_type: visaType || undefined,
    source: source || undefined,
  }), [deferredLocation, deferredSearch, minSalary, source, visaType]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['offers', listParams],
    queryFn: () => offersApi.list(listParams),
    placeholderData: keepPreviousData,
  });

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['offer-statistics', statsParams],
    queryFn: () => offersApi.statistics(statsParams),
  });

  const offers = data?.results || [];
  const totalCount = data?.count || 0;
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const visaTypes = [
    { value: '', label: 'All Visa Types' },
    { value: 'h1b', label: 'H-1B' },
    { value: 'h1b_transfer', label: 'H-1B Transfer' },
    { value: 'green_card', label: 'Green Card' },
    { value: 'opt', label: 'OPT' },
    { value: 'stem_opt', label: 'STEM OPT' },
    { value: 'tn', label: 'TN' },
    { value: 'e3', label: 'E-3' },
    { value: 'no_sponsorship', label: 'No Sponsorship Needed' },
  ];

  const formatSalary = (value?: number | null) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getScoreBadge = (salary: number) => {
    if (salary >= 200000) return { variant: 'accent' as const, label: 'Top Tier' };
    if (salary >= 150000) return { variant: 'success' as const, label: 'High' };
    if (salary >= 100000) return { variant: 'warning' as const, label: 'Above Avg' };
    return { variant: 'ghost' as const, label: 'Standard' };
  };

  const formatExperienceLevel = (offer: Offer) => {
    if (offer.experience_level_display) {
      return offer.experience_level_display;
    }
    if (!offer.experience_level) {
      return 'N/A';
    }
    return offer.experience_level.charAt(0).toUpperCase() + offer.experience_level.slice(1);
  };

  const formatSource = (offer: Offer) => {
    return offer.data_source === 'community_submission' ? 'Community' : 'Gov Data';
  };

  const communityCount = statistics?.by_source.find((entry) => entry.data_source === 'community_submission')?.count || 0;

  return (
    <div className="bg-bg-primary min-h-screen">
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-8 sm:py-12">
          <div className="header-layout mb-6">
            <div>
              <div className="section-marker mb-2">
                <span>Database</span>
              </div>
              <h1 className="headline-lg">Offer Database</h1>
            </div>
            <div className="font-mono text-sm text-secondary text-left sm:text-right">
              {totalCount.toLocaleString()} matching offers
              {isFetching && !isLoading ? ' • updating' : ''}
            </div>
          </div>

          <div className="card-static p-4 mb-6 bg-white">
            <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-2">Search Scope</div>
            <p className="text-sm text-primary">
              Filters now search across the full salary dataset instead of only the current page, and every row shows whether it came from government-derived data or a community submission.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 min-[1700px]:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted" />
              <input
                type="text"
                placeholder="Search job title or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 sm:pl-12 text-sm sm:text-base"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted" />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input pl-10 sm:pl-12 text-sm sm:text-base"
              />
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted" />
              <input
                type="number"
                placeholder="Min salary..."
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="input pl-10 sm:pl-12 text-sm sm:text-base"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted" />
              <select
                value={visaType}
                onChange={(e) => setVisaType(e.target.value)}
                className="select pl-10 sm:pl-12 text-sm sm:text-base"
              >
                {visaTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Database className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted" />
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="select pl-10 sm:pl-12 text-sm sm:text-base"
              >
                <option value="">All Sources</option>
                <option value="government">Government-derived only</option>
                <option value="community">Community only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 min-[1700px]:grid-cols-4">
          {statsLoading ? (
            <>
              <StatBoxSkeleton />
              <StatBoxSkeleton />
              <StatBoxSkeleton />
              <StatBoxSkeleton />
            </>
          ) : (
            <>
              <div className="stat-box-responsive">
                <div className="stat-label">
                  <DollarSign className="w-4 h-4 text-accent" />
                  Avg Salary
                </div>
                <div className="stat-value-responsive">{formatSalary(statistics?.overall.avg_base)}</div>
              </div>

              <div className="stat-box-responsive">
                <div className="stat-label">
                  <Briefcase className="w-4 h-4 text-accent" />
                  Matching Offers
                </div>
                <div className="stat-value-responsive">{statistics?.overall.total_offers?.toLocaleString() || '0'}</div>
              </div>

              <div className="stat-box-responsive">
                <div className="stat-label">
                  <Building2 className="w-4 h-4 text-accent" />
                  Companies
                </div>
                <div className="stat-value-responsive">{statistics?.overall.company_count?.toLocaleString() || '0'}</div>
              </div>

              <div className="stat-box-responsive">
                <div className="stat-label">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  Community
                </div>
                <div className="stat-value-responsive">{communityCount.toLocaleString()}</div>
              </div>
            </>
          )}
        </div>

        {isLoading ? (
          <>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:gap-4 min-[1700px]:hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="mobile-table-card">
                  <div className="mobile-table-card-header">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="skeleton h-5 w-2/3" />
                      <div className="skeleton h-4 w-1/2" />
                    </div>
                    <div className="skeleton h-6 w-20" />
                  </div>
                  <div className="mobile-table-card-row">
                    <span className="mobile-table-card-label">Location</span>
                    <div className="skeleton h-4 w-24" />
                  </div>
                  <div className="mobile-table-card-row">
                    <span className="mobile-table-card-label">Experience</span>
                    <div className="skeleton h-4 w-28" />
                  </div>
                  <div className="mobile-table-card-row">
                    <span className="mobile-table-card-label">Salary</span>
                    <div className="skeleton h-5 w-20" />
                  </div>
                </div>
              ))}
            </div>

            <div className="card-static hidden min-[1700px]:block">
              <div className="table-responsive">
                <div className="table-container">
                  <table className="table table-fixed min-w-full">
                    <colgroup>
                      <col className="w-[20%]" />
                      <col className="w-[38%]" />
                      <col className="w-[15%]" />
                      <col className="w-[12%]" />
                      <col className="w-[15%]" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="px-4 xl:px-5">Job Title</th>
                        <th className="px-4 xl:px-5">Company</th>
                        <th className="px-4 xl:px-5">Location</th>
                        <th className="px-4 xl:px-5">Source</th>
                        <th className="px-4 xl:px-5 text-right">Salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, i) => (
                        <TableRowSkeleton key={i} columns={5} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : offers.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No offers found"
            description="Try a broader search or remove one of the filters."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:gap-4 min-[1700px]:hidden">
              {offers.map((offer: Offer) => {
                const badge = getScoreBadge(offer.base_salary || 0);
                return (
                  <div key={offer.id} className="mobile-table-card">
                    <div className="mobile-table-card-header">
                      <div className="flex items-center gap-3 min-w-0">
                        <CompanyLogo
                          companyName={offer.company_name || 'Unknown'}
                          logoUrl={offer.company_logo_url}
                          companyDomain={offer.company_domain}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-primary text-sm truncate">{offer.position_title}</span>
                          </div>
                          <div className="font-mono text-xs text-secondary truncate">{offer.company_name}</div>
                        </div>
                      </div>
                      <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                    </div>
                    <div className="mobile-table-card-row">
                      <span className="mobile-table-card-label">Location</span>
                      <span className="mobile-table-card-value text-sm">{offer.location || 'N/A'}</span>
                    </div>
                    <div className="mobile-table-card-row">
                      <span className="mobile-table-card-label">Experience</span>
                      <span className="mobile-table-card-value text-sm">{formatExperienceLevel(offer)}</span>
                    </div>
                    <div className="mobile-table-card-row">
                      <span className="mobile-table-card-label">Visa</span>
                      <Badge variant="outline" size="sm">{offer.visa_type_display || offer.visa_type || 'N/A'}</Badge>
                    </div>
                    <div className="mobile-table-card-row">
                      <span className="mobile-table-card-label">Source</span>
                      <Badge variant="ghost" size="sm">{formatSource(offer)}</Badge>
                    </div>
                    <div className="mobile-table-card-row border-b-0">
                      <span className="mobile-table-card-label">Salary</span>
                      <span className="font-mono font-bold text-accent text-base">
                        {formatSalary(offer.base_salary || 0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card-static hidden min-[1700px]:block">
              <div className="table-responsive">
                <div className="table-container">
                  <table className="table table-fixed min-w-full">
                    <colgroup>
                      <col className="w-[19%]" />
                      <col className="w-[26%]" />
                      <col className="w-[12%]" />
                      <col className="w-[15%]" />
                      <col className="w-[8%]" />
                      <col className="w-[8%]" />
                      <col className="w-[12%]" />
                    </colgroup>
                  <thead>
                    <tr>
                      <th className="px-4 xl:px-5">Job Title</th>
                      <th className="px-4 xl:px-5">Company</th>
                      <th className="px-4 xl:px-5">Location</th>
                      <th className="px-4 xl:px-5">Experience</th>
                      <th className="px-4 xl:px-5">Source</th>
                      <th className="px-4 xl:px-5">Visa</th>
                      <th className="px-4 xl:px-5 text-right">Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer: Offer) => (
                      <tr key={offer.id}>
                        <td className="align-top px-4 xl:px-5">
                          <div className="font-semibold text-primary break-words">
                            {offer.position_title}
                          </div>
                        </td>
                        <td className="align-top px-4 xl:px-5">
                          <div className="flex items-center gap-2 xl:gap-3 min-w-0">
                            <CompanyLogo
                              companyName={offer.company_name || 'Unknown'}
                              logoUrl={offer.company_logo_url}
                              companyDomain={offer.company_domain}
                              size="sm"
                            />
                            <span className="min-w-0 flex-1 truncate text-primary">
                              {offer.company_name}
                            </span>
                          </div>
                        </td>
                        <td className="align-top px-4 xl:px-5">
                          <span className="text-secondary break-words">{offer.location || 'N/A'}</span>
                        </td>
                        <td className="align-top px-4 xl:px-5">
                          <span className="text-secondary break-words">{formatExperienceLevel(offer)}</span>
                        </td>
                        <td className="align-top px-4 xl:px-5">
                          <Badge variant="ghost" size="sm">{formatSource(offer)}</Badge>
                        </td>
                        <td className="align-top px-4 xl:px-5">
                          <Badge variant="outline" size="sm">{offer.visa_type_display || offer.visa_type || 'N/A'}</Badge>
                        </td>
                        <td className="align-top px-4 xl:px-5 text-right whitespace-nowrap">
                          <div className="font-mono font-bold text-accent text-sm xl:text-base">
                            {formatSalary(offer.base_salary || 0)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>
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
          </>
        )}
      </div>
    </div>
  );
}

export default Offers;

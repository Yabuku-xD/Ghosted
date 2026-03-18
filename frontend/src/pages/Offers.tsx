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
import { Badge, CompanyLogo, EmptyState, Select } from '../components/ui';
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
  const totalCountLabel = isLoading && !data
    ? 'Loading offers...'
    : `${totalCount.toLocaleString()} matching offers`;

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
  const hasCommunityData = communityCount > 0;

  useEffect(() => {
    if (!hasCommunityData && source === 'community') {
      setSource('');
    }
  }, [hasCommunityData, source]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-8 sm:py-12">
          <div className="mb-6 header-layout">
            <div>
              <div className="mb-2 section-marker">
                <span>Database</span>
              </div>
              <h1 className="headline-lg">Offer Database</h1>
            </div>
            <div className="font-mono text-sm text-left text-secondary sm:text-right">
              {totalCountLabel}
              {isFetching && !isLoading ? ' • updating' : ''}
            </div>
          </div>

          <div className="p-4 mb-6 bg-white card-static">
            <div className="mb-2 font-mono text-xs tracking-wider uppercase text-secondary">Search Scope</div>
            <p className="text-sm text-primary">
              {hasCommunityData
                ? 'Filters now search across the full salary dataset instead of only the current page, and every row shows whether it came from government-derived data or a community submission.'
                : 'Filters now search across the full salary dataset instead of only the current page, with the current public view grounded in government-derived records.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 min-[1700px]:grid-cols-5">
            <div className="relative">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 sm:left-4 top-1/2 sm:w-5 sm:h-5 text-muted" />
              <input
                type="text"
                placeholder="Job title/Company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-sm input sm:pl-12 sm:text-base"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute w-4 h-4 -translate-y-1/2 left-3 sm:left-4 top-1/2 sm:w-5 sm:h-5 text-muted" />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 text-sm input sm:pl-12 sm:text-base"
              />
            </div>

            <div className="relative">
              <DollarSign className="absolute w-4 h-4 -translate-y-1/2 left-3 sm:left-4 top-1/2 sm:w-5 sm:h-5 text-muted" />
              <input
                type="number"
                placeholder="Min salary..."
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="pl-10 text-sm input sm:pl-12 sm:text-base"
              />
            </div>

            <Select
              value={visaType}
              onChange={setVisaType}
              icon={<Filter className="w-4 h-4 sm:w-5 sm:h-5 text-muted" />}
              ariaLabel="Visa type filter"
              buttonClassName="text-sm sm:text-base"
              options={visaTypes}
            />

            <Select
              value={source}
              onChange={setSource}
              icon={<Database className="w-4 h-4 sm:w-5 sm:h-5 text-muted" />}
              ariaLabel="Offer source filter"
              buttonClassName="text-sm sm:text-base"
              options={[
                { value: '', label: 'All Sources' },
                { value: 'government', label: 'Government-derived only' },
                ...(hasCommunityData ? [{ value: 'community', label: 'Community only' }] : []),
              ]}
            />
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        <div className={`grid grid-cols-2 gap-3 mb-6 sm:gap-4 sm:mb-8 ${hasCommunityData ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
          {statsLoading ? (
            <>
              <StatBoxSkeleton />
              <StatBoxSkeleton />
              <StatBoxSkeleton />
              {hasCommunityData ? <StatBoxSkeleton /> : null}
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

              {hasCommunityData ? (
                <div className="stat-box-responsive">
                  <div className="stat-label">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    Community
                  </div>
                  <div className="stat-value-responsive">{communityCount.toLocaleString()}</div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {isLoading ? (
          <>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:gap-4 min-[1700px]:hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="mobile-table-card">
                  <div className="mobile-table-card-header">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="w-2/3 h-5 skeleton" />
                      <div className="w-1/2 h-4 skeleton" />
                    </div>
                    <div className="w-20 h-6 skeleton" />
                  </div>
                  <div className="mobile-table-card-row">
                    <span className="mobile-table-card-label">Location</span>
                    <div className="w-24 h-4 skeleton" />
                  </div>
                  <div className="mobile-table-card-row">
                    <span className="mobile-table-card-label">Experience</span>
                    <div className="h-4 skeleton w-28" />
                  </div>
                  <div className="mobile-table-card-row">
                    <span className="mobile-table-card-label">Salary</span>
                    <div className="w-20 h-5 skeleton" />
                  </div>
                </div>
              ))}
            </div>

            <div className="card-static hidden min-[1700px]:block">
              <div className="table-responsive">
                <div className="table-container">
                  <table className="table min-w-full table-fixed">
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
                        <th className="px-4 text-right xl:px-5">Salary</th>
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
                      <div className="flex items-center min-w-0 gap-3">
                        <CompanyLogo
                          companyName={offer.company_name || 'Unknown'}
                          logoUrl={offer.company_logo_url}
                          companyDomain={offer.company_domain}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold truncate text-primary">{offer.position_title}</span>
                          </div>
                          <div className="font-mono text-xs truncate text-secondary">{offer.company_name}</div>
                        </div>
                      </div>
                      <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                    </div>
                    <div className="mobile-table-card-row">
                      <span className="mobile-table-card-label">Location</span>
                      <span className="text-sm mobile-table-card-value">{offer.location || 'N/A'}</span>
                    </div>
                    <div className="mobile-table-card-row">
                      <span className="mobile-table-card-label">Experience</span>
                      <span className="text-sm mobile-table-card-value">{formatExperienceLevel(offer)}</span>
                    </div>
                    <div className="mobile-table-card-row">
                      <span className="mobile-table-card-label">Visa</span>
                      <Badge variant="outline" size="sm">{offer.visa_type_display || offer.visa_type || 'N/A'}</Badge>
                    </div>
                    <div className="mobile-table-card-row">
                      <span className="mobile-table-card-label">Source</span>
                      <Badge variant="ghost" size="sm">{formatSource(offer)}</Badge>
                    </div>
                    <div className="border-b-0 mobile-table-card-row">
                      <span className="mobile-table-card-label">Salary</span>
                      <span className="font-mono text-base font-bold text-accent">
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
                  <table className="table min-w-full table-fixed">
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
                      <th className="px-4 text-right xl:px-5">Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer: Offer) => (
                      <tr key={offer.id}>
                        <td className="px-4 align-top xl:px-5">
                          <div className="font-semibold break-words text-primary">
                            {offer.position_title}
                          </div>
                        </td>
                        <td className="px-4 align-top xl:px-5">
                          <div className="flex items-center min-w-0 gap-2 xl:gap-3">
                            <CompanyLogo
                              companyName={offer.company_name || 'Unknown'}
                              logoUrl={offer.company_logo_url}
                              companyDomain={offer.company_domain}
                              size="sm"
                            />
                            <span className="flex-1 min-w-0 truncate text-primary">
                              {offer.company_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 align-top xl:px-5">
                          <span className="break-words text-secondary">{offer.location || 'N/A'}</span>
                        </td>
                        <td className="px-4 align-top xl:px-5">
                          <span className="break-words text-secondary">{formatExperienceLevel(offer)}</span>
                        </td>
                        <td className="px-4 align-top xl:px-5">
                          <Badge variant="ghost" size="sm">{formatSource(offer)}</Badge>
                        </td>
                        <td className="px-4 align-top xl:px-5">
                          <Badge variant="outline" size="sm">{offer.visa_type_display || offer.visa_type || 'N/A'}</Badge>
                        </td>
                        <td className="px-4 text-right align-top xl:px-5 whitespace-nowrap">
                          <div className="font-mono text-sm font-bold text-accent xl:text-base">
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
              <div className="flex flex-col items-center justify-center gap-3 pt-8 mt-8 border-t-2 border-border sm:flex-row sm:gap-4">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={!hasPrevious}
                  className="flex w-full items-center justify-center gap-2 btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
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
                  className="flex w-full items-center justify-center gap-2 btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
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

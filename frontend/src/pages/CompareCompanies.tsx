import { useDeferredValue, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, ArrowRight, Building2, Search, Scale, Sparkles } from 'lucide-react';

import { companiesApi } from '../api/services';
import { Badge, CompanyLogo, EmptyState, Spinner } from '../components/ui';
import type { Company } from '../types';

function CompanyPicker({
  label,
  value,
  onChange,
  selectedCompany,
  onSelect,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  selectedCompany?: Company | null;
  onSelect: (company: Company) => void;
}) {
  const deferredSearch = useDeferredValue(value.trim());
  const { data } = useQuery({
    queryKey: ['company-picker', label, deferredSearch],
    queryFn: () => companiesApi.search(deferredSearch),
    enabled: deferredSearch.length >= 2,
  });

  const suggestions = data?.results || [];

  return (
    <div className="card-static p-4 sm:p-6 bg-white">
      <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-3">{label}</div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by company name..."
          className="input pl-10"
        />
      </div>

      {selectedCompany ? (
        <div className="border-2 border-border bg-secondary p-3 flex items-center gap-3">
          <CompanyLogo
            companyName={selectedCompany.name}
            logoUrl={selectedCompany.logo_url}
            companyDomain={selectedCompany.company_domain}
            website={selectedCompany.website}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-primary truncate">{selectedCompany.name}</div>
            <div className="text-xs text-secondary truncate">
              {selectedCompany.headquarters || 'Location pending'}
            </div>
          </div>
        </div>
      ) : null}

      {deferredSearch.length >= 2 && suggestions.length > 0 ? (
        <div className="mt-4 border-2 border-border divide-y-2 divide-border-light bg-white max-h-64 overflow-y-auto">
          {suggestions.slice(0, 6).map((company) => (
            <button
              key={company.id}
              type="button"
              onClick={() => onSelect(company)}
              className="w-full text-left px-3 py-3 hover:bg-secondary transition-colors flex items-center gap-3"
            >
              <CompanyLogo
                companyName={company.name}
                logoUrl={company.logo_url}
                companyDomain={company.company_domain}
                website={company.website}
                size="sm"
              />
              <div className="min-w-0">
                <div className="font-semibold text-primary truncate">{company.name}</div>
                <div className="text-xs text-secondary truncate">
                  {(company.total_h1b_filings || 0).toLocaleString()} filings
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CompareCompanies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');

  const leftSlug = searchParams.get('left') || '';
  const rightSlug = searchParams.get('right') || '';

  const { data: comparison, isLoading } = useQuery({
    queryKey: ['company-comparison', leftSlug, rightSlug],
    queryFn: () => companiesApi.compare(leftSlug, rightSlug),
    enabled: Boolean(leftSlug && rightSlug),
  });

  const pickerParams = useMemo(() => ({ left: leftSlug, right: rightSlug }), [leftSlug, rightSlug]);

  const setCompany = (side: 'left' | 'right', company: Company) => {
    const next = new URLSearchParams(pickerParams);
    next.set(side, company.slug);
    setSearchParams(next);
  };

  const heroText = leftSlug && rightSlug
    ? 'Compare sponsorship strength, salary coverage, and live jobs side by side.'
    : 'Choose any two companies to compare visa-fairness, salary data, and hiring signals.';

  return (
    <div className="bg-bg-primary min-h-screen">
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-8 sm:py-12">
          <div className="section-marker mb-3">
            <span>Decision Support</span>
          </div>
          <h1 className="headline-lg mb-4">Compare Companies</h1>
          <p className="text-secondary max-w-2xl">{heroText}</p>
        </div>
      </div>

      <div className="container py-8 sm:py-12 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-4 items-start">
          <CompanyPicker
            label="Company A"
            value={leftSearch}
            onChange={setLeftSearch}
            selectedCompany={comparison?.left || null}
            onSelect={(company) => setCompany('left', company)}
          />

          <div className="hidden xl:flex items-center justify-center pt-16">
            <div className="w-16 h-16 bg-accent text-white border-3 border-border flex items-center justify-center shadow-solid">
              <ArrowLeftRight className="w-7 h-7" />
            </div>
          </div>

          <CompanyPicker
            label="Company B"
            value={rightSearch}
            onChange={setRightSearch}
            selectedCompany={comparison?.right || null}
            onSelect={(company) => setCompany('right', company)}
          />
        </div>

        {!leftSlug || !rightSlug ? (
          <EmptyState
            icon={Scale}
            title="Pick two companies to compare"
            description="Search by company name in the boxes above to generate a side-by-side comparison."
          />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : comparison ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[comparison.left, comparison.right].map((company) => (
                <div key={company.slug} className="card-static p-5 sm:p-6 bg-white">
                  <div className="flex items-start gap-4">
                    <CompanyLogo
                      companyName={company.name}
                      logoUrl={company.logo_url}
                      companyDomain={company.company_domain}
                      website={company.website}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="headline-sm text-primary truncate">{company.name}</h2>
                        <Badge variant="outline" size="sm">
                          {(company.active_job_count || 0).toLocaleString()} live jobs
                        </Badge>
                      </div>
                      <p className="text-sm text-secondary">
                        {(company.total_h1b_filings || 0).toLocaleString()} filings • {(company.offer_count || 0).toLocaleString()} salary records
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(company.actionable_insights || []).map((insight) => (
                          <Badge key={insight} variant="ghost" size="sm">{insight}</Badge>
                        ))}
                      </div>
                      <Link to={`/companies/${company.slug}`} className="btn btn-secondary mt-4 inline-flex text-sm">
                        View Company
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-static p-4 sm:p-6 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="headline-sm">Comparison Summary</h2>
              </div>

              <div className="divide-y-2 divide-border-light">
                {comparison.comparison.map((metric) => {
                  const winnerLabel = metric.winner === 'tie'
                    ? 'Tie'
                    : metric.winner === comparison.left.slug
                      ? comparison.left.name
                      : comparison.right.name;

                  return (
                    <div key={metric.field} className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 py-4 items-center text-sm">
                      <div className="font-semibold text-primary">{metric.label}</div>
                      <div className="font-mono text-primary">{metric.left_value.toLocaleString()}</div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-primary">{metric.right_value.toLocaleString()}</span>
                        <Badge variant={metric.winner === 'tie' ? 'ghost' : 'accent'} size="sm">
                          {winnerLabel}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={Building2}
            title="Comparison unavailable"
            description="One of the selected companies could not be loaded."
          />
        )}
      </div>
    </div>
  );
}

export default CompareCompanies;

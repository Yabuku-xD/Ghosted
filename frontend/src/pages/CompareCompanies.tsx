import { startTransition, useDeferredValue, useEffect, useId, useRef, useState } from 'react';
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
  isOpen,
  onOpen,
  onClose,
  selectedCompany,
  onSelect,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  selectedCompany?: Company | null;
  onSelect: (company: Company) => void;
}) {
  const inputId = useId();
  const listboxId = `${inputId}-suggestions`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const deferredSearch = useDeferredValue(value.trim());
  const { data } = useQuery({
    queryKey: ['company-picker', label, deferredSearch],
    queryFn: () => companiesApi.search(deferredSearch),
    enabled: deferredSearch.length >= 2,
  });

  const suggestions = data?.results || [];
  const normalizedValue = value.trim().toLowerCase();
  const normalizedSelectedName = selectedCompany?.name.trim().toLowerCase() || '';
  const hasExactSelection = Boolean(selectedCompany && normalizedValue === normalizedSelectedName);
  const showSuggestions = isOpen && deferredSearch.length >= 2 && suggestions.length > 0 && !hasExactSelection;

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={rootRef} className="card p-4 sm:p-5">
      <label htmlFor={inputId} className="text-xs uppercase tracking-[0.2em] text-text-muted mb-3 block">
        {label}
      </label>

      <div className="relative mb-3">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onOpen}
          aria-expanded={showSuggestions}
          aria-controls={showSuggestions ? listboxId : undefined}
          aria-autocomplete="list"
          placeholder="Search by company name..."
          className="input pl-11"
        />
      </div>

      {selectedCompany ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
          <CompanyLogo
            companyName={selectedCompany.name}
            logoUrl={selectedCompany.logo_url}
            companyDomain={selectedCompany.company_domain}
            website={selectedCompany.website}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-text-primary truncate">{selectedCompany.name}</div>
            <div className="text-xs text-text-muted truncate">
              {selectedCompany.headquarters || 'Location pending'}
            </div>
          </div>
        </div>
      ) : null}

      {showSuggestions ? (
        <div
          id={listboxId}
          role="listbox"
          className="mt-3 border border-white/5 rounded-xl divide-y divide-white/5 max-h-64 overflow-y-auto"
        >
          {suggestions.slice(0, 6).map((company) => (
            <button
              key={company.id}
              type="button"
              role="option"
              onClick={() => onSelect(company)}
              className="w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors flex items-center gap-3"
            >
              <CompanyLogo
                companyName={company.name}
                logoUrl={company.logo_url}
                companyDomain={company.company_domain}
                website={company.website}
                size="sm"
              />
              <div className="min-w-0">
                <div className="font-semibold text-text-primary truncate">{company.name}</div>
                <div className="text-xs text-text-muted truncate">
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
  const [leftPreview, setLeftPreview] = useState<Company | null>(null);
  const [rightPreview, setRightPreview] = useState<Company | null>(null);
  const [activePicker, setActivePicker] = useState<'left' | 'right' | null>(null);

  const leftSlug = searchParams.get('left') || '';
  const rightSlug = searchParams.get('right') || '';

  const { data: leftCompany } = useQuery({
    queryKey: ['company-picker-selected', leftSlug],
    queryFn: () => companiesApi.get(leftSlug),
    enabled: Boolean(leftSlug),
  });

  const { data: rightCompany } = useQuery({
    queryKey: ['company-picker-selected', rightSlug],
    queryFn: () => companiesApi.get(rightSlug),
    enabled: Boolean(rightSlug),
  });

  const { data: comparison, isLoading } = useQuery({
    queryKey: ['company-comparison', leftSlug, rightSlug],
    queryFn: () => companiesApi.compare(leftSlug, rightSlug),
    enabled: Boolean(leftSlug && rightSlug),
  });

  const selectedLeftCompany = comparison?.left || leftCompany || leftPreview || null;
  const selectedRightCompany = comparison?.right || rightCompany || rightPreview || null;

  const setCompany = (side: 'left' | 'right', company: Company) => {
    const next = new URLSearchParams(searchParams);
    next.set(side, company.slug);
    setSearchParams(next);
    setActivePicker(null);

    if (side === 'left') {
      setLeftPreview(company);
      setLeftSearch(company.name);
      return;
    }

    setRightPreview(company);
    setRightSearch(company.name);
  };

  const updateSearch = (side: 'left' | 'right', value: string) => {
    const selectedCompany = side === 'left' ? selectedLeftCompany : selectedRightCompany;
    setActivePicker(side);

    if (side === 'left') {
      setLeftSearch(value);
    } else {
      setRightSearch(value);
    }

    if (!selectedCompany) return;

    if (value.trim().toLowerCase() === selectedCompany.name.trim().toLowerCase()) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.delete(side);
    setSearchParams(next);
  };

  useEffect(() => {
    if (selectedLeftCompany && !leftSearch.trim()) {
      startTransition(() => setLeftSearch(selectedLeftCompany.name));
    }
  }, [leftSearch, selectedLeftCompany]);

  useEffect(() => {
    if (selectedRightCompany && !rightSearch.trim()) {
      startTransition(() => setRightSearch(selectedRightCompany.name));
    }
  }, [rightSearch, selectedRightCompany]);

  useEffect(() => {
    if (!leftSlug) startTransition(() => setLeftPreview(null));
  }, [leftSlug]);

  useEffect(() => {
    if (!rightSlug) startTransition(() => setRightPreview(null));
  }, [rightSlug]);

  useEffect(() => {
    if (leftCompany) startTransition(() => setLeftPreview(leftCompany));
  }, [leftCompany]);

  useEffect(() => {
    if (rightCompany) startTransition(() => setRightPreview(rightCompany));
  }, [rightCompany]);

  const heroText = leftSlug && rightSlug
    ? 'Compare sponsorship strength, salary coverage, and live jobs side by side.'
    : 'Choose any two companies to compare visa-fairness, salary data, and hiring signals.';

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="container-wide px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-text-muted">Decision Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-text-primary mb-3">
            Compare Companies
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm sm:text-base">{heroText}</p>
        </div>
      </div>

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Pickers */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-4 items-start">
          <CompanyPicker
            label="Company A"
            value={leftSearch}
            isOpen={activePicker === 'left'}
            onOpen={() => setActivePicker('left')}
            onClose={() => setActivePicker((current) => (current === 'left' ? null : current))}
            onChange={(value) => updateSearch('left', value)}
            selectedCompany={selectedLeftCompany}
            onSelect={(company) => setCompany('left', company)}
          />

          <div className="hidden xl:flex items-center justify-center pt-14">
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-accent">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>

          <CompanyPicker
            label="Company B"
            value={rightSearch}
            isOpen={activePicker === 'right'}
            onOpen={() => setActivePicker('right')}
            onClose={() => setActivePicker((current) => (current === 'right' ? null : current))}
            onChange={(value) => updateSearch('right', value)}
            selectedCompany={selectedRightCompany}
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
            {/* Company cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[comparison.left, comparison.right].map((company) => (
                <div key={company.slug} className="card p-5">
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
                        <h2 className="text-lg font-semibold text-text-primary truncate">{company.name}</h2>
                        <Badge variant="outline" size="sm">
                          {(company.active_job_count || 0).toLocaleString()} live jobs
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {(company.total_h1b_filings || 0).toLocaleString()} filings &middot; {(company.offer_count || 0).toLocaleString()} salary records
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(company.actionable_insights || []).map((insight) => (
                          <Badge key={insight} variant="ghost" size="sm">{insight}</Badge>
                        ))}
                      </div>
                      <Link
                        to={`/companies/${company.slug}`}
                        className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-accent hover:underline"
                      >
                        View Company
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">Comparison Summary</h2>
              </div>

              <div className="divide-y divide-white/5">
                {comparison.comparison.map((metric) => {
                  const winnerLabel = metric.winner === 'tie'
                    ? 'Tie'
                    : metric.winner === comparison.left.slug
                      ? comparison.left.name
                      : comparison.right.name;

                  return (
                    <div key={metric.field} className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 py-4 items-center text-sm">
                      <div className="font-medium text-text-primary">{metric.label}</div>
                      <div className="font-mono text-text-primary">{metric.left_value.toLocaleString()}</div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-text-primary">{metric.right_value.toLocaleString()}</span>
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

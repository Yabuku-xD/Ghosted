import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Building2, Briefcase, MapPin, DollarSign, Search, CheckCircle2, Loader2 } from 'lucide-react';
import { companiesApi } from '../api/services';
import { CompanyLogo } from '../components/ui';
import type { Company } from '../types';

interface JobApplicationFormProps {
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
}

export interface ApplicationFormData {
  company_id?: number;
  company_name: string;
  position_title: string;
  location: string;
  salary_range_min?: number;
  salary_range_max?: number;
  status: string;
  referral: boolean;
  notes: string;
}

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Phone Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer Received' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

function JobApplicationForm({ onClose, onSubmit }: JobApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    company_name: '',
    position_title: '',
    location: '',
    status: 'applied',
    referral: false,
    notes: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deferredCompanySearch = useDeferredValue(formData.company_name.trim());

  const { data: companySearchResults, isFetching: isSearchingCompanies } = useQuery({
    queryKey: ['company-search', deferredCompanySearch],
    queryFn: () => companiesApi.search(deferredCompanySearch),
    enabled: deferredCompanySearch.length >= 2,
  });

  const matchingCompanies = companySearchResults?.results.slice(0, 6) || [];
  const selectedCompany = matchingCompanies.find((company) => company.id === formData.company_id);

  const updateField = <K extends keyof ApplicationFormData>(field: K, value: ApplicationFormData[K]) => {
    setSubmitError('');
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCompanyInputChange = (value: string) => {
    setSubmitError('');
    setFormData((current) => ({
      ...current,
      company_name: value,
      company_id: current.company_name === value ? current.company_id : undefined,
    }));
  };

  const handleCompanySelect = (company: Company) => {
    setSubmitError('');
    setFormData((current) => ({
      ...current,
      company_id: company.id,
      company_name: company.name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_id) {
      setSubmitError('Select a company from the search results before saving.');
      return;
    }

    if (!formData.position_title.trim()) {
      setSubmitError('Position title is required.');
      return;
    }

    if (
      formData.salary_range_min &&
      formData.salary_range_max &&
      formData.salary_range_min > formData.salary_range_max
    ) {
      setSubmitError('Salary minimum cannot be greater than salary maximum.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        company_name: formData.company_name.trim(),
        position_title: formData.position_title.trim(),
        location: formData.location.trim(),
        notes: formData.notes.trim(),
      });
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Unable to save your application right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowCompanyResults = !formData.company_id && deferredCompanySearch.length >= 2;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 px-4 py-6 sm:p-6">
      <div className="mx-auto flex min-h-full items-center justify-center">
        <div className="card-static w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white border-b-2 border-border p-4 sm:p-6 flex items-center justify-between">
            <div>
              <h2 className="headline-sm">Add Application</h2>
              <p className="text-secondary text-sm mt-1">
                Save a role to your tracker and keep your search organized.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="tap-target inline-flex items-center justify-center text-secondary hover:text-accent transition-colors"
              aria-label="Close add application form"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
            {submitError ? (
              <div className="alert alert-error">
                <span className="text-sm">{submitError}</span>
              </div>
            ) : null}

            <div>
              <label className="label">
                <Building2 className="w-4 h-4 inline mr-1" />
                Company
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleCompanyInputChange(e.target.value)}
                  className="input pl-12"
                  placeholder="Search companies like Google, Stripe, or Amazon"
                  autoComplete="off"
                />
                {isSearchingCompanies ? (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />
                ) : null}
              </div>
              <p className="mt-2 text-xs text-secondary">
                Start typing at least 2 characters, then choose a company from the results.
              </p>

              {selectedCompany ? (
                <div className="mt-3 card-bento p-4">
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      companyName={selectedCompany.name}
                      logoUrl={selectedCompany.logo_url}
                      website={selectedCompany.website}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary truncate">{selectedCompany.name}</span>
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      </div>
                      <p className="text-xs text-secondary truncate">
                        {selectedCompany.industry_display || selectedCompany.industry || 'Company'}
                        {selectedCompany.headquarters ? ` • ${selectedCompany.headquarters}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {shouldShowCompanyResults ? (
                <div className="mt-3 border-2 border-border bg-white divide-y divide-border-light max-h-64 overflow-y-auto">
                  {matchingCompanies.length > 0 ? (
                    matchingCompanies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => handleCompanySelect(company)}
                        className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CompanyLogo
                            companyName={company.name}
                            logoUrl={company.logo_url}
                            website={company.website}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-primary truncate">{company.name}</div>
                            <div className="text-xs text-secondary truncate">
                              {company.industry_display || company.industry || 'Company'}
                              {company.headquarters ? ` • ${company.headquarters}` : ''}
                            </div>
                          </div>
                          {company.visa_fair_score ? (
                            <span className="badge badge-ghost flex-shrink-0">
                              Score {Number(company.visa_fair_score).toFixed(0)}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    ))
                  ) : !isSearchingCompanies ? (
                    <div className="px-4 py-3 text-sm text-secondary">
                      No companies matched that search yet.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Position Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.position_title}
                  onChange={(e) => updateField('position_title', e.target.value)}
                  className="input"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="input"
                  placeholder="e.g., San Francisco, CA or Remote"
                />
              </div>

              <div>
                <label className="label">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Salary Min
                </label>
                <input
                  type="number"
                  value={formData.salary_range_min || ''}
                  onChange={(e) => updateField('salary_range_min', parseInt(e.target.value, 10) || undefined)}
                  className="input"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="label">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Salary Max
                </label>
                <input
                  type="number"
                  value={formData.salary_range_max || ''}
                  onChange={(e) => updateField('salary_range_max', parseInt(e.target.value, 10) || undefined)}
                  className="input"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="select"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.referral}
                onChange={(e) => updateField('referral', e.target.checked)}
                className="checkbox"
              />
              <span className="text-sm text-primary">I have a referral for this position</span>
            </label>

            <div>
              <label className="label">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                className="textarea"
                rows={4}
                placeholder="Interview details, recruiter notes, or anything else you want to remember."
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={isSubmitting || !formData.company_id}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JobApplicationForm;

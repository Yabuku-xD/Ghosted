import { useState } from 'react';
import { X, DollarSign, Building2, MapPin, Briefcase } from 'lucide-react';

interface OfferFormProps {
  onClose: () => void;
  onSubmit: (data: OfferFormData) => void;
}

export interface OfferFormData {
  company_name: string;
  position_title: string;
  location: string;
  is_remote: boolean;
  base_salary: number;
  signing_bonus?: number;
  annual_bonus_pct?: number;
  stock_grant?: number;
  stock_grant_years?: number;
  experience_level: string;
  years_of_experience: number;
  visa_type: string;
  employment_type: string;
  is_anonymous: boolean;
}

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior (6-10 years)' },
  { value: 'staff', label: 'Staff/Principal (10+ years)' },
];

const VISA_TYPES = [
  { value: '', label: 'No sponsorship needed' },
  { value: 'h1b', label: 'H-1B' },
  { value: 'h1b_transfer', label: 'H-1B Transfer' },
  { value: 'opt', label: 'OPT' },
  { value: 'stem_opt', label: 'STEM OPT' },
  { value: 'green_card', label: 'Green Card Sponsorship' },
];

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Internship' },
];

function OfferForm({ onClose, onSubmit }: OfferFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OfferFormData>({
    company_name: '',
    position_title: '',
    location: '',
    is_remote: false,
    base_salary: 0,
    experience_level: 'mid',
    years_of_experience: 3,
    visa_type: '',
    employment_type: 'full_time',
    is_anonymous: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof OfferFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card-static max-w-lg w-full max-h-96 overflow-y-auto">
        <div className="p-6 border-b-2 flex items-center justify-between">
          <h2 className="headline-sm">Submit Your Offer</h2>
          <button onClick={onClose} className="text-secondary hover-text-accent">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div>
                <label className="block font-mono text-sm uppercase mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                  className="input"
                  placeholder="e.g., Google"
                />
              </div>

              <div>
                <label className="block font-mono text-sm uppercase mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Position Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.position_title}
                  onChange={(e) => updateField('position_title', e.target.value)}
                  className="input"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block font-mono text-sm uppercase mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="input"
                  placeholder="e.g., San Francisco, CA"
                />
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_remote}
                    onChange={(e) => updateField('is_remote', e.target.checked)}
                    className="w-5 h-5 border-2 border-border cursor-pointer"
                  />
                  <span className="text-sm text-secondary">Remote position</span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-primary btn-full"
              >
                Next: Compensation
              </button>
            </>
          )}

          {/* Step 2: Compensation */}
          {step === 2 && (
            <>
              <div>
                <label className="block font-mono text-sm uppercase mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Base Salary (USD)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.base_salary || ''}
                  onChange={(e) => updateField('base_salary', parseInt(e.target.value) || 0)}
                  className="input"
                  placeholder="e.g., 150000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-sm uppercase mb-2">
                    Signing Bonus
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.signing_bonus || ''}
                    onChange={(e) => updateField('signing_bonus', parseInt(e.target.value) || undefined)}
                    className="input"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm uppercase mb-2">
                    Annual Bonus %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.annual_bonus_pct || ''}
                    onChange={(e) => updateField('annual_bonus_pct', parseFloat(e.target.value) || undefined)}
                    className="input"
                    placeholder="e.g., 15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-sm uppercase mb-2">
                    Stock Grant (4-year)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.stock_grant || ''}
                    onChange={(e) => updateField('stock_grant', parseInt(e.target.value) || undefined)}
                    className="input"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm uppercase mb-2">
                    Vesting Years
                  </label>
                  <select
                    value={formData.stock_grant_years || 4}
                    onChange={(e) => updateField('stock_grant_years', parseInt(e.target.value))}
                    className="select"
                  >
                    <option value={3}>3 years</option>
                    <option value={4}>4 years</option>
                    <option value={5}>5 years</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 btn btn-secondary"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 btn btn-primary"
                >
                  Next: Details
                </button>
              </div>
            </>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <>
              <div>
                <label className="block font-mono text-sm uppercase mb-2">
                  Experience Level
                </label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => updateField('experience_level', e.target.value)}
                  className="select"
                >
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-sm uppercase mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.years_of_experience}
                  onChange={(e) => updateField('years_of_experience', parseInt(e.target.value) || 0)}
                  className="input"
                />
              </div>

              <div>
                <label className="block font-mono text-sm uppercase mb-2">
                  Visa Type
                </label>
                <select
                  value={formData.visa_type}
                  onChange={(e) => updateField('visa_type', e.target.value)}
                  className="select"
                >
                  {VISA_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-sm uppercase mb-2">
                  Employment Type
                </label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => updateField('employment_type', e.target.value)}
                  className="select"
                >
                  {EMPLOYMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="card-bento">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_anonymous}
                    onChange={(e) => updateField('is_anonymous', e.target.checked)}
                    className="w-5 h-5 border-2 border-border cursor-pointer mt-0-5"
                  />
                  <div>
                    <span className="font-semibold block">Submit anonymously</span>
                    <p className="text-sm text-secondary">
                      Your identity will not be shared with the offer data
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 btn btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  Submit Offer
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default OfferForm;

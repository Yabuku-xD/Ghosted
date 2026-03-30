import { useState } from 'react';
import { Calculator, AlertCircle, CheckCircle, Info, GraduationCap, Globe } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { lotteryApi } from '../api/services';
import { Button, Card, CardBody, useToast } from '../components/ui';
import type { LotteryInput, LotteryResult } from '../types';

const JOB_CATEGORIES = [
  { value: 'stem', label: 'STEM Occupation' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'business', label: 'Business/Finance' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const EMPLOYER_TYPES = [
  { value: 'large_cap', label: 'Large Cap (Fortune 500)' },
  { value: 'mid_cap', label: 'Mid Cap' },
  { value: 'startup', label: 'Startup' },
  { value: 'nonprofit', label: 'Non-Profit/Academic' },
];

const COUNTRY_WAIT_TIMES: Record<string, string> = {
  india: '8-10 years',
  china: '4-6 years',
  canada: 'Current',
  mexico: 'Current',
  uk: 'Current',
  other: 'Current',
};

const COUNTRIES = [
  { value: 'india', label: 'India' },
  { value: 'china', label: 'China' },
  { value: 'canada', label: 'Canada' },
  { value: 'mexico', label: 'Mexico' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'other', label: 'Other/Rest of World' },
];

function LotteryCalculator() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    country: '',
    hasMasters: false,
    usMasters: false,
    jobCategory: 'stem',
    employerType: 'large_cap',
  });

  const [showResults, setShowResults] = useState(false);
  const [lotteryResult, setLotteryResult] = useState<LotteryResult | null>(null);

  const mutation = useMutation({
    mutationFn: (data: LotteryInput) => lotteryApi.calculate(data),
    onSuccess: (result) => {
      setLotteryResult(result);
      setShowResults(true);
      toast.success('Lottery odds calculated!', 'Results ready');
    },
    onError: () => {
      toast.error('Failed to calculate lottery odds. Please try again.', 'Calculation Error');
    },
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country) {
      toast.error('Please select your country of birth.', 'Country Required');
      return;
    }
    
    const input: LotteryInput = {
      country_of_chargeability: formData.country,
      has_masters: formData.hasMasters,
      job_category: formData.jobCategory,
      employer_type: formData.employerType,
    };
    
    mutation.mutate(input);
  };

  const waitTime = COUNTRY_WAIT_TIMES[formData.country] || 'Current';
  const overallProbability = lotteryResult?.overall_probability 
    ? (lotteryResult.overall_probability * 100).toFixed(1) 
    : null;
  const mastersProbability = lotteryResult?.masters_cap_probability 
    ? (lotteryResult.masters_cap_probability * 100).toFixed(1) 
    : null;
  const regularProbability = lotteryResult?.regular_cap_probability 
    ? (lotteryResult.regular_cap_probability * 100).toFixed(1) 
    : null;

  return (
    <div className="bg-bg-primary min-h-screen">
      {/* Header */}
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-12">
          <div className="section-marker mb-2">
            <span>Calculator</span>
          </div>
          <h1 className="headline-lg">H-1B Lottery Calculator</h1>
          <p className="text-secondary mt-4 max-w-2xl text-lg">
            Calculate your lottery odds and understand your green card timeline based on your profile.
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card static>
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent text-white flex items-center justify-center border-2 border-border">
                  <Calculator className="w-5 h-5" />
                </div>
                <h2 className="headline-sm">Your Profile</h2>
              </div>

              <form onSubmit={handleCalculate} className="space-y-5">
                <div>
                  <label htmlFor="country" className="label">Country of Birth</label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="select"
                    required
                  >
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Card bento>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <GraduationCap className="w-5 h-5 text-accent" />
                    <input
                      type="checkbox"
                      checked={formData.hasMasters}
                      onChange={(e) => setFormData({ ...formData, hasMasters: e.target.checked })}
                      className="checkbox"
                    />
                    <span className="text-primary">I have a Master's degree or higher</span>
                  </label>
                </Card>

                {formData.hasMasters && (
                  <Card bento className="ml-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.usMasters}
                        onChange={(e) => setFormData({ ...formData, usMasters: e.target.checked })}
                        className="checkbox"
                      />
                      <span className="text-primary text-sm">From a US institution (eligible for Masters Cap)</span>
                    </label>
                  </Card>
                )}

                <div>
                  <label htmlFor="jobCategory" className="label">Job Category</label>
                  <select
                    id="jobCategory"
                    value={formData.jobCategory}
                    onChange={(e) => setFormData({ ...formData, jobCategory: e.target.value })}
                    className="select"
                  >
                    {JOB_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="employerType" className="label">Employer Type</label>
                  <select
                    id="employerType"
                    value={formData.employerType}
                    onChange={(e) => setFormData({ ...formData, employerType: e.target.value })}
                    className="select"
                  >
                    {EMPLOYER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  size="lg"
                  loading={mutation.isPending}
                  disabled={!formData.country}
                >
                  Calculate My Odds
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Results */}
          {showResults && lotteryResult ? (
            <div className="space-y-6">
              <Card static>
                <CardBody className="p-6 bg-accent-light">
                  <h3 className="headline-sm mb-4">Your Lottery Odds</h3>

                  <div className="text-center mb-6">
                    <div className="headline-xl text-accent mb-2">{overallProbability}%</div>
                    <div className="font-mono text-sm text-secondary uppercase">Overall Selection Probability</div>
                  </div>

                  <div className="space-y-3">
                    {formData.hasMasters && mastersProbability && (
                      <div className="flex justify-between items-center p-3 bg-white border-2 border-border">
                        <span className="text-primary">Masters Cap</span>
                        <span className="font-mono font-bold text-success">{mastersProbability}%</span>
                      </div>
                    )}
                    {regularProbability && (
                      <div className="flex justify-between items-center p-3 bg-white border-2 border-border">
                        <span className="text-primary">Regular Cap</span>
                        <span className="font-mono font-bold text-warning">{regularProbability}%</span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {lotteryResult.notes && lotteryResult.notes.length > 0 && (
                <Card static>
                  <CardBody className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-3 text-primary">Notes</h4>
                        <ul className="space-y-2 text-sm text-secondary">
                          {lotteryResult.notes.map((note, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              <Card static>
                <CardBody className="p-6">
                  <h3 className="headline-sm mb-4">Green Card Timeline</h3>
                  <Card bento className="flex items-center gap-4">
                    <Globe className="w-8 h-8 text-accent" />
                    <div>
                      <div className="font-mono text-sm uppercase text-secondary">Priority Date Wait Time</div>
                      <div className="headline-md text-accent">{waitTime}</div>
                    </div>
                  </Card>
                  <p className="mt-4 text-sm text-secondary">
                    This is the current estimated wait time for employment-based green cards
                    for {formData.country === 'india' ? 'India' : formData.country === 'china' ? 'China' : 'your country'}. Times vary by category (EB-1, EB-2, EB-3).
                  </p>
                </CardBody>
              </Card>

              <Card static>
                <CardBody className="p-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-3 text-primary">Recommendations</h4>
                      <ul className="space-y-2 text-sm text-secondary">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          Apply under Masters Cap if eligible (higher odds)
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          Have backup plans ready (day 1 CPT, other visa categories)
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                          Consider employers with strong immigration support
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : !mutation.isPending ? (
            <Card static>
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <Calculator className="w-16 h-16 mx-auto mb-4 text-muted opacity-50" />
                  <p className="text-secondary">Fill out your profile to see your lottery odds</p>
                </div>
              </div>
            </Card>
          ) : null}
        </div>

        {/* Historical Data */}
        <div className="mt-12">
          <Card static>
            <CardBody className="p-6 border-b-2 border-border-light">
              <h3 className="headline-sm">Historical Lottery Data</h3>
            </CardBody>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fiscal Year</th>
                    <th>Registrations</th>
                    <th>Selected</th>
                    <th>Selection Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>FY 2025</td>
                    <td className="font-mono">470,000</td>
                    <td className="font-mono">120,000</td>
                    <td className="font-mono font-bold text-warning">25.5%</td>
                  </tr>
                  <tr>
                    <td>FY 2024</td>
                    <td className="font-mono">780,000</td>
                    <td className="font-mono">188,000</td>
                    <td className="font-mono font-bold text-danger">24.1%</td>
                  </tr>
                  <tr>
                    <td>FY 2023</td>
                    <td className="font-mono">483,000</td>
                    <td className="font-mono">127,000</td>
                    <td className="font-mono font-bold text-warning">26.3%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LotteryCalculator;
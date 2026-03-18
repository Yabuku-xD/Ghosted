import { useState } from 'react';
import { Calculator, AlertCircle, CheckCircle, Info, GraduationCap, Globe } from 'lucide-react';
import { Button, Card, CardBody } from '../components/ui';

function LotteryCalculator() {
  const [formData, setFormData] = useState({
    country: '',
    hasMasters: false,
    usMasters: false,
    fiscalYear: '2026',
  });

  const [showResults, setShowResults] = useState(false);

  const countries = [
    { value: 'india', label: 'India', waitTime: '8-10 years' },
    { value: 'china', label: 'China', waitTime: '4-6 years' },
    { value: 'canada', label: 'Canada', waitTime: 'Current' },
    { value: 'mexico', label: 'Mexico', waitTime: 'Current' },
    { value: 'uk', label: 'United Kingdom', waitTime: 'Current' },
    { value: 'other', label: 'Other/Rest of World', waitTime: 'Current' },
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const country = countries.find((c) => c.value === formData.country);

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
                    {countries.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="fiscalYear" className="label">Fiscal Year</label>
                  <select
                    id="fiscalYear"
                    value={formData.fiscalYear}
                    onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                    className="select"
                  >
                    <option value="2026">FY 2026 (2025 Lottery)</option>
                    <option value="2025">FY 2025</option>
                    <option value="2024">FY 2024</option>
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

                <Button type="submit" variant="primary" fullWidth size="lg">
                  Calculate My Odds
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Results */}
          {showResults && country ? (
            <div className="space-y-6">
              <Card static>
                <CardBody className="p-6 bg-accent-light">
                  <h3 className="headline-sm mb-4">Your Lottery Odds</h3>

                  <div className="text-center mb-6">
                    <div className="headline-xl text-accent mb-2">25.6%</div>
                    <div className="font-mono text-sm text-secondary uppercase">Overall Selection Probability</div>
                  </div>

                  <div className="space-y-3">
                    {formData.usMasters && (
                      <div className="flex justify-between items-center p-3 bg-white border-2 border-border">
                        <span className="text-primary">Masters Cap</span>
                        <span className="font-mono font-bold text-success">35.2%</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-white border-2 border-border">
                      <span className="text-primary">Regular Cap</span>
                      <span className="font-mono font-bold text-warning">20.8%</span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card static>
                <CardBody className="p-6">
                  <h3 className="headline-sm mb-4">Green Card Timeline</h3>
                  <Card bento className="flex items-center gap-4">
                    <Globe className="w-8 h-8 text-accent" />
                    <div>
                      <div className="font-mono text-sm uppercase text-secondary">Priority Date Wait Time</div>
                      <div className="headline-md text-accent">{country.waitTime}</div>
                    </div>
                  </Card>
                  <p className="mt-4 text-sm text-secondary">
                    This is the current estimated wait time for employment-based green cards
                    for {country.label}. Times vary by category (EB-1, EB-2, EB-3).
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
          ) : (
            <Card static>
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <Calculator className="w-16 h-16 mx-auto mb-4 text-muted opacity-50" />
                  <p className="text-secondary">Fill out your profile to see your lottery odds</p>
                </div>
              </div>
            </Card>
          )}
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
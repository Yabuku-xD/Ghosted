import { useState } from 'react';
import {
  Award,
  BarChart3,
  Calculator,
  Database,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SalaryPredictor from '../components/SalaryPredictor';
import SponsorshipOdds from '../components/SponsorshipOdds';
import { companiesApi } from '../api/services';

function Predictions() {
  const [activeTab, setActiveTab] = useState<'salary' | 'lottery'>('salary');

  const { data: insights } = useQuery({
    queryKey: ['insights'],
    queryFn: () => companiesApi.getInsights(),
    staleTime: 5 * 60 * 1000,
  });

  const heroContent = {
    salary: {
      eyebrow: 'Comp Calibration',
      description:
        'Turn sponsor-backed salary filings into a sharper target range before the recruiter screen. The predictor balances role, city, and experience so you can anchor your expectations with evidence instead of guesswork.',
      metrics: [
        {
          label: 'Ground Truth',
          value: insights ? `${(insights.total_offers / 1000).toFixed(0)}K+` : '—',
          detail: 'historical salary filings',
          icon: Database,
        },
        {
          label: 'Output',
          value: '3-point',
          detail: 'low, expected, and high range',
          icon: BarChart3,
        },
        {
          label: 'Best For',
          value: 'Role + city',
          detail: 'benchmarking a specific target',
          icon: TrendingUp,
        },
      ],
    },
    lottery: {
      eyebrow: 'Visa Strategy',
      description:
        'Estimate sponsorship odds with a more practical read on risk. This view combines role context, experience level, and company sponsorship history so the result feels closer to an actual decision tool than a raw percentage.',
      metrics: [
        {
          label: 'Inputs',
          value: '3 signals',
          detail: 'company, role, and experience',
          icon: Award,
        },
        {
          label: 'Output',
          value: 'Risk + score',
          detail: 'likelihood and recommendation',
          icon: Sparkles,
        },
        {
          label: 'Best For',
          value: 'Target shortlist',
          detail: 'stack-ranking before applying',
          icon: TrendingUp,
        },
      ],
    },
  } as const;

  const activeHero = heroContent[activeTab];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="container-wide px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs uppercase tracking-[0.2em] text-text-muted">Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-text-primary">
                Predictions
              </h1>
            </div>
            <p className="text-sm text-text-muted max-w-md">
              {activeHero.description}
            </p>
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-6 pt-4 border-t border-white/5">
            {activeHero.metrics.map((metric) => (
              <div key={metric.label} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/8 text-text-muted">
                  <metric.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-text-muted">{metric.label}</div>
                  <div className="text-lg font-black tracking-[-0.04em] text-text-primary">{metric.value}</div>
                  <div className="text-xs text-text-muted">{metric.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="border-b border-white/5">
        <div className="container-wide px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {[
              { id: 'salary' as const, label: 'Salary Predictor', icon: Calculator, desc: 'Estimate a grounded comp range' },
              { id: 'lottery' as const, label: 'Sponsorship Odds', icon: Award, desc: 'Read the risk before you apply' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 text-left transition-colors ${
                  activeTab === tab.id ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  <span className="text-sm font-semibold">{tab.label}</span>
                </div>
                <span className="block text-xs mt-0.5">{tab.desc}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-wide px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            {activeTab === 'salary' ? <SalaryPredictor /> : <SponsorshipOdds />}
          </div>

          {/* Sidebar info */}
          <div className="space-y-6">
            {activeTab === 'salary' ? (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">How It Works</h3>
                  <div className="space-y-3">
                    {[
                      'Enter a job title, location, experience level, and visa status.',
                      'The predictor looks for comparable sponsor salary records in the dataset.',
                      'You get a range, confidence signal, and percentile context when enough matches exist.',
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="text-sm text-text-secondary leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/5 pt-6">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">What Improves Confidence</h3>
                  <div className="space-y-2">
                    {[
                      'Confidence improves when the location and title closely match real filings.',
                      'Fallback notes make it clear when the model had to broaden the comparison pool.',
                      'Average total comp appears when enough comparable records support it.',
                    ].map((note) => (
                      <div key={note} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-accent/50" />
                        <span className="text-sm text-text-secondary leading-relaxed">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Factors We Consider</h3>
                  <div className="space-y-2">
                    {[
                      'Your experience band and the kind of role you are targeting.',
                      'Historical sponsorship patterns for comparable applications.',
                      'The company-specific signal when you are checking a real employer.',
                    ].map((factor) => (
                      <div key={factor} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-accent/50" />
                        <span className="text-sm text-text-secondary leading-relaxed">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/5 pt-6">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">How To Read The Result</h3>
                  <div className="space-y-2">
                    {[
                      'The percentage gives the headline estimate, but the risk badge helps you interpret it quickly.',
                      'Similar approvals and total historical applications show how much precedent exists.',
                      'Recommendations point to what could strengthen or weaken your odds.',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-accent/50" />
                        <span className="text-sm text-text-secondary leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Predictions;

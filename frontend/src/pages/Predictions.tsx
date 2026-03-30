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
import { Tabs, TabList, Tab, TabPanel } from '../components/ui';
import { companiesApi } from '../api/services';

function Predictions() {
  const [activeTab, setActiveTab] = useState('salary');

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
      badge: 'Salary Focus',
      badgeClassName: 'bg-accent text-white',
      highlights: [
        'Estimate low, expected, and high salary bands for a target role.',
        'See confidence and percentile context when the dataset has close matches.',
        'Understand when the model needed broader fallback market data.',
      ],
      metrics: [
        {
          label: 'Ground Truth',
          value: insights ? `${(insights.total_offers / 1000).toFixed(0)}K+` : '—',
          detail: 'historical salary filings behind the current pay model',
          icon: Database,
          toneClassName: 'text-accent bg-accent-light',
        },
        {
          label: 'Output',
          value: '3-point',
          detail: 'low, expected, and high salary framing for faster negotiation prep',
          icon: BarChart3,
          toneClassName: 'text-info bg-[rgba(29,78,137,0.1)]',
        },
        {
          label: 'Best For',
          value: 'Role + city',
          detail: 'benchmarking a specific target before interviews or offers',
          icon: TrendingUp,
          toneClassName: 'text-success bg-success-light',
        },
      ],
    },
    lottery: {
      eyebrow: 'Visa Strategy',
      description:
        'Estimate sponsorship odds with a more practical read on risk. This view combines role context, experience level, and company sponsorship history so the result feels closer to an actual decision tool than a raw percentage.',
      badge: 'Odds Focus',
      badgeClassName: 'bg-success text-white',
      highlights: [
        'Estimate a likely sponsorship outcome for a specific job profile.',
        'See a risk band instead of just a naked probability number.',
        'Get recommendations grounded in comparable historical patterns.',
      ],
      metrics: [
        {
          label: 'Inputs',
          value: '3 signals',
          detail: 'company, role, and experience combine into the estimate',
          icon: Award,
          toneClassName: 'text-success bg-success-light',
        },
        {
          label: 'Output',
          value: 'Risk + score',
          detail: 'likelihood, confidence, and recommendation-style guidance',
          icon: Sparkles,
          toneClassName: 'text-warning bg-warning-light',
        },
        {
          label: 'Best For',
          value: 'Target shortlist',
          detail: 'stack-ranking companies before you spend time applying',
          icon: TrendingUp,
          toneClassName: 'text-accent bg-accent-light',
        },
      ],
    },
  } as const;

  const activeHero = heroContent[activeTab as keyof typeof heroContent];

  const salaryWorkflow = [
    'Enter a job title, location, experience level, and visa status.',
    'The predictor looks for comparable sponsor salary records in the dataset.',
    'You get a range, confidence signal, and percentile context when enough matches exist.',
  ];

  const salaryConfidenceNotes = [
    'Confidence improves when the location and title closely match real filings.',
    'Fallback notes make it clear when the model had to broaden the comparison pool.',
    'Average total comp appears when enough comparable records support it.',
  ];

  const sponsorshipFactors = [
    'Your experience band and the kind of role you are targeting.',
    'Historical sponsorship patterns for comparable applications.',
    'The company-specific signal when you are checking a real employer.',
  ];

  const sponsorshipReadout = [
    'The percentage gives the headline estimate, but the risk badge helps you interpret it quickly.',
    'Similar approvals and total historical applications show how much precedent exists.',
    'Recommendations point to what could strengthen or weaken your odds.',
  ];

  return (
    <div className="bg-bg-primary min-h-screen predictions-page">
      <div className="predictions-hero">
        <div className="container py-10 sm:py-14 lg:py-16">
          <div className="predictions-hero-grid">
            <div className="animate-slide-up">
              <div className="section-marker mb-3">
                <span>Intelligence</span>
              </div>

              <div className="predictions-hero-kicker">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>{activeHero.eyebrow}</span>
              </div>

              <h1 className="headline-lg">Predictions & Calculator</h1>
              <p className="text-secondary mt-4 max-w-2xl text-base sm:text-lg leading-relaxed">
                {activeHero.description}
              </p>

              <div className="predictions-hero-highlights">
                {activeHero.highlights.map((highlight) => (
                  <div key={highlight} className="predictions-hero-highlight">
                    <span className="predictions-hero-highlight-dot" aria-hidden="true"></span>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="predictions-hero-panel animate-slide-up" style={{ animationDelay: '90ms' }}>
              <div className="predictions-hero-panel-header">
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-secondary">Active Tool</div>
                  <div className="headline-sm mt-2">
                    {activeTab === 'salary' ? 'Salary Predictor' : 'Sponsorship Odds'}
                  </div>
                </div>
                <span className={`badge ${activeHero.badgeClassName}`}>{activeHero.badge}</span>
              </div>

              <div className="predictions-hero-metrics">
                {activeHero.metrics.map((metric) => (
                  <div key={metric.label} className="predictions-hero-metric">
                    <div className={`predictions-hero-metric-icon ${metric.toneClassName}`}>
                      <metric.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="predictions-hero-metric-label">{metric.label}</div>
                      <div className="predictions-hero-metric-value">{metric.value}</div>
                      <div className="predictions-hero-metric-detail">{metric.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultTab={activeTab} onChange={setActiveTab}>
        <div className="predictions-tab-shell">
          <div className="container py-4 sm:py-5">
            <TabList className="predictions-tab-list">
              <Tab
                id="salary"
                icon={
                  <span className="predictions-tab-icon">
                    <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                }
                className="predictions-tab-item"
              >
                <span className="predictions-tab-copy">
                  <span className="predictions-tab-title">Salary Predictor</span>
                  <span className="predictions-tab-caption">Estimate a grounded comp range</span>
                </span>
              </Tab>
              <Tab
                id="lottery"
                icon={
                  <span className="predictions-tab-icon">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                }
                className="predictions-tab-item"
              >
                <span className="predictions-tab-copy">
                  <span className="predictions-tab-title">Sponsorship Odds</span>
                  <span className="predictions-tab-caption">Read the risk before you apply</span>
                </span>
              </Tab>
            </TabList>
          </div>
        </div>

        <div className="container py-8 sm:py-12">
          <TabPanel id="salary">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2">
                <SalaryPredictor />
              </div>
              <div className="predictions-side-stack">
                <div className="predictions-side-card">
                  <div className="predictions-side-card-header">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    <h3 className="headline-sm">How It Works</h3>
                  </div>
                  <div className="predictions-side-list">
                    {salaryWorkflow.map((step, index) => (
                      <div key={step} className="predictions-side-list-item">
                        <span className="predictions-step-badge">{index + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="predictions-side-card predictions-side-card-muted">
                  <div className="predictions-side-card-header">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
                    <h3 className="headline-sm">What Improves Confidence</h3>
                  </div>
                  <div className="predictions-side-list">
                    {salaryConfidenceNotes.map((note) => (
                      <div key={note} className="predictions-side-list-item">
                        <span className="predictions-side-list-dot" aria-hidden="true"></span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>

                  <div className="predictions-note-card">
                    Predictions are grounded in the current Department of Labor salary dataset and get stronger as role and location matches tighten.
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel id="lottery">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2">
                <SponsorshipOdds />
              </div>
              <div className="predictions-side-stack">
                <div className="predictions-side-card">
                  <div className="predictions-side-card-header">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                    <h3 className="headline-sm">Factors We Consider</h3>
                  </div>
                  <div className="predictions-side-list">
                    {sponsorshipFactors.map((factor) => (
                      <div key={factor} className="predictions-side-list-item">
                        <span className="predictions-side-list-dot" aria-hidden="true"></span>
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="predictions-side-card predictions-side-card-muted">
                  <div className="predictions-side-card-header">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                    <h3 className="headline-sm">How To Read The Result</h3>
                  </div>
                  <div className="predictions-side-list">
                    {sponsorshipReadout.map((item) => (
                      <div key={item} className="predictions-side-list-item">
                        <span className="predictions-side-list-dot" aria-hidden="true"></span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="predictions-note-card">
                    This tool is still an estimate, but it is meant to help you decide which opportunities deserve deeper effort first.
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}

export default Predictions;

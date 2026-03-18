import { useState } from 'react';
import { Calculator, TrendingUp, Award } from 'lucide-react';
import SalaryPredictor from '../components/SalaryPredictor';
import SponsorshipOdds from '../components/SponsorshipOdds';
import { Tabs, TabList, Tab, TabPanel } from '../components/ui';

function Predictions() {
  const [activeTab, setActiveTab] = useState('salary');

  return (
    <div className="bg-bg-primary min-h-screen">
      {/* Header */}
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-8 sm:py-12">
          <div className="section-marker mb-2">
            <span>Intelligence</span>
          </div>
          <h1 className="headline-lg">Predictions & Calculator</h1>
          <p className="text-secondary mt-3 sm:mt-4 max-w-2xl text-base sm:text-lg">
            Get personalized insights on salary expectations and visa sponsorship
            likelihood based on real market data.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultTab={activeTab} onChange={setActiveTab}>
        <div className="border-b-2 border-border bg-white">
          <div className="container">
            <TabList>
              <Tab id="salary" icon={<Calculator className="w-4 h-4" />}>
                Salary Predictor
              </Tab>
              <Tab id="lottery" icon={<Award className="w-4 h-4" />}>
                Sponsorship Odds
              </Tab>
            </TabList>
          </div>
        </div>

        <div className="container py-6 sm:py-12">
          <TabPanel id="salary">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2">
                <SalaryPredictor />
              </div>
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                <div className="card-static p-4 sm:p-6">
                  <h3 className="headline-sm mb-3 sm:mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    How It Works
                  </h3>
                  <ul className="space-y-2 sm:space-y-3 text-secondary text-sm sm:text-base">
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold">1.</span>
                      Enter your job details and experience level
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold">2.</span>
                      Select your target location
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold">3.</span>
                      Get personalized salary range based on real H-1B data
                    </li>
                  </ul>
                </div>

                <div className="card-bento">
                  <h4 className="font-mono text-xs sm:text-sm uppercase text-secondary mb-2">
                    Data Sources
                  </h4>
                  <p className="text-xs sm:text-sm text-primary leading-relaxed">
                    Predictions are based on 119,000+ actual H-1B salary records
                    from the Department of Labor.
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel id="lottery">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2">
                <SponsorshipOdds />
              </div>
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                <div className="card-static p-4 sm:p-6">
                  <h3 className="headline-sm mb-3 sm:mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    Factors We Consider
                  </h3>
                  <ul className="space-y-2 sm:space-y-3 text-secondary text-xs sm:text-sm">
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold">•</span>
                      Your degree level and field of study
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold">•</span>
                      Country of chargeability (birth country)
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold">•</span>
                      Years of professional experience
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold">•</span>
                      Target company sponsorship history
                    </li>
                  </ul>
                </div>

                <div className="card-bento">
                  <h4 className="font-mono text-xs sm:text-sm uppercase text-secondary mb-2">
                    Important Note
                  </h4>
                  <p className="text-xs sm:text-sm text-primary leading-relaxed">
                    The H-1B lottery is random, but your chances depend on your
                    cap category (regular vs master's). This tool estimates your
                    probability based on historical data.
                  </p>
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

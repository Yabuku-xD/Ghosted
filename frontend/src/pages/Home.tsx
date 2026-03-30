import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calculator,
  Database,
  Scale,
  TrendingUp,
  Users,
  Sparkles,
  Target,
  Globe,
  Zap,
  Shield,
  ChevronRight,
  BriefcaseBusiness,
} from 'lucide-react';
import { companiesApi } from '../api/services';
import { CompanyLogo, AnimatedNumber, LiveIndicator } from '../components/ui';
import { useRef } from 'react';

// Animated gradient background component
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary gradient orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// Floating card component
function FloatingCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, delay: delay * 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Feature card component
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  link, 
  delay = 0,
  gradient = 'from-accent to-cyan-500'
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  link: string;
  delay?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={link} className="group block h-full">
        <div className="card h-full relative overflow-hidden">
          {/* Hover gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
          
          <div className="relative z-10">
            <motion.div
              className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Icon className="w-7 h-7 text-white" />
            </motion.div>
            
            <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-accent transition-colors">
              {title}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-5">
              {description}
            </p>
            
            <div className="flex items-center gap-2 text-accent text-sm font-medium">
              <span>Explore</span>
              <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                className="group-hover:translate-x-1 transition-transform"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Stat card component
function StatCard({ value, label, detail, icon: Icon, delay = 0 }: { value: number; label: string; detail: string; icon: React.ElementType; delay?: number }) {
  return (
    <motion.div
      className="stat-box group cursor-default"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <div className="stat-label">
        <Icon className="w-4 h-4 text-accent" />
        {label}
      </div>
      <div className="stat-value">
        <AnimatedNumber value={value} />
      </div>
      <div className="text-xs text-text-muted mt-2">{detail}</div>
    </motion.div>
  );
}

function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  
  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['company-insights'],
    queryFn: () => companiesApi.getInsights(),
  });

  const { data: topSponsors, isLoading: topSponsorsLoading } = useQuery({
    queryKey: ['top-sponsors'],
    queryFn: () => companiesApi.topSponsors(),
  });

  const { data: topHiring, isLoading: topHiringLoading } = useQuery({
    queryKey: ['top-hiring'],
    queryFn: () => companiesApi.topHiring(),
  });

  const coverageLabel = (() => {
    if (insightsLoading) return 'Loading...';
    if (!insights?.coverage_years.last) return 'Coverage pending';
    if (insights.coverage_years.first === insights.coverage_years.last) {
      return `FY${insights.coverage_years.last}`;
    }
    return `FY${insights.coverage_years.first}-FY${insights.coverage_years.last}`;
  })();

  const lastUpdatedLabel = (() => {
    if (insightsLoading || !insights?.latest_imported_at) return null;
    const date = new Date(insights.latest_imported_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    if (diffDays < 7) return `Updated ${diffDays} days ago`;
    return `Updated ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  })();

  const stats = [
    {
      value: insights?.total_companies || 0,
      label: 'Companies',
      detail: 'Indexed across the directory',
      icon: Building2,
    },
    {
      value: insights?.total_h1b_records || 0,
      label: 'H-1B Records',
      detail: 'Historical filings tracked',
      icon: Database,
    },
    {
      value: insights?.total_jobs || 0,
      label: 'Live Jobs',
      detail: 'Active opportunities',
      icon: BriefcaseBusiness,
    },
  ];

  const features = [
    {
      icon: Building2,
      title: 'Company Database',
      description: 'Search the full directory by sponsor history, salary coverage, and confidence level.',
      link: '/companies',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: TrendingUp,
      title: 'Salary Intelligence',
      description: 'Compare government-derived salary records with community submissions and trust signals.',
      link: '/offers',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Calculator,
      title: 'Lottery Calculator',
      description: 'Estimate your H-1B lottery odds using current data and historical patterns.',
      link: '/predictions',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: Scale,
      title: 'Compare Companies',
      description: 'See sponsorship strength, salary coverage, and live jobs side by side.',
      link: '/compare',
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-bg-primary">
      <AnimatedBackground />

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ y: springY, opacity: springOpacity, scale: springScale }}
      >
        <div className="container relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Job Intelligence for International Talent</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-none mb-6"
              >
                <span className="text-text-primary">Know your</span>
                <br />
                <span className="text-gradient">worth.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-lg text-text-secondary max-w-xl mb-10 leading-relaxed"
              >
                Explore sponsor history, salary records, and confidence signals in one place.
                Make data-driven decisions about your career with evidence-backed insights.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <Link to="/companies" className="btn btn-primary btn-glow group">
                  <span>Explore Companies</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/jobs" className="btn btn-secondary">
                  Browse Live Jobs
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-3 gap-4"
              >
                {stats.map((stat, index) => (
                  <StatCard key={stat.label} {...stat} delay={0.8 + index * 0.1} />
                ))}
              </motion.div>

              {lastUpdatedLabel && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="mt-6"
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-glass border border-border text-xs text-text-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    {lastUpdatedLabel}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Right Content - Featured Card */}
            <div className="order-1 lg:order-2">
              <FloatingCard delay={0.4}>
                <div className="card-glass p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-accent" />
                      <span className="text-sm font-medium text-text-secondary">Featured Sponsors</span>
                    </div>
                    <span className="badge badge-accent inline-flex items-center gap-1.5">
                      <LiveIndicator />
                      Live
                    </span>
                  </div>

                  <div className="space-y-3">
                    {topSponsorsLoading ? (
                      <div className="py-8 text-center">
                        <div className="w-8 h-8 border-2 border-bg-tertiary border-t-accent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-text-muted">Loading sponsors...</p>
                      </div>
                    ) : topSponsors?.slice(0, 3).map((company, index) => (
                      <motion.div
                        key={company.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <Link
                          to={`/companies/${company.slug}`}
                          className="flex items-center justify-between p-4 rounded-xl hover:bg-bg-glass transition-all duration-300 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <CompanyLogo
                              companyName={company.name}
                              logoUrl={company.logo_url}
                              companyDomain={company.company_domain}
                              website={company.website}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <div className="font-medium text-text-primary text-sm truncate group-hover:text-accent transition-colors">
                                {company.name}
                              </div>
                              <div className="text-xs text-text-muted">
                                {(company.total_h1b_filings || 0).toLocaleString()} filings
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold text-accent">
                              {Number(company.h1b_approval_rate || 0).toFixed(1)}%
                            </div>
                            <div className="text-xs text-text-muted">Approval</div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <Link to="/companies" className="btn btn-secondary btn-full mt-6 group">
                    View All Companies
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </FloatingCard>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-text-muted/30 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-text-muted"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="relative py-24 sm:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-glass border border-border mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-text-secondary">Features</span>
            </div>
            <h2 className="headline-lg mb-6">
              Everything you need to navigate the{' '}
              <span className="text-gradient">U.S. job market</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Powerful tools and insights to help international talent make informed career decisions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Hiring & Stats Section */}
      <section className="relative py-24 sm:py-32 bg-bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hiring Now */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-glass"
            >
              <div className="flex items-center gap-2 mb-6">
                <BriefcaseBusiness className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-text-secondary">Hiring Now</span>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Companies actively hiring</h3>
              <p className="text-text-secondary mb-6">Top employers with live job openings</p>

              <div className="space-y-3">
                {topHiring?.slice(0, 4).map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/jobs?company_slug=${company.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-bg-glass transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CompanyLogo
                          companyName={company.name}
                          logoUrl={company.logo_url}
                          companyDomain={company.company_domain}
                          website={company.website}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                            {company.name}
                          </div>
                          <div className="text-xs text-text-muted">
                            {(company.active_job_count || 0).toLocaleString()} open positions
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Link to="/jobs" className="btn btn-secondary btn-full mt-6 group">
                Browse All Jobs
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Coverage Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-glass"
            >
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-text-secondary">Data Coverage</span>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Platform metrics</h3>
              <p className="text-text-secondary mb-6">Current database statistics and coverage</p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Coverage Period', value: coverageLabel },
                  { label: 'Total Records', value: insights?.total_h1b_records?.toLocaleString() || '0' },
                  { label: 'Salary Records', value: insights?.total_offers?.toLocaleString() || '0' },
                  { label: 'Companies', value: insights?.total_companies?.toLocaleString() || '0' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="p-4 rounded-xl bg-bg-glass border border-border hover:border-border-accent transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="text-xs text-text-muted uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-xl font-bold text-text-primary">{item.value}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-featured text-center max-w-3xl mx-auto p-12"
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Globe className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="headline-md mb-4">
              Ready to find your next opportunity?
            </h2>
            <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
              Use company data, salary history, and compare views together to shortlist better targets faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/companies" className="btn btn-primary btn-glow">
                <Building2 className="w-5 h-5" />
                Browse Companies
              </Link>
              <Link to="/jobs" className="btn btn-secondary">
                <BriefcaseBusiness className="w-5 h-5" />
                Browse Jobs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Data Sources */}
      <section className="border-t border-white/5 py-12">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-text-muted">
            <span className="text-xs font-medium uppercase tracking-widest">Data sources:</span>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                <span className="font-medium text-text-primary">Department of Labor</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <span className="font-medium text-text-primary">Community submissions</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

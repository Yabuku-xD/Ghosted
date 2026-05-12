import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  Database,
  Radar,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { companiesApi, jobsApi } from '../api/services';
import heroAtlas from '../assets/sections/new/hero-atlas.png';
import resumeOrbit from '../assets/sections/new/resume-orbit.png';
import portalRibbon from '../assets/sections/new/portal-ribbon.png';
import finalHorizon from '../assets/sections/new/final-horizon.png';
import type { Company } from '../types';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const fallbackSources = [
  { source: 'Greenhouse', count: 1480 },
  { source: 'Lever', count: 1120 },
  { source: 'Ashby', count: 764 },
  { source: 'Workday', count: 938 },
];

function formatCompact(value?: number | null, fallback = '0') {
  if (!value) {
    return fallback;
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatSourceLabel(source: string) {
  return source
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function uniqueCompanies(companies: Company[]) {
  const seen = new Set<string>();

  return companies.filter((company) => {
    if (seen.has(company.slug)) {
      return false;
    }

    seen.add(company.slug);
    return true;
  });
}

function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  const { data: insights } = useQuery({
    queryKey: ['company-insights'],
    queryFn: () => companiesApi.getInsights(),
  });

  const { data: jobStatistics } = useQuery({
    queryKey: ['jobs-statistics-home'],
    queryFn: () => jobsApi.statistics(),
  });

  const { data: topSponsors } = useQuery({
    queryKey: ['top-sponsors-home'],
    queryFn: () => companiesApi.topSponsors(),
  });

  const { data: topHiring } = useQuery({
    queryKey: ['top-hiring-home'],
    queryFn: () => companiesApi.topHiring(),
  });

  const accordionItems = useMemo(() => {
    const sourceMap = {
      greenhouse: 'Structured, searchable, and usually the fastest lane for fit-first filtering.',
      lever: 'Great for role clustering and understanding active hiring momentum.',
      ashby: 'Useful when you want cleaner role taxonomy and sharp team signals.',
      workday: 'The noisy giant. Ghosted helps make it legible before you commit time.',
    };

    return (jobStatistics?.by_source?.length ? jobStatistics.by_source : fallbackSources)
      .slice(0, 4)
      .map((item, index) => {
        const normalized = item.source.toLowerCase().replace(/\s+/g, '');
        return {
          title: formatSourceLabel(item.source),
          count: item.count,
          summary:
            sourceMap[normalized as keyof typeof sourceMap] ||
            'Ghosted keeps this portal in the same scoring system so you can compare it against the rest of the market.',
          accent:
            [
              'from-[rgba(196,129,58,0.28)] to-transparent',
              'from-[rgba(180,78,48,0.24)] to-transparent',
              'from-[rgba(110,145,90,0.22)] to-transparent',
              'from-[rgba(96,118,140,0.22)] to-transparent',
            ][index],
        };
      });
  }, [jobStatistics]);

  const carouselSlides = useMemo(() => {
    const companies = uniqueCompanies([...(topSponsors || []), ...(topHiring || [])]).slice(0, 5);

    if (!companies.length) {
      return [];
    }

    return companies.map((company) => ({
      name: company.name,
      label: company.industry_display || company.industry || 'Career pathway',
      metric:
        company.active_job_count
          ? `${formatCompact(company.active_job_count)} live roles`
          : company.total_h1b_filings
            ? `${formatCompact(company.total_h1b_filings)} filings`
            : `${Math.round(Number(company.visa_fair_score || 72))} visa-fit score`,
      detail:
        company.actionable_insights?.[0] ||
        company.description ||
        'A strong blend of sponsorship history, live roles, and comparable evidence for international candidates.',
    }));
  }, [topHiring, topSponsors]);

  useEffect(() => {
    if (carouselSlides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [carouselSlides.length]);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('.js-fade-in').forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  const statCards = [
    {
      icon: Building2,
      label: 'Sponsor companies',
      value: formatCompact(insights?.sponsor_companies, '1.2K'),
      note: 'Companies already grounded in sponsorship history.',
    },
    {
      icon: BriefcaseBusiness,
      label: 'Live jobs',
      value: formatCompact(jobStatistics?.total_jobs || insights?.total_jobs, '4.8K'),
      note: 'Fresh roles from many ATS portals in one ranked stream.',
    },
    {
      icon: Database,
      label: 'Salary signals',
      value: formatCompact(insights?.total_offers, '15K'),
      note: 'Offer data and market evidence woven into the search layer.',
    },
  ];

  return (
    <div ref={containerRef} className="relative">
      {/* ============================================
          HERO — Full bleed, no box
          ============================================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroAtlas}
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary/60 to-bg-primary" />
        </div>

        <div className="relative px-4 pb-24 pt-32 sm:px-6 sm:pb-32 sm:pt-40 lg:px-8 lg:pb-44 lg:pt-52">
          <div className="container-wide">
            <div className="grid items-end gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <span className="site-kicker">H1B signal across every ATS portal</span>
                <div className="space-y-6">
                  <h1 className="max-w-6xl text-[clamp(3.2rem,8vw,7.5rem)] font-display leading-[0.88] tracking-[-0.03em] text-text-primary" style={{ textWrap: 'balance' }}>
                    {['Find', 'the', 'jobs', 'your', 'resume', 'was', 'actually', 'meant', 'to', 'win.'].map((word, i) => (
                      <span key={i} className="inline-block overflow-hidden">
                        <motion.span
                          className="inline-block"
                          style={{ marginRight: '0.22em' }}
                          initial={{ y: '110%' }}
                          animate={{ y: 0 }}
                          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 + i * 0.055 }}
                        >
                          {word}
                        </motion.span>
                      </span>
                    ))}
                  </h1>
                  <p className="pretty-text max-w-xl text-lg text-text-secondary sm:text-xl lg:text-2xl leading-relaxed">
                    Ghosted maps your resume against live jobs, sponsor history, salary evidence, and multi-portal ATS signals so the search feels directed instead of chaotic.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/jobs"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-text-primary px-7 py-3.5 text-sm font-semibold text-bg-primary transition-transform duration-300 ease-out hover:translate-y-[-1px] active:scale-[0.96]"
                  >
                    Start with matched jobs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/companies"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-text-primary transition-colors duration-300 hover:bg-glass active:scale-[0.96]"
                  >
                    Explore sponsor companies
                  </Link>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:h-[480px]">
                  <img
                    src={heroAtlas}
                    alt="Abstract resume atlas visual showing job-match pathways across portal layers."
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/50 via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-4 left-4 right-4 lg:left-6 lg:right-6">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-text-muted">
                    <Sparkles className="h-3.5 w-3.5" />
                    Live signal composition
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-16 flex flex-wrap gap-6 border-t border-border-light pt-8">
              {[
                'Resume-first ranking',
                'Multi-portal ATS coverage',
                'Salary + sponsorship context',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-text-secondary"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          VALUE PROP — Editorial split, no boxes
          ============================================ */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <div className="container-wide">
          <div className="js-fade-in grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div className="space-y-8">
              <span className="site-kicker">Resume orbit</span>
              <h2 className="balanced-text font-display text-4xl tracking-[-0.03em] text-text-primary sm:text-5xl lg:text-6xl leading-[0.95]">
                A resume should behave like an instrument panel, not a dead attachment.
              </h2>
              <p className="pretty-text max-w-lg text-lg text-text-secondary leading-relaxed">
                Upload once, then let Ghosted carry skill clusters, location intent, seniority, and sponsorship context across the entire search surface.
              </p>

              <div className="space-y-6 pt-4">
                {statCards.map(({ icon: Icon, label, value, note }) => (
                  <div key={label} className="group flex items-start gap-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition-colors duration-300 group-hover:border-border-accent group-hover:text-accent">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-text-muted">{label}</div>
                      <div className="mt-1 text-3xl font-black tracking-[-0.05em] text-text-primary">{value}</div>
                      <p className="pretty-text mt-1 max-w-xs text-sm text-text-secondary">{note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                {[
                  { to: '/jobs', label: 'Jobs surface' },
                  { to: '/companies', label: 'Sponsor directory' },
                  { to: '/offers', label: 'Salary evidence' },
                  { to: '/predictions', label: 'Prediction tools' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors duration-300 hover:bg-glass active:scale-[0.96]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl lg:aspect-auto lg:h-full lg:min-h-[560px]">
                <img
                  src={resumeOrbit}
                  alt="Orbiting resume visualization showing layered job-match signals around a central profile."
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          PORTAL RIBBON — Horizontal accordions
          ============================================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={portalRibbon}
            alt=""
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/90 to-bg-primary/80" />
        </div>

        <div className="relative px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
          <div className="container-wide">
            <div className="js-fade-in mb-12 max-w-4xl">
              <span className="site-kicker">Horizontal accords</span>
              <h2 className="balanced-text mt-6 text-4xl font-black tracking-[-0.05em] text-text-primary sm:text-5xl">
                Different ATS portals should feel like distinct pathways, not the same recycled list.
              </h2>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max gap-3">
                {accordionItems.map((item, index) => {
                  const isActive = activeAccordion === index;

                  return (
                    <motion.button
                      key={item.title}
                      type="button"
                      onClick={() => setActiveAccordion(index)}
                      animate={{ width: isActive ? 360 : 188 }}
                      transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}
                      className={`relative min-h-[260px] overflow-hidden rounded-2xl border p-6 text-left transition-colors duration-300 ${
                        isActive ? 'border-border bg-glass' : 'border-border-light bg-transparent'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-60`} />
                      <div className="relative flex h-full flex-col justify-between">
                        <div>
                          <div className="mb-4 text-xs uppercase tracking-[0.24em] text-text-muted">ATS lane</div>
                          <h3 className="text-2xl font-black tracking-[-0.04em] text-text-primary">{item.title}</h3>
                        </div>
                        <div>
                          <div className="tabular-nums text-4xl font-black tracking-[-0.05em] text-text-primary">
                            {formatCompact(item.count)}
                          </div>
                          {isActive && (
                            <p className="pretty-text mt-3 text-sm text-text-secondary leading-relaxed">{item.summary}</p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          COMPANY PATHWAYS — Minimal carousel
          ============================================ */}
      {carouselSlides.length > 0 && (
        <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
          <div className="container-wide">
            <div className="js-fade-in mb-12 flex items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className="site-kicker">Live pathways</span>
                <h2 className="balanced-text mt-4 text-3xl font-black tracking-[-0.05em] text-text-primary sm:text-4xl">
                  Company pathways with actual signal behind them.
                </h2>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => setActiveSlide((current) => (current - 1 + carouselSlides.length) % carouselSlides.length)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition-colors duration-300 hover:border-border-accent hover:text-text-primary active:scale-[0.96]"
                  aria-label="Previous company pathway"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlide((current) => (current + 1) % carouselSlides.length)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition-colors duration-300 hover:border-border-accent hover:text-text-primary active:scale-[0.96]"
                  aria-label="Next company pathway"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative min-h-[240px]">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={`${carouselSlides[activeSlide]?.name}-${activeSlide}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="grid gap-8 lg:grid-cols-[1fr_0.6fr]"
                >
                  <div className="space-y-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-text-muted">
                      {carouselSlides[activeSlide]?.label}
                    </div>
                    <h3 className="text-3xl font-black tracking-[-0.05em] text-text-primary sm:text-4xl lg:text-5xl">
                      {carouselSlides[activeSlide]?.name}
                    </h3>
                    <p className="pretty-text max-w-lg text-base text-text-secondary leading-relaxed sm:text-lg">
                      {carouselSlides[activeSlide]?.detail}
                    </p>
                  </div>
                  <div className="flex items-end justify-end">
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Signal</div>
                      <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-text-primary">
                        {carouselSlides[activeSlide]?.metric}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          FINAL HORIZON — Full-bleed CTA
          ============================================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={finalHorizon}
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/70 to-bg-primary/40" />
        </div>

        <div className="relative px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
          <div className="container-wide">
            <div className="js-fade-in grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
              <div className="space-y-6">
                <span className="site-kicker">Action chapter</span>
                <h2 className="balanced-text max-w-3xl text-4xl font-black tracking-[-0.05em] text-text-primary sm:text-5xl lg:text-6xl">
                  Stop searching like every portal deserves equal attention.
                </h2>
                <p className="pretty-text max-w-xl text-base text-text-secondary leading-relaxed sm:text-lg">
                  Ghosted now looks and moves like a high-intent product surface, while the routed data pages remain connected to the backend contracts already powering jobs, companies, offers, and predictions.
                </p>
              </div>

              <div className="space-y-2">
                <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-text-muted">
                  <Radar className="h-4 w-4" />
                  Choose your entry point
                </div>
                <div className="space-y-2">
                  {[
                    { to: '/jobs', label: 'Jobs', body: 'Open the ranked job stream and start filtering immediately.' },
                    { to: '/companies', label: 'Companies', body: 'Browse sponsorship-first employers with richer context.' },
                    { to: '/offers', label: 'Offers', body: 'Check compensation evidence before you decide to apply.' },
                    { to: '/predictions', label: 'Predictions', body: 'Use the calculators and models for the harder calls.' },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="group flex items-center justify-between gap-4 border-b border-border-light py-5 transition-colors duration-300 hover:border-border"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-text-primary transition-colors duration-300 group-hover:text-accent">{item.label}</h3>
                        <p className="pretty-text mt-1 text-sm text-text-secondary">{item.body}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-text-muted transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:text-accent" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

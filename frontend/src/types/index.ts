export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  company?: string;
  job_title?: string;
  location?: string;
  visa_status?: string | null;
  nationality?: string | null;
  country_of_birth?: string;
  years_of_experience?: number | null;
  current_location?: string;
  target_location?: string;
  linkedin_url?: string;
  email_verified?: boolean;
  created_at?: string;
}

export interface Company {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  logo_provider?: string;
  logo_confidence?: string;
  website?: string;
  company_domain?: string;
  domain_source?: string;
  domain_confidence?: string;
  description?: string;
  careers_url?: string;
  headquarters?: string;
  industry?: string;
  industry_display?: string;
  company_size?: string;
  company_size_display?: string;
  visa_fair_score?: number | string;
  h1b_approval_rate?: number | string;
  avg_salary_percentile?: number;
  sponsorship_consistency_score?: number | string;
  year_founded?: number;
  employee_count_estimate?: number;
  total_h1b_filings?: number;
  total_h1b_approvals?: number;
  first_filing_year?: number;
  last_filing_year?: number;
  offer_count?: number;
  verified_offer_count?: number;
  community_offer_count?: number;
  imported_offer_count?: number;
  review_count?: number;
  h1b_record_count?: number;
  active_job_count?: number;
  benefit_count?: number;
  data_coverage_years?: number;
  data_confidence?: string;
  data_sources?: string[];
  latest_offer_at?: string | null;
  latest_h1b_decision_date?: string | null;
  logo_last_checked_at?: string | null;
  actionable_insights?: string[];
}

export interface Offer {
  id: number;
  company?: number;
  company_name?: string;
  company_slug?: string;
  company_logo_url?: string;
  company_domain?: string;
  position_title: string;
  location?: string;
  base_salary: number;
  total_compensation?: number;
  experience_level?: string;
  experience_level_display?: string;
  visa_type?: string;
  visa_type_display?: string;
  data_source?: string;
  submitted_at?: string;
}

export interface CompanyListParams {
  page?: number;
  page_size?: number;
  search?: string;
  min_score?: number;
  sponsors_only?: boolean;
  has_offers?: boolean;
  has_jobs?: boolean;
  industry?: string;
  ordering?: string;
}

export interface CompanyInsights {
  total_companies: number;
  sponsor_companies: number;
  companies_with_domains: number;
  companies_with_websites: number;
  companies_with_logos: number;
  companies_with_jobs: number;
  companies_with_benefits: number;
  total_offers: number;
  verified_offers: number;
  community_offers: number;
  companies_with_salary_data: number;
  total_jobs: number;
  latest_job_posting_at?: string | null;
  total_benefits: number;
  verified_benefits: number;
  total_reviews: number;
  total_h1b_records: number;
  coverage_years: {
    first: number | null;
    last: number | null;
    span: number;
  };
  latest_case_decision_date?: string | null;
  latest_imported_at?: string | null;
}

export interface JobPosting {
  id: number;
  company: number;
  company_name: string;
  company_slug: string;
  title: string;
  team?: string;
  location?: string;
  remote_policy?: string;
  employment_type?: string;
  url: string;
  source: string;
  source_board?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string;
  posted_at?: string | null;
  visa_sponsorship_signal?: string;
  is_active: boolean;
}

export interface CompanyBenefit {
  id: number;
  company: number;
  title: string;
  description?: string;
  category: string;
  category_display?: string;
  value?: string;
  source: string;
  source_display?: string;
  source_url?: string;
  confidence: string;
  is_verified: boolean;
  created_at?: string;
}

export interface CompanyComparisonMetric {
  field: string;
  label: string;
  left_value: number;
  right_value: number;
  winner: string;
}

export interface CompanyComparison {
  left: Company;
  right: Company;
  comparison: CompanyComparisonMetric[];
}

export interface OfferListParams {
  page?: number;
  page_size?: number;
  company?: number;
  search?: string;
  location?: string;
  visa_type?: string;
  min_salary?: number;
  source?: string;
  ordering?: string;
}

export interface OfferStatistics {
  overall: {
    avg_base?: number | null;
    avg_total?: number | null;
    total_offers: number;
    company_count: number;
  };
  by_experience: Array<{
    experience_level: string;
    avg_salary?: number | null;
    count: number;
  }>;
  by_source: Array<{
    data_source: string;
    count: number;
  }>;
}

export interface JobApplication {
  id: number;
  user?: number;
  company: number;
  company_name: string;
  position_title: string;
  location?: string;
  salary_range_min?: number;
  salary_range_max?: number;
  status: string;
  applied_date: string;
  notes?: string;
  referral?: boolean;
  created_at?: string;
}

export interface SalaryPredictionInput {
  company_id?: number | null;
  company_name?: string;
  position_title: string;
  location: string;
  experience_level: string;
  years_of_experience: number;
  visa_status?: string;
}

export interface SalaryPredictionRecord {
  id: number;
  predicted_base_salary: number;
  salary_range_low: number;
  salary_range_high: number;
  confidence_score: number | string;
  similar_offers_count: number;
  market_percentile: number;
  created_at?: string;
}

export interface SalaryPredictionDetails {
  predicted_base_salary: number;
  salary_range_low: number;
  salary_range_high: number;
  confidence_score: number;
  similar_offers_count: number;
  market_percentile: number;
  average_total_comp?: number;
  note?: string;
  fallback?: boolean;
  filters_used?: {
    position_title?: string;
    location?: string;
    experience_level?: string;
    company?: string | null;
    visa_status?: string | null;
  };
}

export interface PredictionResult {
  prediction: SalaryPredictionRecord;
  details: SalaryPredictionDetails;
}

export interface LotteryInput {
  country_of_chargeability: string;
  has_masters: boolean;
  job_category: string;
  employer_type: string;
}

export interface LotteryResult {
  regular_cap_probability: number;
  masters_cap_probability: number;
  overall_probability: number;
  notes: string[];
}

export interface SponsorshipInput {
  company_id: number;
  job_title: string;
  experience_level: string;
}

export interface SponsorshipResult {
  likelihood: {
    likelihood_score: number | string;
    likelihood_percentage: number | string;
    similar_job_approvals: number;
  };
  details: {
    risk_level: string;
    total_historical_apps: number;
    recommendations: string[];
  };
}

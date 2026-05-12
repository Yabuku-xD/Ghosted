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
  company_logo_url?: string;
  company_domain?: string;
  company_visa_fair_score?: number | null;
  company_h1b_approval_rate?: number | null;
  company_offer_count?: number;
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
  last_seen_at?: string | null;
  description?: string;
  visa_sponsorship_signal?: string;
  is_active: boolean;
  job_score?: number | null;
  match_reasons?: string[];
}

export interface JobListParams {
  page?: number;
  page_size?: number;
  search?: string;
  location?: string;
  company?: number;
  company_slug?: string;
  source?: string;
  remote_policy?: string;
  visa_sponsorship_signal?: string;
  employment_type?: string;
  degree_level?: string;
  max_experience?: string;
  has_salary?: boolean;
  posted_within_days?: number;
  ordering?: string;
}

export interface JobStatistics {
  total_jobs: number;
  company_count: number;
  remote_jobs: number;
  salary_visible_jobs: number;
  latest_job_posting_at?: string | null;
  by_source: Array<{
    source: string;
    count: number;
  }>;
}

export interface ResumeMatchedJob extends JobPosting {
  job_family?: string;
  required_years_experience?: number | null;
  candidate_years_experience?: number | null;
  candidate_experience_label?: string;
  resume_match_score: number;
  resume_match_band: string;
  resume_match_reasons: string[];
  matched_skills: string[];
  trust_level?: string;
  trust_score?: number;
  trust_notes?: string[];
  stale_warning?: string | null;
}

export interface ResumeMatchProfileSummary {
  estimated_years_experience: number;
  estimated_experience_label?: string;
  seniority: string;
  top_skills: string[];
  target_families: string[];
}

export interface ResumeMatchTargetCluster {
  family: string | null;
  job_count: number;
  average_match_score: number | null;
  top_skills: string[];
}

export interface ResumeMatchSession {
  session_id: string;
  status: 'processing' | 'completed' | 'failed' | 'missing';
  created_at?: string;
  completed_at?: string;
  expires_at?: string;
  privacy_note?: string;
  error?: string;
  has_download?: boolean;
  resume_ready?: boolean;
  resume_file_name?: string;
  high_match_count?: number;
  filtered_low_match_count?: number;
  profile_summary?: ResumeMatchProfileSummary;
  high_matches?: ResumeMatchedJob[];
  target_cluster?: ResumeMatchTargetCluster | null;
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

// H1B Data Types
export interface H1BApplication {
  id: number;
  case_number: string;
  case_status: string;
  received_date: string;
  decision_date: string;
  employer_name: string;
  employer_city: string;
  employer_state: string;
  job_title: string;
  soc_code?: string;
  soc_title?: string;
  wage_rate_of_pay_from: string;
  wage_rate_of_pay_to?: string;
  wage_unit_of_pay: string;
  prevailing_wage: string;
  visa_class: string;
  full_time_position: boolean;
  fiscal_year: number;
}

export interface H1BListParams {
  page?: number;
  page_size?: number;
  search?: string;
  case_status?: string;
  fiscal_year?: number;
  visa_class?: string;
  employer_state?: string;
  ordering?: string;
}

export interface LotteryYear {
  id: number;
  fiscal_year: number;
  total_registrations: number;
  selected_registrations: number;
  regular_cap_registrations?: number;
  regular_cap_selected?: number;
  masters_cap_registrations?: number;
  masters_cap_selected?: number;
  overall_selection_rate: number | string;
  regular_cap_selection_rate?: number | string;
  masters_cap_selection_rate?: number | string;
  country_stats: Record<string, unknown>;
}

export interface LotteryYearDetail extends LotteryYear {
  statistics: {
    total_cases: number;
    avg_wage?: number | string;
  };
  top_employers: Array<{
    employer_name: string;
    count: number;
  }>;
}

export interface CountryCapStatus {
  id: number;
  country: string;
  fiscal_year: number;
  total_applications: number;
  approved: number;
  denied: number;
  pending: number;
  approval_rate: number | string;
  priority_date_current: boolean;
  priority_date_notes?: string;
}

export interface JobDiscoveryResult {
  companies_checked: number;
  total_new_jobs: number;
  discovered: Array<{
    company: string;
    jobs: number;
  }>;
}

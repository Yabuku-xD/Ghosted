import { apiClient } from './client';
import type {
  Company,
  CompanyBenefit,
  CompanyComparison,
  CompanyInsights,
  CompanyListParams,
  JobPosting,
  JobListParams,
  JobStatistics,
  Offer,
  OfferListParams,
  OfferStatistics,
  SalaryPredictionInput,
  PredictionResult,
  LotteryInput,
  LotteryResult,
  SponsorshipInput,
  SponsorshipResult,
} from '../types';

// Paginated response type
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Companies API
export const companiesApi = {
  list: (params?: CompanyListParams) =>
    apiClient.get<PaginatedResponse<Company>>('/companies/', { params }).then(r => r.data),
  get: (slug: string) => apiClient.get<Company>(`/companies/${slug}/`).then(r => r.data),
  search: (query: string) =>
    apiClient.get<PaginatedResponse<Company>>('/companies/', {
      params: {
        search: query,
        page_size: 6,
        ordering: '-total_h1b_filings',
      },
    }).then(r => r.data),
  getInsights: () => apiClient.get<CompanyInsights>('/companies/insights/').then(r => r.data),
  topSponsors: () => apiClient.get<Company[]>('/companies/top_sponsors/').then(r => r.data),
  topHiring: () => apiClient.get<Company[]>('/companies/top_hiring/').then(r => r.data),
  getJobs: (slug: string) => apiClient.get<JobPosting[]>(`/companies/${slug}/jobs/`).then(r => r.data),
  getBenefits: (slug: string) => apiClient.get<CompanyBenefit[]>(`/companies/${slug}/benefits/`).then(r => r.data),
  getSimilar: (slug: string) => apiClient.get<Company[]>(`/companies/${slug}/similar/`).then(r => r.data),
  compare: (left: string, right: string) =>
    apiClient.get<CompanyComparison>('/companies/compare/', { params: { left, right } }).then(r => r.data),
};

// Jobs API
export const jobsApi = {
  list: (params?: JobListParams) =>
    apiClient.get<PaginatedResponse<JobPosting>>('/jobs/', { params }).then(r => r.data),
  statistics: (params?: Omit<JobListParams, 'page' | 'page_size' | 'ordering'>) =>
    apiClient.get<JobStatistics>('/jobs/statistics/', { params }).then(r => r.data),
};

// Offers API
export const offersApi = {
  list: (params?: OfferListParams) =>
    apiClient.get<PaginatedResponse<Offer>>('/offers/', { params }).then(r => r.data),
  get: (id: string) => apiClient.get<Offer>(`/offers/${id}/`).then(r => r.data),
  create: (data: Partial<Offer>) => apiClient.post<Offer>('/offers/', data).then(r => r.data),
  statistics: (params?: Omit<OfferListParams, 'page'>) =>
    apiClient.get<OfferStatistics>('/offers/statistics/', { params }).then(r => r.data),
};

// Predictions API
export const predictionsApi = {
  predict: (data: SalaryPredictionInput) =>
    apiClient.post<PredictionResult>('/predictions/salary/', data).then(r => r.data),
};

// Lottery API
export const lotteryApi = {
  calculate: (data: LotteryInput) =>
    apiClient.post<LotteryResult>('/predictions/lottery_risk/', data).then(r => r.data),
};

// Sponsorship API
export const sponsorshipApi = {
  calculate: (data: SponsorshipInput) =>
    apiClient.post<SponsorshipResult>('/sponsorship-likelihood/calculate/', data).then(r => r.data),
};

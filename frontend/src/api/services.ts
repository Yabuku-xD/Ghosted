import { apiClient } from './client';
import type {
  User,
  Company,
  CompanyInsights,
  CompanyListParams,
  Offer,
  OfferListParams,
  OfferStatistics,
  JobApplication,
  SalaryPredictionInput,
  PredictionResult,
  LotteryInput,
  LotteryResult,
  SponsorshipInput,
  SponsorshipResult,
} from '../types';

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post('/auth/login/', { username, password }),
  register: (username: string, email: string, password: string) =>
    apiClient.post('/auth/register/', { username, email, password }),
  refresh: (refresh: string) =>
    apiClient.post('/auth/refresh/', { refresh }),
  me: () => apiClient.get<User>('/auth/me/'),
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password/', { email }),
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password/', { token, new_password: password }),
  getCurrentUser: () => apiClient.get<User>('/auth/me/').then(r => r.data),
  updateProfile: (data: Partial<User>) =>
    apiClient.patch<User>('/auth/me/', data).then(r => r.data),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/auth/change-password/', { current_password: currentPassword, new_password: newPassword }),
};

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
        ordering: '-total_h1b_filings',
      },
    }).then(r => r.data),
  getInsights: () => apiClient.get<CompanyInsights>('/companies/insights/').then(r => r.data),
  topSponsors: () => apiClient.get<Company[]>('/companies/top_sponsors/').then(r => r.data),
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

// Applications API
export const applicationsApi = {
  list: () => apiClient.get<{ results: JobApplication[] }>('/applications/').then(r => r.data.results),
  get: (id: string) => apiClient.get<JobApplication>(`/applications/${id}/`).then(r => r.data),
  create: (data: Partial<JobApplication>) =>
    apiClient.post<JobApplication>('/applications/', data).then(r => r.data),
  update: (id: string, data: Partial<JobApplication>) =>
    apiClient.patch<JobApplication>(`/applications/${id}/`, data).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/applications/${id}/`),
};

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Award, Briefcase, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import { sponsorshipApi } from '../api/services';
import { Button, Card, CardBody, Badge, Progress } from '../components/ui';
import { useToast } from '../components/ui/useToast';
import type { SponsorshipInput } from '../types';

const sponsorshipSchema = z.object({
  company_id: z.number().min(1, 'Company is required'),
  job_title: z.string().min(1, 'Job title is required'),
  experience_level: z.enum(['entry', 'mid', 'senior', 'staff', 'executive']),
});

type SponsorshipFormData = z.infer<typeof sponsorshipSchema>;

interface SponsorshipOddsProps {
  companyId?: number;
  companyName?: string;
}

function SponsorshipOdds({ companyId, companyName }: SponsorshipOddsProps) {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SponsorshipFormData>({
    resolver: zodResolver(sponsorshipSchema),
    defaultValues: {
      company_id: companyId,
      experience_level: 'mid',
    },
  });

  const watchedCompanyId = watch('company_id');

  const mutation = useMutation({
    mutationFn: (data: SponsorshipInput) => sponsorshipApi.calculate(data),
    onSuccess: () => {
      toast.success('Likelihood calculated!', 'Results ready');
    },
    onError: () => {
      toast.error('Failed to calculate. Please try again.', 'Error');
    },
  });

  const onSubmit = (data: SponsorshipFormData) => {
    if (!data.company_id || data.company_id < 1) {
      toast.error('Please select a valid company to check sponsorship odds.', 'Company Required');
      return;
    }
    mutation.mutate(data as SponsorshipInput);
  };

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior (6-10 years)' },
    { value: 'staff', label: 'Staff/Principal (10+ years)' },
    { value: 'executive', label: 'Executive' },
  ];

  const getRiskBadge = (riskLevel: string): { variant: 'success' | 'warning' | 'danger' | 'ghost'; label: string } => {
    switch (riskLevel) {
      case 'excellent':
        return { variant: 'success', label: 'EXCELLENT' };
      case 'good':
        return { variant: 'success', label: 'GOOD' };
      case 'moderate':
        return { variant: 'warning', label: 'MODERATE' };
      case 'poor':
        return { variant: 'danger', label: 'POOR' };
      default:
        return { variant: 'ghost', label: riskLevel.toUpperCase() };
    }
  };

  const getLikelihoodColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-danger';
  };

  const likelihoodPercentage = mutation.data ? Number(mutation.data.likelihood.likelihood_percentage) : 0;
  const likelihoodScore = mutation.data ? Number(mutation.data.likelihood.likelihood_score) : 0;

  return (
    <Card static>
      <CardBody className="p-4 sm:p-6 border-b-2 border-border-light">
        <h2 className="headline-sm flex items-center gap-2">
          <Award className="w-5 h-5 text-accent" />
          Sponsorship Odds
        </h2>
        <p className="text-secondary text-sm mt-2">
          {companyName
            ? `Check sponsorship likelihood at ${companyName}`
            : 'Estimate sponsorship likelihood for your role'}
        </p>
      </CardBody>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-5">
        {!companyId && (
          <div>
            <label htmlFor="company_id" className="label">Company ID</label>
            <input
              {...register('company_id', { valueAsNumber: true })}
              id="company_id"
              type="number"
              placeholder="Enter company ID"
              className="input"
            />
            {errors.company_id && (
              <p className="mt-2 text-sm text-danger">{errors.company_id.message}</p>
            )}
            {!watchedCompanyId && (
              <p className="mt-2 text-xs text-muted">Visit a company page to get their ID, or use the salary predictor above.</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="job_title" className="label">Job Title</label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              {...register('job_title')}
              id="job_title"
              type="text"
              placeholder="e.g., Software Engineer"
              className="input pl-12"
            />
          </div>
          {errors.job_title && (
            <p className="mt-2 text-sm text-danger">{errors.job_title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="experience_level" className="label">Experience Level</label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <select
              {...register('experience_level')}
              id="experience_level"
              className="select pl-12"
            >
              {experienceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={mutation.isPending}
        >
          <TrendingUp className="w-4 h-4" />
          Check Likelihood
        </Button>
      </form>

      {mutation.data && (
        <div className="p-4 sm:p-6 border-t-2 border-border bg-secondary">
          <div className="text-center mb-6">
            <div className={`text-4xl sm:text-5xl font-bold font-display ${getLikelihoodColor(likelihoodPercentage)}`}>
              {likelihoodPercentage.toFixed(0)}%
            </div>
            <Badge variant={getRiskBadge(mutation.data.details.risk_level).variant}>
              {getRiskBadge(mutation.data.details.risk_level).label}
            </Badge>
            <p className="text-secondary text-sm mt-3">
              Likelihood score: {likelihoodScore.toFixed(1)} / 10
            </p>
          </div>

          <Progress value={likelihoodPercentage} showLabel />

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="card-bento p-4">
              <div className="font-mono text-xs uppercase text-secondary mb-1">Similar Job Approvals</div>
              <div className="font-mono font-bold text-accent">{mutation.data.likelihood.similar_job_approvals}</div>
            </div>
            <div className="card-bento p-4">
              <div className="font-mono text-xs uppercase text-secondary mb-1">Historical Applications</div>
              <div className="font-mono font-bold text-accent">{mutation.data.details.total_historical_apps}</div>
            </div>
          </div>

          {mutation.data.details.recommendations && mutation.data.details.recommendations.length > 0 && (
            <div className="mt-6 pt-6 border-t-2 border-border">
              <h4 className="font-mono text-sm uppercase text-secondary mb-3">
                Recommendations
              </h4>
              <div className="space-y-3">
                {mutation.data.details.recommendations.slice(0, 3).map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-primary">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default SponsorshipOdds;

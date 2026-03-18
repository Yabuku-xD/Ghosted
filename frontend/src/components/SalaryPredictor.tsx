import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, MapPin, Briefcase, GraduationCap, TrendingUp } from 'lucide-react';
import { predictionsApi } from '../api/services';
import { Button, Card, CardBody, Progress } from '../components/ui';
import { useToast } from '../components/ui/Toast';
import type { PredictionResult, SalaryPredictionInput } from '../types';

const salarySchema = z.object({
  position_title: z.string().min(1, 'Job title is required'),
  location: z.string().min(1, 'Location is required'),
  experience_level: z.enum(['entry', 'mid', 'senior', 'staff']),
  years_of_experience: z.number().min(0).max(50),
  visa_status: z.enum([
    'h1b',
    'h1b_transfer',
    'green_card',
    'opt',
    'stem_opt',
    'no_sponsorship',
    'tn',
    'e3',
  ]),
});

type SalaryFormData = z.infer<typeof salarySchema>;

function SalaryPredictor() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      experience_level: 'mid',
      years_of_experience: 3,
      visa_status: 'h1b',
    },
  });

  const onSubmit = async (data: SalaryFormData) => {
    try {
      const result = await predictionsApi.predict(data as SalaryPredictionInput);
      setPrediction(result);
      toast.success('Salary prediction calculated!', 'Results ready');
    } catch (error) {
      toast.error('Failed to calculate prediction. Please try again.', 'Error');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatOrdinal = (value: number) => {
    const mod10 = value % 10;
    const mod100 = value % 100;

    if (mod10 === 1 && mod100 !== 11) return `${value}st`;
    if (mod10 === 2 && mod100 !== 12) return `${value}nd`;
    if (mod10 === 3 && mod100 !== 13) return `${value}rd`;
    return `${value}th`;
  };

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior (6-10 years)' },
    { value: 'staff', label: 'Staff/Principal (10+ years)' },
  ];

  const visaOptions = [
    { value: 'h1b', label: 'H-1B' },
    { value: 'h1b_transfer', label: 'H-1B Transfer' },
    { value: 'green_card', label: 'Green Card' },
    { value: 'opt', label: 'OPT' },
    { value: 'stem_opt', label: 'STEM OPT' },
    { value: 'tn', label: 'TN' },
    { value: 'e3', label: 'E-3' },
    { value: 'no_sponsorship', label: 'No Sponsorship Needed' },
  ];

  const predictionDetails = prediction?.details;
  const confidenceScore = predictionDetails ? Number(predictionDetails.confidence_score) : 0;
  const similarOffersCount = predictionDetails?.similar_offers_count || 0;
  const averageTotalComp = predictionDetails?.average_total_comp;
  const percentile = predictionDetails?.market_percentile;
  const keyFactors = [
    predictionDetails?.filters_used?.experience_level ? `Experience: ${predictionDetails.filters_used.experience_level}` : null,
    predictionDetails?.filters_used?.location ? `Location: ${predictionDetails.filters_used.location}` : null,
    predictionDetails?.filters_used?.visa_status ? `Visa: ${predictionDetails.filters_used.visa_status}` : null,
    predictionDetails?.fallback ? 'Broader market data used' : null,
    predictionDetails?.note || null,
  ].filter(Boolean) as string[];

  return (
    <Card static>
      <CardBody className="p-4 sm:p-6 border-b-2 border-border-light">
        <h2 className="headline-sm flex items-center gap-2">
          <Calculator className="w-5 h-5 text-accent" />
          Salary Predictor
        </h2>
        <p className="text-secondary text-sm mt-2">
          Get salary estimates based on real H-1B data
        </p>
      </CardBody>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-5">
        <div>
          <label htmlFor="position_title" className="label">Job Title</label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              {...register('position_title')}
              id="position_title"
              type="text"
              placeholder="e.g. Software Engineer"
              className="input pl-12"
            />
          </div>
          {errors.position_title && (
            <p className="mt-2 text-sm text-danger">{errors.position_title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="location" className="label">Location</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              {...register('location')}
              id="location"
              type="text"
              placeholder="e.g. San Francisco, CA"
              className="input pl-12"
            />
          </div>
          {errors.location && (
            <p className="mt-2 text-sm text-danger">{errors.location.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="years_of_experience" className="label">Years of Experience</label>
            <input
              {...register('years_of_experience', { valueAsNumber: true })}
              id="years_of_experience"
              type="number"
              min="0"
              max="50"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="experience_level" className="label">Experience Level</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
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
        </div>

        <div>
          <label htmlFor="visa_status" className="label">Visa Status</label>
          <select {...register('visa_status')} id="visa_status" className="select">
            {visaOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
          <TrendingUp className="w-4 h-4" />
          Calculate Salary
        </Button>
      </form>

      {predictionDetails && (
        <div className="p-4 sm:p-6 border-t-2 border-border bg-secondary">
          <h3 className="font-mono text-sm uppercase text-secondary mb-4">
            Predicted Salary Range
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card-bento text-center p-4">
              <div className="font-mono text-xs uppercase text-secondary mb-1">Min</div>
              <div className="font-mono font-bold text-accent">
                {formatCurrency(predictionDetails.salary_range_low)}
              </div>
            </div>
            <div className="card-accent text-center p-4">
              <div className="font-mono text-xs uppercase text-white/80 mb-1">Expected</div>
              <div className="font-mono font-bold">
                {formatCurrency(predictionDetails.predicted_base_salary)}
              </div>
            </div>
            <div className="card-bento text-center p-4">
              <div className="font-mono text-xs uppercase text-secondary mb-1">Max</div>
              <div className="font-mono font-bold text-accent">
                {formatCurrency(predictionDetails.salary_range_high)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Progress value={confidenceScore * 100} showLabel />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="card-bento p-4">
                <div className="font-mono text-xs uppercase text-secondary mb-1">Matching Offers</div>
                <div className="font-mono font-bold text-accent">{similarOffersCount}</div>
              </div>
              {averageTotalComp ? (
                <div className="card-bento p-4">
                  <div className="font-mono text-xs uppercase text-secondary mb-1">Avg Total Comp</div>
                  <div className="font-mono font-bold text-accent">{formatCurrency(averageTotalComp)}</div>
                </div>
              ) : null}
            </div>

            {typeof percentile === 'number' ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span>About the {formatOrdinal(percentile)} percentile for similar roles</span>
              </div>
            ) : null}
          </div>

          {keyFactors.length > 0 && (
            <div className="mt-6 pt-6 border-t-2 border-border">
              <h4 className="font-mono text-sm uppercase text-secondary mb-3">
                Key Factors
              </h4>
              <div className="flex flex-wrap gap-2">
                {keyFactors.map((factor) => (
                  <span key={factor} className="badge badge-ghost">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default SalaryPredictor;

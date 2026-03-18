import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/services';
import { Button } from '../components/ui';
import { useToast } from '../components/ui/Toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

function ForgotPassword() {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: { email: string }) => authApi.forgotPassword(data.email),
    onSuccess: () => {
      toast.success('Reset link sent!', 'Check your email inbox');
    },
    onError: () => {
      toast.error('Failed to send reset link. Please try again.', 'Error');
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-bg-primary min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-secondary hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-sm uppercase tracking-wider">Back to Login</span>
        </Link>

        {/* Card */}
        <div className="card-static bg-white p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-light border-2 border-accent flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <h1 className="headline-md mb-2">Forgot Password?</h1>
            <p className="text-secondary text-sm">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`input pl-12 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-danger">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={mutation.isPending}
            >
              <Send className="w-4 h-4" />
              Send Reset Link
            </Button>
          </form>

          {/* Success Message */}
          {mutation.isSuccess && (
            <div className="alert alert-success mt-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-success flex-shrink-0">✓</div>
                <div>
                  <p className="font-semibold text-primary">Check your email</p>
                  <p className="text-sm text-secondary mt-1">
                    We've sent a password reset link to your email address. The link will expire in 1 hour.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-secondary text-sm mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
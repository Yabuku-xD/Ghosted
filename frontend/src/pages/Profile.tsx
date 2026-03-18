import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { User, Mail, Lock, Building2, Briefcase, MapPin, Save, Shield } from 'lucide-react';
import { authApi } from '../api/services';
import { Button } from '../components/ui';
import { useToast } from '../components/ui/Toast';
import { useState } from 'react';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().optional(),
  job_title: z.string().optional(),
  location: z.string().optional(),
});

const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

function Profile() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Fetch current user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser(),
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: user ? {
      full_name: user.full_name || '',
      email: user.email || '',
      company: user.company || '',
      job_title: user.job_title || '',
      location: user.location || '',
    } : undefined,
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => authApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully!', 'Changes saved');
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.', 'Error');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordChangeFormData) =>
      authApi.changePassword(data.current_password, data.new_password),
    onSuccess: () => {
      toast.success('Password changed successfully!', 'Security updated');
      resetPasswordForm();
    },
    onError: () => {
      toast.error('Failed to change password. Check your current password.', 'Error');
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    profileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordChangeFormData) => {
    passwordMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="bg-bg-primary min-h-screen flex items-center justify-center">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="bg-bg-primary min-h-screen">
      {/* Header */}
      <div className="bg-secondary border-b-3 border-border">
        <div className="container py-12">
          <div className="section-marker mb-2">
            <span>Account</span>
          </div>
          <h1 className="headline-lg">Profile Settings</h1>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="tabs mb-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`tab ${activeTab === 'security' ? 'tab-active' : ''}`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Security
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card-static bg-white p-8">
              <h2 className="headline-sm mb-6">Personal Information</h2>

              <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 pb-6 border-b-2 border-border-light">
                  <div className="avatar avatar-lg bg-accent text-white">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{user?.full_name || 'User'}</h3>
                    <p className="text-sm text-secondary">{user?.email}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="full_name" className="label">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        {...registerProfile('full_name')}
                        id="full_name"
                        type="text"
                        placeholder="Your full name"
                        className={`input pl-12 ${profileErrors.full_name ? 'input-error' : ''}`}
                      />
                    </div>
                    {profileErrors.full_name && (
                      <p className="mt-2 text-sm text-danger">{profileErrors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="label">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        {...registerProfile('email')}
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className={`input pl-12 ${profileErrors.email ? 'input-error' : ''}`}
                      />
                    </div>
                    {profileErrors.email && (
                      <p className="mt-2 text-sm text-danger">{profileErrors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="company" className="label">Company (Optional)</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        {...registerProfile('company')}
                        id="company"
                        type="text"
                        placeholder="Your company"
                        className="input pl-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="job_title" className="label">Job Title (Optional)</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        {...registerProfile('job_title')}
                        id="job_title"
                        type="text"
                        placeholder="Your role"
                        className="input pl-12"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="location" className="label">Location (Optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        {...registerProfile('location')}
                        id="location"
                        type="text"
                        placeholder="City, State or Country"
                        className="input pl-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-border-light">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={profileMutation.isPending}
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="card-static bg-white p-8">
                <h2 className="headline-sm mb-2">Change Password</h2>
                <p className="text-secondary text-sm mb-6">
                  Update your password to keep your account secure.
                </p>

                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="current_password" className="label">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        {...registerPassword('current_password')}
                        id="current_password"
                        type="password"
                        placeholder="Enter current password"
                        className={`input pl-12 ${passwordErrors.current_password ? 'input-error' : ''}`}
                      />
                    </div>
                    {passwordErrors.current_password && (
                      <p className="mt-2 text-sm text-danger">{passwordErrors.current_password.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="new_password" className="label">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        {...registerPassword('new_password')}
                        id="new_password"
                        type="password"
                        placeholder="Enter new password"
                        className={`input pl-12 ${passwordErrors.new_password ? 'input-error' : ''}`}
                      />
                    </div>
                    {passwordErrors.new_password && (
                      <p className="mt-2 text-sm text-danger">{passwordErrors.new_password.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirm_password" className="label">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        {...registerPassword('confirm_password')}
                        id="confirm_password"
                        type="password"
                        placeholder="Confirm new password"
                        className={`input pl-12 ${passwordErrors.confirm_password ? 'input-error' : ''}`}
                      />
                    </div>
                    {passwordErrors.confirm_password && (
                      <p className="mt-2 text-sm text-danger">{passwordErrors.confirm_password.message}</p>
                    )}
                  </div>

                  <div className="pt-6 border-t-2 border-border-light">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={passwordMutation.isPending}
                    >
                      <Shield className="w-4 h-4" />
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>

              {/* Account Actions */}
              <div className="card-static bg-white p-8">
                <h2 className="headline-sm mb-2">Account Actions</h2>
                <p className="text-secondary text-sm mb-6">
                  Manage your account preferences and data.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b-2 border-border-light">
                    <div>
                      <h3 className="font-semibold text-primary">Download Your Data</h3>
                      <p className="text-sm text-secondary">Get a copy of all your data</p>
                    </div>
                    <Button variant="secondary" size="sm">
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b-2 border-border-light">
                    <div>
                      <h3 className="font-semibold text-primary">Email Notifications</h3>
                      <p className="text-sm text-secondary">Manage email preferences</p>
                    </div>
                    <Button variant="secondary" size="sm">
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="font-semibold text-danger">Delete Account</h3>
                      <p className="text-sm text-secondary">Permanently delete your account and data</p>
                    </div>
                    <Button variant="danger" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Zap, Shield, Users, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [devLoading, setDevLoading] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  // Quick Development Login (bypass authentication)
  const quickDevLogin = async (role) => {
    console.log('🚀 Quick Dev Login for role:', role);
    setDevLoading(role);

    // Create mock user based on role
    const mockUsers = {
      super_admin: {
        id: 'dev-super-admin',
        email: 'superadmin@dev.com',
        role: 'super_admin',
        name: 'Dev Super Admin',
        clinic_id: null
      },
      clinic_admin: {
        id: 'dev-clinic-admin',
        email: 'clinicadmin@dev.com',
        role: 'clinic_admin',
        name: 'Dev Clinic Admin',
        clinic_id: 'dev-clinic-001'
      },
      patient: {
        id: 'dev-patient',
        email: 'patient@dev.com',
        role: 'patient',
        name: 'Dev Patient',
        clinic_id: 'dev-clinic-001'
      }
    };

    // Simulate login delay
    setTimeout(() => {
      // Store mock user in localStorage (similar to what real auth does)
      const mockUser = mockUsers[role];
      localStorage.setItem('neuro360-auth', JSON.stringify({
        user: mockUser,
        session: { access_token: 'dev-token-' + role }
      }));

      // Navigate based on role
      let redirectPath = '/dashboard';
      switch (role) {
        case 'super_admin':
          redirectPath = '/admin';
          break;
        case 'clinic_admin':
          redirectPath = '/clinic';
          break;
        case 'patient':
          redirectPath = '/patient-dashboard';
          break;
      }

      // For project tracking testing, go directly there
      if (location.state?.from?.pathname === '/project-tracking') {
        redirectPath = '/project-tracking';
      }

      setDevLoading(null);
      window.location.href = redirectPath; // Force refresh to load auth state
    }, 1000);
  };

  const onSubmit = async (data) => {
    console.log('🔥 LoginForm: Form submitted with data:', data);

    try {
      const result = await login(data, 'email');
      console.log('🎯 LoginForm: Login result:', result);

      if (result && result.success) {
        console.log('✅ LoginForm: Login successful, navigating based on user role');

        // Determine redirect path based on user role
        let redirectPath = '/pulseofproject'; // Default to project page
        if (result.user) {
          switch (result.user.role) {
            case 'super_admin':
              redirectPath = '/admin';
              break;
            case 'user':
              // Regular users: Automatically select their first project
              // Fetch user's projects and redirect to first one
              try {
                const { default: userProjectsService } = await import('../../services/userProjectsService');
                const userProjects = await userProjectsService.getUserProjects(result.user.id);

                if (userProjects && userProjects.length > 0) {
                  // Redirect to first assigned project
                  const firstProject = userProjects[0];
                  const frontendId = firstProject.frontendId || firstProject.project_id || 'neurosense-360';
                  redirectPath = `/pulseofproject?project=${frontendId}`;
                  console.log('✅ Auto-selecting first project for user:', frontendId);
                } else {
                  // No projects assigned - show project selector
                  redirectPath = '/pulseofproject';
                  console.log('⚠️ User has no projects assigned');
                }
              } catch (error) {
                console.error('Error fetching user projects:', error);
                redirectPath = '/pulseofproject';
              }
              break;
            case 'clinic_admin':
            case 'clinic':
              redirectPath = '/clinic';
              break;
            case 'patient':
              redirectPath = '/patient-dashboard';
              break;
            default:
              redirectPath = '/pulseofproject'; // Fallback to project page
          }
        }

        // For regular users, don't redirect to /admin even if that's where they came from
        let from = location.state?.from?.pathname || redirectPath;
        if (result.user?.role !== 'super_admin' && from === '/admin') {
          from = redirectPath; // Use the calculated redirectPath
        }

        navigate(from, { replace: true });
      } else {
        console.log('❌ LoginForm: Login failed:', result?.error);
        setError('root', {
          type: 'manual',
          message: result?.error || 'Invalid email or password'
        });
      }
    } catch (error) {
      console.error('🚨 LoginForm: Unexpected error:', error);
      setError('root', {
        type: 'manual',
        message: error?.message || 'Login failed. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="auth-card animate-fade-in-up floating-elements relative z-10">
        <div className="text-center mb-6 sm:mb-8 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-3">Welcome Back</h2>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6 animate-slide-in-right" style={{ animationDelay: '0.6s' }}>
          {errors.root && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake shadow-lg">
              {errors.root.message}
            </div>
          )}

          {/* Email Field */}
          <div className="field-wrapper animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label htmlFor="email" className="field-label">
              Email Address
            </label>
            <div className="relative">
              <Mail className={`input-icon ${errors.email ? 'text-red-400' : ''}`} />
              <input
                id="email"
                type="email"
                className={`auth-input pl-11 ${errors.email ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="field-wrapper animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className="relative">
              <Lock className={`input-icon ${errors.password ? 'text-red-400' : ''}`} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`auth-input pl-11 pr-11 ${errors.password ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-primary-500 transition-colors duration-200 transform hover:scale-110"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center group">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-transform duration-200 group-hover:scale-110"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-200">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-all duration-200 hover:underline hover:underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="auth-button animate-bounce-soft" style={{ animationDelay: '0.4s' }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="animate-pulse">Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-all duration-200 hover:underline hover:underline-offset-4"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Development Mode Quick Login */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg inline-flex">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Development Mode - Quick Login</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => quickDevLogin('super_admin')}
              disabled={devLoading === 'super_admin'}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {devLoading === 'super_admin' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => quickDevLogin('clinic_admin')}
              disabled={devLoading === 'clinic_admin'}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {devLoading === 'clinic_admin' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Clinic Admin</span>
            </button>

            <button
              type="button"
              onClick={() => quickDevLogin('patient')}
              disabled={devLoading === 'patient'}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {devLoading === 'patient' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Patient</span>
            </button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              Click any button above for instant access without credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

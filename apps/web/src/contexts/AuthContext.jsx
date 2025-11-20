import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
// Note: authService removed - using BYPASS_AUTH mode for PulseOfProject
import { createClient } from '@supabase/supabase-js';

// Get Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase configuration
const hasValidSupabaseConfig = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' &&
                               supabaseAnonKey && supabaseAnonKey !== 'placeholder-anon-key';

// Initialize Supabase client only if we have valid config
let supabase = null;

if (hasValidSupabaseConfig) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client initialized successfully');
} else {
  console.warn('⚠️ Supabase not configured in AuthContext. Environment variables missing.');
  console.log('Current environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Present' : 'Missing'
  });
}

// 🚀 DEVELOPMENT MODE: Bypass authentication
// Default to true if environment variable is not set or is undefined
const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH !== 'false'; // Set to 'false' in .env to enable authentication

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // 🚀 Check for quick dev login first (from our login form)
      const devAuth = localStorage.getItem('neuro360-auth');
      if (devAuth) {
        try {
          const { user: devUser } = JSON.parse(devAuth);
          if (devUser && devUser.id && devUser.id.startsWith('dev-')) {
            console.log('🚀 DEVELOPMENT MODE: Quick login user detected');
            setUser(devUser);
            setIsAuthenticated(true);
            setLoading(false);
            console.log('✅ Dev user authenticated:', devUser.name, devUser.role);
            return;
          }
        } catch (e) {
          console.warn('Failed to parse dev auth data');
        }
      }

      // 🚀 DEVELOPMENT MODE: Auto-authenticate with default user
      if (BYPASS_AUTH) {
        console.log('🚀 DEVELOPMENT MODE: Bypassing authentication');

        // Check if user was previously set (from login)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setLoading(false);
            console.log('✅ Development user authenticated from storage:', parsedUser.name, parsedUser.role);
            return;
          } catch (e) {
            console.warn('Failed to parse stored user, using default');
          }
        }

        // Default super admin user if no stored user
        const defaultUser = {
          id: 'super-admin',
          name: 'Super Admin',
          email: 'admin@pulseofproject.com',
          role: 'super_admin',
          profilePicture: null,
          isActivated: true
        };

        setUser(defaultUser);
        setIsAuthenticated(true);
        setLoading(false);
        localStorage.setItem('user', JSON.stringify(defaultUser));
        console.log('✅ Development user authenticated:', defaultUser.name, defaultUser.role);
        return;
      }

      // Check Supabase session only if client is available
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Get user profile from users table (not profiles)
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: userProfile?.full_name || session.user.user_metadata?.full_name || 'User',
          role: userProfile?.role || 'user', // Use actual role from database
          avatar: userProfile?.avatar_url,
          isActivated: userProfile?.is_active !== false
        };

        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ User authenticated from Supabase session:', userData.name, userData.role);
      } else {
        console.log('❌ No active session found');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, method = 'email') => {
    console.log('🚀 AuthContext: Starting login process');

    // 🚀 DEVELOPMENT MODE: Auto-succeed login
    if (BYPASS_AUTH) {
      console.log('🚀 DEVELOPMENT MODE: Bypassing login authentication');
      setLoading(true);

      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500));

      // Only super_admin role allowed
      const email = credentials.email || 'admin@pulseofproject.com';
      const userName = 'Super Admin';

      const defaultUser = {
        id: `super-admin-${Date.now()}`,
        name: userName,
        email: email,
        role: 'super_admin',
        profilePicture: null,
        isActivated: true
      };

      setUser(defaultUser);
      setIsAuthenticated(true);
      setLoading(false);
      localStorage.setItem('user', JSON.stringify(defaultUser));
      localStorage.setItem('authToken', 'dev-bypass-token');

      toast.success(`🚀 Development mode login as ${defaultUser.role}!`);
      console.log('✅ Development login successful:', defaultUser.name, defaultUser.role);

      return {
        success: true,
        user: defaultUser,
        message: 'Development mode login successful'
      };
    }

    try {
      setLoading(true);

      console.log('📧 Login method:', method);
      console.log('📝 Credentials:', { email: credentials.email, hasPassword: !!credentials.password });

      // Check if Supabase client is available
      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your configuration.');
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed. No user data received.');
      }

      // Get user profile from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.warn('User profile not found in database');
        throw new Error('User profile not found. Please contact administrator.');
      }

      // Get actual role from database (no hardcoded super_admin)
      const userRole = userProfile?.role || 'user';

      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: userProfile?.full_name || data.user.user_metadata?.full_name || 'User',
        role: userRole, // Use actual role from database
        avatar: userProfile?.avatar_url,
        isActivated: userProfile?.is_active !== false
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success('Login successful!');
      console.log('✅ Login successful:', userData.name, userData.role);

      return {
        success: true,
        user: userData,
        message: 'Login successful'
      };

    } catch (error) {
      console.error('🚨 AuthContext: Login failed:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, method = 'email') => {
    console.log('🚀 AuthContext: Starting registration process');

    // 🚀 DEVELOPMENT MODE: Auto-succeed registration
    if (BYPASS_AUTH) {
      console.log('🚀 DEVELOPMENT MODE: Bypassing registration authentication');
      setLoading(true);

      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 800));

      const defaultUser = {
        id: 'super-admin-' + Date.now(),
        name: userData.name || 'Super Admin',
        email: userData.email || 'admin@pulseofproject.com',
        role: 'super_admin',
        profilePicture: null,
        isActivated: true
      };

      setUser(defaultUser);
      setIsAuthenticated(true);
      setLoading(false);
      localStorage.setItem('user', JSON.stringify(defaultUser));
      localStorage.setItem('authToken', 'dev-bypass-token');

      toast.success('🚀 Development mode registration successful!');
      console.log('✅ Development registration successful:', defaultUser.name, defaultUser.role);

      return {
        success: true,
        user: defaultUser,
        message: 'Development mode registration successful'
      };
    }

    try {
      setLoading(true);

      console.log('📧 Registration method:', method);
      console.log('📝 User data:', {
        name: userData.name,
        email: userData.email,
        userType: userData.userType,
        hasPassword: !!userData.password,
        hasConfirmPassword: !!userData.confirmPassword
      });

      // Production authentication disabled - using BYPASS_AUTH mode
      throw new Error('Production registration not configured. Please enable VITE_BYPASS_AUTH in .env');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');

      // Sign out from Supabase if client is available
      if (supabase && !BYPASS_AUTH) {
        await supabase.auth.signOut();
        console.log('✅ Signed out from Supabase');
      }

      // Clear all authentication data
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoToken');
        localStorage.removeItem('neuro360-auth'); // Clear dev quick login

        // Clear all cached data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('dbCache_') ||
              key.startsWith('project_')) {
            localStorage.removeItem(key);
          }
        });
      }

      // Clear state
      setUser(null);
      setIsAuthenticated(false);

      toast.success('Logged out successfully');
      console.log('✅ Logout successful, redirecting to landing page');

      // Redirect to landing page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);

      // Still clear local state even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoToken');

        // Clear all cached data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('dbCache_') ||
              key.startsWith('project_')) {
            localStorage.removeItem(key);
          }
        });
      }

      setUser(null);
      setIsAuthenticated(false);

      // Still redirect to landing page
      window.location.href = '/';
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      // authService removed - password reset not available in bypass mode
      toast('Password reset not configured. Using development mode.');
      return { success: false, error: 'Not configured' };
    } catch (error) {
      console.error('Forgot password failed:', error);
      toast.error(error.message || 'Failed to send reset email');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      // authService removed - password reset not available in bypass mode
      toast('Password reset not configured. Using development mode.');
      return { success: false, error: 'Not configured' };
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.error(error.message || 'Password reset failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      setLoading(true);
      console.log('🔄 Updating user profile:', userData);
      
      // Update local state immediately for better UX
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Database save disabled in BYPASS_AUTH mode
      console.log('✅ User profile updated in local storage (database save skipped)');
      
      toast.success('Profile updated successfully!');
      console.log('✅ Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.message || 'Failed to update profile');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

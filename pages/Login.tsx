
import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle, RefreshCcw } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginWithEmail, signupWithEmail, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLoginMode) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
      // Auth state change in context will handle the user update
      navigate('/profile');
    } catch (err: any) {
      console.error(err);
      handleAuthErrors(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: any) {
      console.error(err);
      handleAuthErrors(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthErrors = (err: any) => {
      // Map Firebase errors to user friendly messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Action failed. Please try again.');
      }
  };

  const resetForm = () => {
      setError(null);
      setIsResetMode(false);
      setResetSent(false);
      setIsLoginMode(true);
  };

  // --- Reset Password View ---
  if (isResetMode) {
    return (
      <div className="w-full h-full flex flex-col bg-white px-8 text-black overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto py-10">
          <div className="flex flex-col items-center mb-8">
            <button 
              onClick={resetForm}
              className="absolute top-6 left-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="bg-blue-50 p-3 rounded-2xl mb-6">
              <Lock size={32} className="text-blue-500" />
            </div>
            
            <h1 className="text-2xl font-black text-center mb-2 tracking-tight">
              {resetSent ? 'Check your email' : 'Reset Password'}
            </h1>
            <p className="text-center text-gray-400 text-sm px-4">
              {resetSent 
                ? `We've sent password reset instructions to ${email}`
                : 'Enter your email address and we will send you a link to reset your password.'
              }
            </p>
          </div>

          {resetSent ? (
            <div className="space-y-4">
               <div className="flex justify-center mb-4">
                 <CheckCircle size={48} className="text-green-500" />
               </div>
               <button 
                onClick={resetForm}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all"
               >
                 Back to Log In
               </button>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
               {error && (
                <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg text-center border border-red-100 break-words">
                  {error}
                </div>
              )}
              
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-gray-50 border border-gray-200 text-black text-sm rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:border-pink-500 focus:bg-white transition-colors"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#fe2c55] hover:bg-[#e6264c] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-pink-500/20 active:scale-[0.98] flex items-center justify-center mt-2"
              >
                 {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : (
                    'Send Reset Link'
                 )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- Login / Signup View ---
  return (
    <div className="w-full h-full flex flex-col bg-white px-8 text-black overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto py-10">
        
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
           <div className="bg-[#fe2c55] p-3 rounded-2xl rotate-3 shadow-lg mb-6 relative group">
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm group-hover:rotate-180 transition-transform duration-500">
                <RefreshCcw size={14} className="text-[#fe2c55]" />
              </div>
              <h1 className="text-3xl font-black text-white italic">
                RG
              </h1>
           </div>
           <h1 className="text-2xl font-black text-center mb-2 tracking-tight">
             {isLoginMode ? 'Welcome back' : 'Create account'}
           </h1>
           <p className="text-center text-gray-400 text-sm">
             {isLoginMode 
               ? 'Log in to continue your Replaygram journey.' 
               : 'Join Replaygram to start your interactive story.'}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg text-center border border-red-100 break-words">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail size={18} />
            </div>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-gray-50 border border-gray-200 text-black text-sm rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:border-pink-500 focus:bg-white transition-colors"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-gray-50 border border-gray-200 text-black text-sm rounded-xl py-3.5 pl-10 pr-10 focus:outline-none focus:border-pink-500 focus:bg-white transition-colors"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Forgot Password Link (Login Mode Only) */}
          {isLoginMode && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => {
                   setError(null);
                   setIsResetMode(true);
                }}
                className="text-xs font-semibold text-gray-500 hover:text-black"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Terms and Conditions (Signup Mode Only) */}
          {!isLoginMode && (
            <div className="text-[11px] text-gray-400 text-center leading-normal px-2 py-1">
              By registering, you accept our{' '}
              <a href="#" className="underline font-semibold hover:text-black transition-colors">Terms and Conditions</a>,{' '}
              <a href="#" className="underline font-semibold hover:text-black transition-colors">Privacy Policy</a> and{' '}
              <a href="#" className="underline font-semibold hover:text-black transition-colors">Cookie Policy</a>.
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#fe2c55] hover:bg-[#e6264c] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-pink-500/20 active:scale-[0.98] flex items-center justify-center mt-2"
          >
             {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : (
                isLoginMode ? 'Log In' : 'Sign Up'
             )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError(null);
                // We keep email if they typed it, but clear password
                setPassword('');
              }}
              className="text-[#fe2c55] font-bold hover:underline"
            >
              {isLoginMode ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

      </div>
      
      {/* Footer */}
      <div className="py-6 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

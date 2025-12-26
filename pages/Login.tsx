import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login();
      // Auth state change in context will handle the user update
      // We just navigate on success
      navigate('/profile');
    } catch (err: any) {
      console.error(err);
      // Display friendly error message
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else if (err.code === 'auth/configuration-not-found') {
        setError('Firebase config missing. Check services/firebaseConfig.ts');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white px-8 text-black overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto py-10">
        
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-10">
           <div className="bg-[#fe2c55] p-3 rounded-2xl rotate-3 shadow-lg mb-6">
              <h1 className="text-3xl font-black text-white italic">
                TB
              </h1>
           </div>
           <h1 className="text-2xl font-black text-center mb-2 tracking-tight">
             Log in to TokBranch
           </h1>
           <p className="text-center text-gray-400 text-sm">
             Manage your account, check notifications, comment on videos, and more.
           </p>
        </div>

        <div className="space-y-4">
          
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 relative shadow-sm active:scale-[0.98]"
          >
             {loading ? (
                <div className="w-5 h-5 border-2 border-gray-200 border-t-pink-500 rounded-full animate-spin"></div>
             ) : (
                <>
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
                 <span>Continue with Google</span>
                </>
             )}
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
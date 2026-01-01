import React, { useState } from 'react';
import { ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../services/authContext';

export const MyAccount: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserPassword } = useAuth();
  
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPass !== confirmPass) {
      setError("New passwords do not match.");
      return;
    }

    if (newPass.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await updateUserPassword(oldPass, newPass);
      setSuccess(true);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Current password is incorrect.');
      } else if (err.code === 'auth/weak-password') {
        setError('New password is too weak.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Failed to update password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-black" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg mr-8">Change Password</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Lock size={32} className="text-[#fe2c55]" />
          </div>
          <p className="text-center text-gray-500 text-sm px-8">
            Create a strong password to keep your account secure.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg text-center border border-red-100 break-words">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 text-xs p-3 rounded-lg text-center border border-green-100 break-words font-semibold">
              Password updated successfully!
            </div>
          )}

          <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-4 shadow-sm">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">Current Password</label>
              <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-3 text-black focus:outline-none focus:border-pink-500 transition-colors text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">New Password</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-3 text-black focus:outline-none focus:border-pink-500 transition-colors text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-3 text-black focus:outline-none focus:border-pink-500 transition-colors text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#fe2c55] text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] shadow-md shadow-pink-500/20 hover:bg-[#e6264c] mt-4 flex items-center justify-center"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
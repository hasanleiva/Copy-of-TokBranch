import React from 'react';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router';
import { User, CreditCard, ShieldCheck, LogOut, Bell, Heart, ChevronRight, AlertTriangle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Safe fallback for username
  const username = user?.email.split('@')[0] || 'User';
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto pb-20">
      <div className="p-4 space-y-6">
        
        {/* Header Card */}
        <div className="w-full bg-[#fe2c55] rounded-2xl p-6 shadow-lg shadow-pink-500/20 text-white flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-white/30 overflow-hidden bg-white/10 shrink-0">
             <img 
               src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
               alt="Avatar" 
               className="w-full h-full object-cover"
             />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{displayName}</h1>
            <p className="text-white/80 text-sm truncate">@{username}</p>
          </div>
        </div>

        {/* Settings Section 1 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div onClick={() => navigate('/profile/account')} className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <User size={20} />
            </div>
            <div className="flex-1 ml-4 mr-2">
              <h3 className="font-bold text-sm text-gray-900">My Account</h3>
              <p className="text-xs text-gray-400">Make changes to your account</p>
            </div>
            <div className="text-red-500 mr-2">
               <AlertTriangle size={16} fill="currentColor" className="text-red-500/20" strokeWidth={2.5} />
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </div>

          <div className="h-[1px] bg-gray-100 mx-4" />

          <div onClick={() => navigate('/profile/subscriptions')} className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <CreditCard size={20} />
            </div>
            <div className="flex-1 ml-4 mr-2">
              <h3 className="font-bold text-sm text-gray-900">Subscriptions</h3>
              <p className="text-xs text-gray-400">Manage your subscriptions</p>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </div>

          <div className="h-[1px] bg-gray-100 mx-4" />

          <div className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="flex-1 ml-4 mr-2">
              <h3 className="font-bold text-sm text-gray-900">Two-Factor Authentication</h3>
              <p className="text-xs text-gray-400">Further secure your account for safety</p>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </div>

          <div className="h-[1px] bg-gray-100 mx-4" />

          <div onClick={handleLogout} className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
              <LogOut size={20} className="ml-0.5" />
            </div>
            <div className="flex-1 ml-4 mr-2">
              <h3 className="font-bold text-sm text-gray-900">Log out</h3>
              <p className="text-xs text-gray-400">Further secure your account for safety</p>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </div>

        </div>

        {/* More Section */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3 px-1">More</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            <div className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Bell size={20} />
              </div>
              <div className="flex-1 ml-4 mr-2">
                <h3 className="font-bold text-sm text-gray-900">Help & Support</h3>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </div>

            <div className="h-[1px] bg-gray-100 mx-4" />

            <div className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Heart size={20} />
              </div>
              <div className="flex-1 ml-4 mr-2">
                <h3 className="font-bold text-sm text-gray-900">About App</h3>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
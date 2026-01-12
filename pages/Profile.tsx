
import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router';
import { User, CreditCard, LogOut, Bell, Heart, ChevronRight, AlertTriangle, X } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Safe fallback for username
  const username = user?.email.split('@')[0] || 'User';
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto pb-20 relative">
      <div className="p-4 space-y-6">
        
        {/* Header Card */}
        <div className="w-full bg-[#fe2c55] rounded-2xl p-6 shadow-lg shadow-pink-500/20 text-white flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-white/30 overflow-hidden bg-white/10 shrink-0">
             <img 
               src="https://my-replaygram.b-cdn.net/avatar.png" 
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

          <div onClick={handleLogout} className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
              <LogOut size={20} className="ml-0.5" />
            </div>
            <div className="flex-1 ml-4 mr-2">
              <h3 className="font-bold text-sm text-gray-900">Log out</h3>
              <p className="text-xs text-gray-400">Securely sign out of your session</p>
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

            <div 
              onClick={() => setShowAboutModal(true)}
              className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
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

      {/* About App Modal Popup */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-pink-50 text-[#fe2c55] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Heart size={32} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-black mb-4 tracking-tight text-gray-900">About Replaygram</h2>
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>
                  Replaygram is a next-generation interactive video platform designed for storytelling that puts you in the driver's seat. 
                </p>
                <p>
                  Explore immersive branching narratives where every choice matters. Whether you're exploring mysterious forests or urban landscapes, the story evolves based on your interactions.
                </p>
                <div className="pt-4 border-t border-gray-100 w-full">
                  <p className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Version 1.2.4 (Alpha)</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowAboutModal(false)}
                className="mt-8 w-full bg-[#fe2c55] text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

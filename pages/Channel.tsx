import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { VideoService } from '../services/mockData';
import { UserProfile } from '../types';
import { ChevronLeft, MoreHorizontal, ChevronDown, Grid, Heart, Play } from 'lucide-react';

export const Channel: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'likes'>('videos');

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await VideoService.getUserProfile(userId);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  if (loading || !profile) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white text-black flex flex-col">
      {/* Fixed Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={28} strokeWidth={1.5} />
        </button>
        {/* Title hidden initially like native app, could show on scroll */}
        <div className="font-bold text-base opacity-0">{profile.username}</div>
        <button className="p-1 -mr-1 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center pt-2 pb-4">
          
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mb-3 shrink-0 border border-gray-100">
            <img 
              src={profile.avatarUrl} 
              alt={profile.username} 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Username */}
          <h1 className="text-lg font-bold mb-5">@{profile.username}</h1>

          {/* Stats */}
          <div className="flex items-center gap-12 mb-6">
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg leading-none">{profile.followers}</span>
              <span className="text-gray-400 text-[11px] font-medium mt-1">FOLLOWERS</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg leading-none">{profile.likes}</span>
              <span className="text-gray-400 text-[11px] font-medium mt-1">LIKES</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 mb-6 w-full px-12 justify-center">
            <button className="bg-[#fe2c55] text-white font-bold py-3 px-12 rounded-md text-sm active:scale-95 transition-transform shadow-sm min-w-[160px]">
              Follow
            </button>
            <button className="w-11 h-11 border border-gray-200 rounded-md flex items-center justify-center active:bg-gray-50 transition-colors bg-white">
              <ChevronDown size={20} className="text-black" />
            </button>
          </div>

          {/* Bio */}
          <div className="text-center px-8 mb-2">
            <p className="font-semibold text-sm uppercase tracking-wide text-gray-900">{profile.bio}</p>
          </div>
        </div>

        {/* Sticky Tabs */}
        <div className="sticky top-0 bg-white z-10 flex border-t border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('videos')}
            className={`flex-1 py-3 flex items-center justify-center transition-colors relative ${activeTab === 'videos' ? 'text-black' : 'text-gray-300'}`}
          >
            <Grid size={20} strokeWidth={activeTab === 'videos' ? 2.5 : 2} />
            {activeTab === 'videos' && <div className="absolute bottom-0 w-8 h-0.5 bg-black" />}
          </button>
          <button 
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-3 flex items-center justify-center transition-colors relative ${activeTab === 'likes' ? 'text-black' : 'text-gray-300'}`}
          >
            <Heart size={20} strokeWidth={activeTab === 'likes' ? 2.5 : 2} />
             {activeTab === 'likes' && <div className="absolute bottom-0 w-8 h-0.5 bg-black" />}
          </button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-3 gap-[1px] bg-white pb-20">
          {profile.videos.map((video) => (
            <div 
              key={video.id} 
              className="aspect-[3/4] relative bg-gray-100 cursor-pointer overflow-hidden group"
            >
              <img 
                src={video.thumbnailUrl} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="absolute bottom-1 left-2 flex items-center gap-1 text-white drop-shadow-md">
                <Play size={12} fill="white" className="stroke-none" />
                <span className="text-xs font-bold">{video.views}</span>
              </div>
            </div>
          ))}
          {/* Empty state if no videos */}
          {profile.videos.length === 0 && (
             <div className="col-span-3 py-10 text-center text-gray-400 text-sm">
                No videos yet.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
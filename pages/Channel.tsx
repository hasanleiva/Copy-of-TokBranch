
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { VideoService } from '../services/mockData';
import { UserProfile } from '../types';
import { ChevronLeft, MoreHorizontal, Grid, Play } from 'lucide-react';

export const Channel: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="w-8 h-8 border-4 border-[#fe2c55] border-t-transparent rounded-full animate-spin"></div>
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
        <div className="font-bold text-base opacity-0">{profile.username}</div>
        <button className="p-1 -mr-1 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center pt-2 pb-4">
          
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mb-3 shrink-0 border border-gray-100 shadow-sm">
            <img 
              src={profile.avatarUrl} 
              alt={profile.username} 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Username */}
          <h1 className="text-lg font-bold mb-4">@{profile.username}</h1>

          {/* Bio */}
          <div className="text-center px-8 mb-6">
            <p className="font-semibold text-sm uppercase tracking-wide text-gray-900">{profile.bio}</p>
          </div>
        </div>

        {/* Static Tab indicator (Only Grid) */}
        <div className="sticky top-0 bg-white z-10 flex border-t border-b border-gray-100">
          <div className="flex-1 py-3 flex items-center justify-center text-black relative">
            <Grid size={20} strokeWidth={2.5} />
            <div className="absolute bottom-0 w-8 h-0.5 bg-black" />
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-3 gap-[1px] bg-white pb-20">
          {profile.videos.map((video) => (
            <div 
              key={video.id} 
              className="aspect-[3/4] relative bg-gray-100 cursor-pointer overflow-hidden group"
              onClick={() => navigate(`/explore/${video.id}`)}
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

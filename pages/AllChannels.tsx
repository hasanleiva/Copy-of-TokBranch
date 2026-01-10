
import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { VideoService } from '../services/mockData';
import { UserProfile } from '../types';

export const AllChannels: React.FC = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Partial<UserProfile>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      try {
        const data = await VideoService.getChannels();
        setChannels(data);
      } catch (e) {
        console.error("Error fetching all channels:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  return (
    <div className="w-full h-full bg-white text-black flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-4 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={28} className="text-black" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold mr-8">All Channels</h1>
      </div>

      {/* Channel List Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20 no-scrollbar">
        {loading ? (
          <div className="flex justify-center mt-10 text-gray-500">
            <div className="w-8 h-8 border-4 border-[#fe2c55] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {channels.map((channel) => (
              <div 
                key={channel.id}
                onClick={() => navigate(`/channel/@${channel.username}`)}
                className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-100 rounded-2xl cursor-pointer active:scale-[0.98] transition-all hover:shadow-sm"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border border-gray-100 shrink-0">
                  <img 
                    src={channel.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.username}`} 
                    alt={channel.username} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-black truncate">@{channel.username}</p>
                  <p className="text-xs text-gray-500">{channel.followers || '0'} followers</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle follow logic here
                  }}
                  className="bg-[#fe2c55] text-white px-5 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform shadow-sm"
                >
                  Follow
                </button>
              </div>
            ))}
            {channels.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                No channels found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

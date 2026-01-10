
import React, { useEffect, useState } from 'react';
import { Search, Eye, X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import { VideoService } from '../services/mockData';
import { VideoData, UserProfile } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  
  // Dashboard Data
  const [topVideos, setTopVideos] = useState<VideoData[]>([]);
  const [newVideos, setNewVideos] = useState<VideoData[]>([]);
  const [channels, setChannels] = useState<Partial<UserProfile>[]>([]);
  
  // Search Data
  const [searchResults, setSearchResults] = useState<Partial<UserProfile>[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const top = await VideoService.getTopVideos();
        const newVids = await VideoService.getNewVideos();
        const creators = await VideoService.getChannels();
        setTopVideos(top);
        setNewVideos(newVids);
        setChannels(creators);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim()) {
      try {
        const found = await VideoService.searchChannels(val);
        setSearchResults(found);
      } catch (e) {
        console.error(e);
      }
    } else {
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
  };

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center bg-white text-black">Loading...</div>;
  }

  return (
    <div className="w-full h-full bg-white text-black flex flex-col overflow-y-auto pb-20 no-scrollbar">
      {/* Header: Search Bar & Notification */}
      <div className="sticky top-0 z-20 bg-white px-4 py-3 flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search channels..."
            className="w-full bg-gray-100 border border-transparent rounded-full py-2.5 pl-10 pr-10 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white border-2 transition-all"
          />
          {query && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button className="p-2 text-black hover:bg-gray-100 rounded-full active:scale-95 transition-all">
          <Bell size={22} />
        </button>
      </div>

      {/* Conditional Rendering: Search Results vs Dashboard */}
      {query ? (
        <div className="px-4 mt-2">
           <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Search Results</h2>
           {searchResults.length > 0 ? (
             <div className="space-y-4">
               {searchResults.map((channel) => (
                 <div 
                   key={channel.id}
                   onClick={() => navigate(`/channel/@${channel.username}`)}
                   className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer active:scale-[0.98] transition-all hover:shadow-sm"
                 >
                   <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-200">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.username}`} alt="" className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                     <p className="font-bold text-sm text-black">@{channel.username}</p>
                     <p className="text-xs text-gray-500">{channel.followers} followers</p>
                   </div>
                   <button className="bg-[#fe2c55] text-white px-4 py-1.5 rounded-full text-xs font-bold">
                     View
                   </button>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-10 text-gray-500 text-sm">
               No channels found matching "{query}"
             </div>
           )}
        </div>
      ) : (
        <>
          {/* Channels to Follow Section */}
          <div className="mt-2 mb-2">
            <div className="flex items-center justify-between px-4 mb-2">
              <h2 className="text-base font-bold text-black">Channels to Follow</h2>
              <button 
                onClick={() => navigate('/all-channels')}
                className="text-xs text-gray-500 hover:text-black font-medium"
              >
                View all
              </button>
            </div>
            
            <div className="flex overflow-x-auto px-4 gap-4 no-scrollbar pb-2">
              {channels.map((channel, idx) => (
                <div key={idx} className="flex-none w-[80px] flex flex-col items-center cursor-pointer" onClick={() => navigate(`/channel/@${channel.username}`)}>
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 hover:border-pink-500 transition-colors mb-1.5 shadow-sm">
                    <img src={channel.avatarUrl} alt={channel.username} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-[11px] font-bold text-center truncate w-full text-gray-800">{channel.username}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* Top Videos Section */}
          <div className="mt-2">
            <div className="flex items-center justify-between px-4 mb-2">
              <h2 className="text-base font-bold text-black">Top Videos</h2>
              <button 
                onClick={() => navigate('/section/top-videos')}
                className="text-xs text-gray-500 hover:text-black font-medium"
              >
                View all
              </button>
            </div>
            
            <div className="flex overflow-x-auto px-4 gap-3 no-scrollbar pb-2">
              {topVideos.map((video, idx) => (
                <div key={idx} className="flex-none w-[130px] group cursor-pointer" onClick={() => navigate(`/explore/${video.id}`)}>
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5 shadow-sm">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[9px] font-bold shadow-black drop-shadow-md bg-black/40 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                      <Eye size={10} /> {video.views}
                    </div>
                  </div>
                  <h3 className="text-xs font-bold truncate leading-tight text-gray-900">{video.title}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* New Videos Section */}
          <div className="mt-4 mb-4">
            <div className="flex items-center justify-between px-4 mb-2">
              <h2 className="text-base font-bold text-black">New Videos</h2>
              <button 
                onClick={() => navigate('/section/new-videos')}
                className="text-xs text-gray-500 hover:text-black font-medium"
              >
                View all
              </button>
            </div>
            
            <div className="flex overflow-x-auto px-4 gap-3 no-scrollbar pb-2">
              {newVideos.map((video, idx) => (
                <div key={idx} className="flex-none w-[130px] group cursor-pointer" onClick={() => navigate(`/explore/${video.id}`)}>
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5 shadow-sm">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[9px] font-bold shadow-black drop-shadow-md bg-black/40 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                      <Eye size={10} /> {video.views}
                    </div>
                  </div>
                  <h3 className="text-xs font-bold truncate leading-tight text-gray-900">{video.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

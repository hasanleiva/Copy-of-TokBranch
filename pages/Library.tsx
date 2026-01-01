import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import { VideoService } from '../services/mockData';
import { VideoData } from '../types';

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const [likedVideos, setLikedVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      setLoading(true);
      try {
        // Mocking user liked videos using "Most Loved" data
        const data = await VideoService.getMostLovedVideos();
        // Duplicate to fill grid for demo
        setLikedVideos([...data, ...data, ...data]); 
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedVideos();
  }, []);

  return (
    <div className="w-full h-full bg-white text-black flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 sticky top-0 bg-white z-10 border-b border-gray-100">
        <h1 className="text-2xl font-bold">My Library</h1>
        <p className="text-xs text-gray-500 mt-1">Videos you liked</p>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20 no-scrollbar">
         {loading ? (
           <div className="flex justify-center mt-10 text-gray-500">Loading...</div>
         ) : (
           <>
             {likedVideos.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p>You haven't liked any videos yet.</p>
               </div>
             ) : (
               <div className="grid grid-cols-3 gap-3">
                 {likedVideos.map((video, idx) => (
                   <div 
                      key={`${video.id}-${idx}`} 
                      className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                      onClick={() => navigate('/explore')}
                    >
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                      
                      {/* Stats */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-bold text-white">
                        <Eye size={12} />
                        <span>{video.views}</span>
                      </div>
                   </div>
                 ))}
               </div>
             )}
           </>
         )}
      </div>
    </div>
  );
};
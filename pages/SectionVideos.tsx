
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Eye } from 'lucide-react';
import { VideoService } from '../services/mockData';
import { VideoData } from '../types';

export const SectionVideos: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);

  // Map URL param to display title
  let title = 'Videos';
  if (type === 'top-videos') title = 'Top Videos';
  else if (type === 'most-loved') title = 'Most Loved';
  else if (type === 'new-videos') title = 'New Videos';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data: VideoData[] = [];
        if (type === 'top-videos') {
           data = await VideoService.getTopVideos();
        } else if (type === 'new-videos') {
           data = await VideoService.getNewVideos();
        } else {
           data = await VideoService.getMostLovedVideos();
        }
        
        // Duplicate data to fill the grid for demo purposes
        setVideos([...data, ...data, ...data]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

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
        <h1 className="flex-1 text-center text-lg font-bold mr-8">{title}</h1>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20 no-scrollbar">
         {loading ? (
           <div className="flex justify-center mt-10 text-gray-500">Loading...</div>
         ) : (
           <div className="grid grid-cols-3 gap-3">
             {videos.map((video, idx) => (
               <div 
                  key={`${video.id}-${idx}`} 
                  className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                  onClick={() => navigate(`/explore/${video.id}`)}
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
      </div>
    </div>
  );
};

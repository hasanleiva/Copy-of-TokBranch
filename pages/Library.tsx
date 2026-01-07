
import React, { useEffect, useState } from 'react';
import { Eye, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { FirestoreService } from '../services/firestoreService';
import { VideoData } from '../types';
import { useAuth } from '../services/authContext';

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likedVideos, setLikedVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLikedVideos([]);
      return;
    }

    const fetchLikedVideos = async () => {
      setLoading(true);
      try {
        // Fetch actual liked videos from Firestore
        const data = await FirestoreService.getUserLikedVideos(user.id);
        setLikedVideos(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedVideos();
  }, [user]);

  if (!user) {
    return (
      <div className="w-full h-full bg-white text-black flex flex-col">
        <div className="px-4 py-4 sticky top-0 bg-white z-10 border-b border-gray-100">
          <h1 className="text-2xl font-bold">My Library</h1>
          <p className="text-xs text-gray-500 mt-1">Videos you liked</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pb-20">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Lock size={32} className="text-gray-300" />
             </div>
             <h2 className="text-lg font-bold mb-2">Sign in to view library</h2>
             <p className="text-gray-500 text-sm mb-8 max-w-xs">
                Log in to see your liked videos and saved collections.
             </p>
             <button 
                onClick={() => navigate('/login')}
                className="bg-[#fe2c55] text-white font-bold py-3 px-12 rounded-full text-sm shadow-md active:scale-95 transition-all hover:bg-[#e6264c]"
             >
                Log in
             </button>
        </div>
      </div>
    );
  }

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
                        <span>{video.views !== '0' ? video.views : 'New'}</span>
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

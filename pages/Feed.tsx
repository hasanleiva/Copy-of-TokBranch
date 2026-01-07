
import React, { useEffect, useState } from 'react';
import { FeedItem } from '../components/FeedItem';
import { VideoService } from '../services/mockData';
import { Loader2 } from 'lucide-react';

export const Feed: React.FC = () => {
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        const ids = await VideoService.getFeedIds();
        setVideoIds(ids);
      } catch (err) {
        console.error("Failed to load feed", err);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-pink-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-black">
      {videoIds.map((id, index) => (
        <div key={`${id}-${index}`} className="w-full h-full">
            <FeedItem 
              videoId={id} 
              isMuted={isMuted} 
              setIsMuted={setIsMuted} 
            />
        </div>
      ))}
      {videoIds.length === 0 && (
         <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
           <p>No interactive stories available yet.</p>
         </div>
      )}
    </div>
  );
};

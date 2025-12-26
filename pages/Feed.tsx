import React, { useEffect, useState } from 'react';
import { FeedItem } from '../components/FeedItem';
import { VideoService } from '../services/mockData';
import { Loader2 } from 'lucide-react';

export const Feed: React.FC = () => {
  const [videoPaths, setVideoPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // Lifted state for mute persistence
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        const paths = await VideoService.getFeedPaths();
        setVideoPaths(paths);
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
      {videoPaths.map((path, index) => (
        <div key={`${path}-${index}`} className="w-full h-full">
            <FeedItem 
              jsonPath={path} 
              isMuted={isMuted} 
              setIsMuted={setIsMuted} 
            />
        </div>
      ))}
      {videoPaths.length === 0 && (
         <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
           <p>No videos available.</p>
         </div>
      )}
    </div>
  );
};
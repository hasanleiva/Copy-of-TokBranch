
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { FeedItem } from '../components/FeedItem';
import { VideoService } from '../services/mockData';
import { Loader2 } from 'lucide-react';

export const Feed: React.FC = () => {
  const { startId } = useParams<{ startId?: string }>();
  // Renamed state to better reflect that we are storing paths
  const [videoPaths, setVideoPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // Lifted state for mute persistence
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        // Fix: Changed getFeedIds() to getFeedPaths() as defined in mockData.ts
        let paths = await VideoService.getFeedPaths();
        
        // If a specific startId is provided, move it to the front of the feed
        if (startId) {
          // Remove startId from current list if it exists to avoid duplicates
          const filtered = paths.filter(path => path !== startId);
          // Add it to the front
          paths = [startId, ...filtered];
        }
        
        setVideoPaths(paths);
      } catch (err) {
        console.error("Failed to load feed", err);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, [startId]);

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
            {/* Fix: Changed videoId prop to jsonPath as expected by FeedItem */}
            <FeedItem 
              jsonPath={path} 
              isMuted={isMuted} 
              setIsMuted={setIsMuted} 
            />
        </div>
      ))}
      {videoPaths.length === 0 && (
         <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
           <p>No interactive stories available yet.</p>
         </div>
      )}
    </div>
  );
};

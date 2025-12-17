import React, { useEffect, useState } from 'react';
import { FeedItem } from '../components/FeedItem';
import { VideoService } from '../services/mockData';
import { Video } from '../types';
import { Loader2 } from 'lucide-react';

export const Feed: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        const feedData = await VideoService.getFeed();
        setVideos(feedData);
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
      <div className="w-full h-full flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-white w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-black">
      {videos.map((video) => (
        // Key is important here. If feed updates, we want stable items.
        // We wrap in a container that forces the full height.
        <div key={video.id} className="w-full h-full">
            <FeedItem initialVideo={video} />
        </div>
      ))}
      {videos.length === 0 && (
         <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
           <p>No videos available.</p>
         </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { Video, BranchOption } from '../types';
import { VideoService } from '../services/mockData';
import { Heart, MessageCircle, Share2, GitBranch } from 'lucide-react';
import { useElementOnScreen } from '../hooks/useIntersectionObserver';

interface FeedItemProps {
  initialVideo: Video;
}

export const FeedItem: React.FC<FeedItemProps> = ({ initialVideo }) => {
  const [containerRef, isVisible] = useElementOnScreen({
    threshold: 0.6, // Video is "active" when 60% visible
  });

  const [currentVideo, setCurrentVideo] = useState<Video>(initialVideo);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset to initial video if the prop changes (unlikely in this infinite scroll, but good practice)
  useEffect(() => {
    setCurrentVideo(initialVideo);
  }, [initialVideo]);

  const handleBranchSelect = async (option: BranchOption) => {
    setIsTransitioning(true);
    // Fetch the target video details
    const nextVideo = await VideoService.getVideoById(option.targetVideoId);
    if (nextVideo) {
      // Dynamic Source Switching in the SAME player
      setCurrentVideo(nextVideo);
    }
    setIsTransitioning(false);
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative snap-start snap-always shrink-0"
    >
      <VideoPlayer 
        src={currentVideo.url} 
        poster={currentVideo.thumbnailUrl}
        isActive={isVisible}
      />

      {/* UI Overlay - Side Actions */}
      <div className="absolute right-2 bottom-32 flex flex-col items-center gap-6 z-20">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-gray-800 rounded-full mb-1 flex items-center justify-center border border-white">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentVideo.uploaderId}`} alt="avatar" className="w-full h-full rounded-full" />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <button className="p-2 bg-transparent text-white drop-shadow-lg transition active:scale-90">
            <Heart size={32} fill={currentVideo.likes > 1000 ? "red" : "transparent"} strokeWidth={1.5} className={currentVideo.likes > 1000 ? "text-red-500" : ""} />
          </button>
          <span className="text-xs font-semibold drop-shadow-md">{currentVideo.likes}</span>
        </div>

        <div className="flex flex-col items-center">
          <button className="p-2 bg-transparent text-white drop-shadow-lg">
            <MessageCircle size={32} strokeWidth={1.5} />
          </button>
          <span className="text-xs font-semibold drop-shadow-md">245</span>
        </div>

        <button className="p-2 bg-transparent text-white drop-shadow-lg">
          <Share2 size={32} strokeWidth={1.5} />
        </button>
      </div>

      {/* UI Overlay - Bottom Info */}
      <div className="absolute bottom-4 left-0 w-full px-4 z-20 pb-20 pointer-events-none">
        <div className="w-[85%] pointer-events-auto">
          <h3 className="text-shadow font-bold text-lg mb-1">@{currentVideo.uploaderId}</h3>
          <p className="text-shadow text-sm text-gray-100 line-clamp-2 mb-2">{currentVideo.description}</p>
          <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 w-fit px-2 py-1 rounded backdrop-blur-sm">
             <GitBranch size={14} />
             <span>Interactive • {currentVideo.branchOptions.length} paths</span>
          </div>
        </div>
      </div>

      {/* Branching Options - The Core Feature */}
      {currentVideo.branchOptions.length > 0 && (
        <div className="absolute bottom-24 left-0 w-full px-4 z-30 pointer-events-none">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pointer-events-auto snap-x">
            {currentVideo.branchOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleBranchSelect(option)}
                className="flex-shrink-0 relative group w-24 h-32 rounded-xl overflow-hidden border-2 border-white/30 hover:border-white transition-all snap-start"
              >
                <img 
                  src={option.thumbnailUrl} 
                  alt={option.label}
                  className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition"
                />
                <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="text-xs font-bold leading-tight text-white">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
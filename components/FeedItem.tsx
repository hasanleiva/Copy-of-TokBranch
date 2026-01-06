import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { VideoPlayer } from './VideoPlayer';
import { VideoData, Branch } from '../types';
import { VideoService } from '../services/mockData';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../services/authContext';
import { Star, Share2, Loader2, Plus, AlertCircle, RefreshCcw } from 'lucide-react';
import { useElementOnScreen } from '../hooks/useIntersectionObserver';

interface FeedItemProps {
  jsonPath: string;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
}

export const FeedItem: React.FC<FeedItemProps> = ({ jsonPath, isMuted, setIsMuted }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [containerRef, isVisible] = useElementOnScreen({
    threshold: 0.6,
  });

  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time stats
  const [isLiked, setIsLiked] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  // Load initial JSON data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await VideoService.fetchVideoData(jsonPath);
      setVideoData(data);
    } catch (e: any) {
      console.error("Error loading video json:", e);
      setError(e.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [jsonPath]);

  // Firestore Integration
  useEffect(() => {
    if (!videoData?.id) return;

    // Check if current user has liked this video
    const checkUserLike = async () => {
      if (user) {
        const liked = await FirestoreService.checkIfLiked(user.id, videoData.id!);
        setIsLiked(liked);
      } else {
        setIsLiked(false);
      }
    };
    checkUserLike();
  }, [videoData?.id, user]);

  // Handle View Counting
  useEffect(() => {
    if (isVisible && !hasViewed && videoData?.id) {
      FirestoreService.incrementView(videoData.id);
      setHasViewed(true);
    }
  }, [isVisible, hasViewed, videoData?.id]);

  const handleBranchSelect = async (branch: Branch) => {
    setLoading(true);
    try {
      const nextData = await VideoService.fetchVideoData(branch.targetJson);
      setVideoData(nextData);
    } catch (e: any) {
      console.error("Error loading branch json:", e);
      // Optional: Show toast error here instead of full screen error
      alert("Could not load next video segment: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!videoData) return;

    // Optimistic update
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);

    try {
      await FirestoreService.toggleLike(user.id, videoData, prevLiked);
    } catch (e) {
      // Revert on error
      setIsLiked(prevLiked);
    }
  };

  const goToChannel = () => {
    if (videoData?.uploaderId) {
      navigate(`/channel/@${videoData.uploaderId}`);
    }
  };

  if (error) {
    return (
      <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center bg-gray-900 snap-start text-white p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-80" />
        <h3 className="text-lg font-bold mb-2">Content Unavailable</h3>
        <p className="text-sm text-gray-400 mb-6 break-all">{error}</p>
        <button 
          onClick={loadData} 
          className="flex items-center gap-2 px-6 py-3 bg-[#fe2c55] rounded-full text-sm font-bold hover:bg-[#e6264c] transition-colors active:scale-95"
        >
          <RefreshCcw size={16} /> Retry
        </button>
      </div>
    );
  }

  if (loading || !videoData) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-gray-900 snap-start">
        <Loader2 className="text-pink-500 animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative snap-start snap-always shrink-0"
    >
      <VideoPlayer 
        src={videoData.mainVideoUrl} 
        poster={videoData.thumbnailUrl}
        isActive={isVisible}
        branches={videoData.branches}
        onBranchSelect={handleBranchSelect}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* UI Overlay - Side Actions */}
      <div className="absolute right-2 bottom-28 flex flex-col items-center gap-5 z-20">
        <div className="relative mb-2">
          <div 
            onClick={goToChannel}
            className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border-2 border-white cursor-pointer active:scale-90 transition-transform overflow-hidden"
          >
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${videoData.uploaderId || 'user'}`} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#fe2c55] text-white rounded-full p-0.5 border border-white">
            <Plus size={12} strokeWidth={4} />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <button 
            onClick={handleLike}
            className="p-1 text-white drop-shadow-lg transition active:scale-90"
          >
            <Star 
              size={36} 
              fill={isLiked ? "#fe2c55" : "transparent"} 
              strokeWidth={1.5} 
              className={isLiked ? "text-[#fe2c55]" : ""} 
            />
          </button>
          {/* Like count removed */}
        </div>

        <div className="flex flex-col items-center">
          <button className="p-1 text-white drop-shadow-lg active:scale-90 transition-transform">
            <Share2 size={36} strokeWidth={1.5} />
          </button>
          <span className="text-xs font-semibold mt-1 text-white">Share</span>
        </div>
      </div>

      {/* UI Overlay - Bottom Info */}
      <div className="absolute bottom-16 left-0 w-full px-4 z-20 pb-4 pointer-events-none">
        <div className="w-[85%] pointer-events-auto">
          <h3 
            onClick={goToChannel}
            className="text-shadow font-bold text-lg mb-1 cursor-pointer hover:underline inline-block text-white"
          >
            @{videoData.uploaderId || 'unknown'}
          </h3>
          <p className="text-shadow text-sm text-white line-clamp-2 mb-2 leading-tight">
            {videoData.description || videoData.title}
          </p>
        </div>
      </div>
    </div>
  );
};
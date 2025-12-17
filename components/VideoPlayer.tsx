import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster: string;
  isActive: boolean; // Determine if we should play based on viewport
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Play/Pause based on external isActive prop and internal manual override
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
      video.currentTime = 0; // Optional: Reset video when scrolled away
    }
  }, [isActive, src]); // Re-run if active state changes or source changes

  // Handle source changing dynamically (The Core Requirement)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load(); // Force reload when src prop changes
      if (isActive) {
        setIsLoading(true); // Set loading until canplay
      }
    }
  }, [src, isActive]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    if (isActive && videoRef.current?.paused) {
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="relative w-full h-full bg-black" onClick={togglePlay}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        loop
        muted={isMuted} // Default muted for autoplay policies
        playsInline
        poster={poster}
        onCanPlay={handleCanPlay}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
        onPause={() => setIsPlaying(false)}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none">
           <Play className="w-16 h-16 text-white/80 fill-white/20" />
        </div>
      )}

      {/* Mute Toggle */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white z-20 hover:bg-black/60 transition"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
};
import React, { useRef, useEffect, useState } from 'react';
import { Play, Volume2, VolumeX, Loader2 } from 'lucide-react';
import Hls from 'hls.js';
import { Branch } from '../types';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  isActive: boolean;
  branches: Branch[];
  onBranchSelect: (branch: Branch) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  poster, 
  isActive, 
  branches,
  onBranchSelect,
  isMuted,
  setIsMuted
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  // Track which branch indexes have already triggered to prevent double-pausing
  const triggeredPauseRef = useRef<Set<number>>(new Set());
  // Track last time to detect loops
  const lastTimeRef = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  // Explicitly track which branches are currently "active" (visible)
  const [activeBranchIndices, setActiveBranchIndices] = useState<Set<number>>(new Set());

  // Reset state when source changes
  useEffect(() => {
    triggeredPauseRef.current.clear();
    lastTimeRef.current = 0;
    setActiveBranchIndices(new Set());
    setCurrentTime(0);
  }, [src]);

  // --- HLS and Native Source Handling ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) setIsLoading(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsSource = src.includes('.m3u8');

    if (isHlsSource && Hls.isSupported()) {
      const hls = new Hls({ 
        startLevel: -1, 
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isActive) {
          video.play().catch(() => {});
        }
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
         if (data.fatal) setIsLoading(false);
      });
      hlsRef.current = hls;
    } else {
      video.src = src;
      video.load();
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [src]);

  // --- Autoplay / Pause Logic based on Scroll ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
      video.currentTime = 0;
      triggeredPauseRef.current.clear();
      lastTimeRef.current = 0;
      setActiveBranchIndices(new Set());
    }
  }, [isActive]);

  // --- Time Update & Branching Logic ---
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    
    // Detect loop: if time went backwards (e.g. from end to 0)
    if (time < lastTimeRef.current) {
       triggeredPauseRef.current.clear();
       setActiveBranchIndices(new Set());
    }
    lastTimeRef.current = time;

    setCurrentTime(time);

    branches.forEach((branch, index) => {
      // Trigger if we hit the time and haven't triggered this branch yet
      if (time >= branch.appearAtSecond && time < branch.appearAtSecond + 0.5) {
        if (!triggeredPauseRef.current.has(index)) {
          triggeredPauseRef.current.add(index);
          
          // Show the button
          setActiveBranchIndices(prev => new Set(prev).add(index));

          if (branch.PauseAtappersecond) {
            videoRef.current?.pause();
            setIsPlaying(false);
            
            // If there's a duration, set a timer to hide buttons and resume
            if (branch.DurationPauseseconds && branch.DurationPauseseconds > 0) {
              setTimeout(() => {
                // Hide this specific branch button
                setActiveBranchIndices(prev => {
                  const next = new Set(prev);
                  next.delete(index);
                  return next;
                });

                // Resume video if it's still paused and this item is active
                if (videoRef.current && videoRef.current.paused && isActive) {
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }, branch.DurationPauseseconds * 1000);
            }
          } else {
            // If it doesn't pause, hide the button automatically after a default window (e.g. 5s)
            setTimeout(() => {
              setActiveBranchIndices(prev => {
                const next = new Set(prev);
                next.delete(index);
                return next;
              });
            }, 5000);
          }
        }
      }
    });
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      // If user manually resumes, hide all active branch buttons immediately
      setActiveBranchIndices(new Set());
      video.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden" onClick={togglePlay}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => {
          if (isPlaying) setIsLoading(true);
        }}
        onPlaying={() => { 
          setIsLoading(false); 
          setIsPlaying(true); 
        }}
        onPause={() => setIsPlaying(false)}
      />

      {/* --- Branching Overlays --- */}
      {branches.map((branch, index) => {
        // Only show if the index is in our active set
        if (!activeBranchIndices.has(index)) return null;

        return (
          <button
            key={`${src}-${index}`}
            onClick={(e) => {
              e.stopPropagation();
              // Hide choices when one is selected
              setActiveBranchIndices(new Set());
              onBranchSelect(branch);
            }}
            style={{
              left: `${branch.labelpositionx}%`,
              top: `${branch.labelpositiony}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-xl border border-white/40 px-6 py-3 rounded-full text-white font-bold text-base shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-in fade-in zoom-in duration-300 hover:bg-white/40 transition-all active:scale-90 z-40 whitespace-nowrap"
          >
            {branch.label}
          </button>
        );
      })}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 pointer-events-none transition-opacity duration-300">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
        </div>
      )}

      {/* Play Icon Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
           <div className="bg-black/40 p-6 rounded-full backdrop-blur-sm">
            <Play className="w-12 h-12 text-white fill-white" />
           </div>
        </div>
      )}

      {/* Mute Toggle */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white z-50 hover:bg-black/60 transition active:scale-90 shadow-lg"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
};
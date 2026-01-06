import { VideoData, UserProfile } from '../types';

// Get the Storage URL from environment variables (e.g., https://my-zone.b-cdn.net)
// If not set, it falls back to local behavior
const BUNNY_STORAGE_URL = (import.meta as any).env?.VITE_BUNNY_STORAGE_URL;

export const VideoService = {
  fetchVideoData: async (path: string): Promise<VideoData> => {
    let fetchUrl = path;

    // Logic to construct the URL:
    // 1. If it's already a full URL (http...), use it.
    // 2. If BUNNY_STORAGE_URL is set, assume the file is in the root of the storage zone.
    // 3. If no env var, use the path as is (local /data/...).
    if (!path.startsWith('http')) {
      if (BUNNY_STORAGE_URL) {
        // Strip any local folder prefixes like "/data/" if the user uploaded files to the root of the bucket
        const fileName = path.split('/').pop(); 
        // Remove leading slash from fileName if it exists (though pop() usually handles it)
        const cleanName = fileName?.startsWith('/') ? fileName.slice(1) : fileName;
        fetchUrl = `${BUNNY_STORAGE_URL}/${cleanName}`;
      }
    }

    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`Failed to load video config at ${fetchUrl}`);
      }
      const data: VideoData = await response.json();
      return data;
    } catch (error) {
      console.error("VideoService Error:", error);
      throw error;
    }
  },

  getFeedPaths: async (): Promise<string[]> => {
    // If using Bunny, we return the filenames. The fetchVideoData will attach the Base URL.
    // If local, we return the relative paths in public folder.
    if (BUNNY_STORAGE_URL) {
      return Promise.resolve(['feed_1.json', 'feed_2.json']);
    }
    return Promise.resolve(['/data/feed_1.json', '/data/feed_2.json']);
  },

  // Generate mock videos for the dashboard - Expanded to include high view count videos
  getTopVideos: async (): Promise<VideoData[]> => {
    return [
      {
        id: 'love1',
        title: 'Motivation Speech',
        likes: 1500000,
        views: '2M',
        thumbnailUrl: 'https://images.unsplash.com/photo-1475721027767-f4242310f17e?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'inspirer'
      },
      {
        id: 'love2',
        title: 'Fashion Week',
        likes: 1200000,
        views: '1.5M',
        thumbnailUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'vogue_style'
      },
      {
        id: 'top1',
        title: 'My Morning Routine',
        likes: 980000,
        views: '1.2M',
        thumbnailUrl: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'lifestyle_guru'
      },
      {
        id: 'love3',
        title: 'DIY Crafts',
        likes: 900000,
        views: '1.1M',
        thumbnailUrl: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'crafter'
      },
      {
        id: 'love4',
        title: 'Travel Vlog: Japan',
        likes: 880000,
        views: '1M',
        thumbnailUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'traveler'
      },
      {
        id: 'top2',
        title: 'Extreme Fitness',
        likes: 850000,
        views: '980K',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'fit_pro'
      },
      {
        id: 'top3',
        title: 'Cooking Masterclass',
        likes: 720000,
        views: '850K',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'chef_john'
      }
    ];
  },

  getNewVideos: async (): Promise<VideoData[]> => {
    return [
      {
        id: 'new1',
        title: 'Hidden Gems',
        likes: 2300,
        views: '5.4K',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'travel_bug'
      },
      {
        id: 'new2',
        title: 'Skate Tricks',
        likes: 1200,
        views: '3.2K',
        thumbnailUrl: 'https://images.unsplash.com/photo-1520045864906-820551b7142d?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'skater_boy'
      },
       {
        id: 'new3',
        title: 'Pottery Making',
        likes: 4500,
        views: '8.1K',
        thumbnailUrl: 'https://images.unsplash.com/photo-1565193566173-03a30c718527?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'artisan_hands'
      },
       {
        id: 'new4',
        title: 'Cyberpunk City',
        likes: 8900,
        views: '15K',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'future_vision'
      },
       {
        id: 'new5',
        title: 'Forest Rain',
        likes: 3100,
        views: '6K',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'nature_sounds'
      },
       {
        id: 'new6',
        title: 'Late Night Drive',
        likes: 2100,
        views: '4.5K',
        thumbnailUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'night_rider'
      }
    ];
  },

  getMostLovedVideos: async (): Promise<VideoData[]> => {
    return [
      {
        id: 'love1',
        title: 'Motivation Speech',
        likes: 1500000,
        views: '2M',
        thumbnailUrl: 'https://images.unsplash.com/photo-1475721027767-f4242310f17e?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'inspirer'
      },
      {
        id: 'love2',
        title: 'Fashion Week',
        likes: 1200000,
        views: '1.5M',
        thumbnailUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'vogue_style'
      },
      {
        id: 'love3',
        title: 'DIY Crafts',
        likes: 900000,
        views: '1.1M',
        thumbnailUrl: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'crafter'
      },
      {
        id: 'love4',
        title: 'Travel Vlog: Japan',
        likes: 880000,
        views: '1M',
        thumbnailUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
        mainVideoUrl: '',
        branches: [],
        uploaderId: 'traveler'
      }
    ];
  },

  getChannels: async (): Promise<Partial<UserProfile>[]> => {
    return [
      { id: '1', username: 'Jenny Wilson', followers: '1.9M', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jenny' },
      { id: '2', username: 'Lisa Alenaes', followers: '500K', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
      { id: '3', username: 'Guy Hawkins', followers: '2.1M', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guy' },
      { id: '4', username: 'Robert Fox', followers: '800K', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert' },
    ];
  },

  getUserProfile: async (username: string): Promise<UserProfile> => {
    const targetUsername = username.replace('@', '');
    
    // Scan feed paths to find videos belonging to this user
    const feedPaths = await VideoService.getFeedPaths();
    const matchedVideos: VideoData[] = [];

    for (const path of feedPaths) {
      try {
        const video = await VideoService.fetchVideoData(path);
        // loose match to handle potential case differences or missing fields in mock data
        if (video.uploaderId === targetUsername) {
          // Ensure display fields exist
          const videoForGrid = {
            ...video,
            // Use existing ID or fallback to path
            id: video.id || path,
            // Add a mock view count if missing from JSON
            views: video.views || (Math.floor(Math.random() * 900) + 100 + 'K') 
          };
          matchedVideos.push(videoForGrid);
        }
      } catch (err) {
        console.warn(`Could not load ${path} for profile scanning.`);
      }
    }

    return Promise.resolve({
      id: `user_${targetUsername}`,
      username: targetUsername,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUsername}`,
      followers: '1.9K',
      likes: '46K',
      bio: 'NEVER LOSE HOPE',
      additionalInfo: 'Additional profile information',
      videos: matchedVideos
    });
  },

  searchChannels: async (query: string): Promise<Partial<UserProfile>[]> => {
    const channels = [
      { id: '1', username: 'narrative_explorer', followers: '1.9K' },
      { id: '2', username: 'scifi_fan', followers: '12K' },
      { id: '3', username: 'adventure_seeker', followers: '500' },
      { id: '4', username: 'nature_lover', followers: '5.2K' },
      { id: '5', username: 'tech_guru', followers: '1.1M' },
    ];
    return Promise.resolve(
      channels.filter(c => c.username.toLowerCase().includes(query.toLowerCase()))
    );
  },

  uploadVideo: async (data: any): Promise<void> => {
     console.log("Mock Upload:", data);
     return Promise.resolve();
  }
};
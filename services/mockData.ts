
import { VideoData, UserProfile } from '../types';
import { FirestoreService } from './firestoreService';

// Hardcoded Storage URL (Bunny CDN)
const BUNNY_STORAGE_URL = "https://my-replaygram.b-cdn.net";

// STATIC DATA FOR SEEDING (Backup)
const MOCK_DB_SEED = [
  {
    id: 'love1',
    title: 'Motivation Speech',
    likes: 1500000,
    numericViews: 777777,
    thumbnailUrl: 'https://images.unsplash.com/photo-1475721027767-f4242310f17e?auto=format&fit=crop&q=80&w=800',
    uploaderId: 'inspirer',
    daysAgo: 10,
    jsonName: 'feed_1.json'
  },
  {
    id: 'love2',
    title: 'Fashion Week',
    likes: 1200000,
    numericViews: 1500000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800',
    uploaderId: 'vogue_style',
    daysAgo: 12,
    jsonName: 'feed_2.json'
  },
  {
    id: 'new1',
    title: 'Hidden Gems',
    likes: 2300,
    numericViews: 5400,
    thumbnailUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=800',
    uploaderId: 'travel_bug',
    daysAgo: 0,
    jsonName: 'feed_1.json'
  },
  {
    id: 'new2',
    title: 'Skate Tricks',
    likes: 1200,
    numericViews: 3200,
    thumbnailUrl: 'https://images.unsplash.com/photo-1520045864906-820551b7142d?auto=format&fit=crop&q=80&w=800',
    uploaderId: 'skater_boy',
    daysAgo: 1,
    jsonName: 'feed_2.json'
  },
  {
    id: 'top1',
    title: 'My Morning Routine',
    likes: 980000,
    numericViews: 1200000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=800',
    uploaderId: 'lifestyle_guru',
    daysAgo: 15,
    jsonName: 'feed_1.json'
  },
  {
    id: 'top2',
    title: 'Extreme Fitness',
    likes: 850000,
    numericViews: 980000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    uploaderId: 'fit_pro',
    daysAgo: 8,
    jsonName: 'feed_2.json'
  }
];

// Shuffle helper
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const VideoService = {
  fetchVideoData: async (pathOrId: string): Promise<VideoData> => {
    const baseUrl = BUNNY_STORAGE_URL.replace(/\/+$/, '');
    let jsonFilename = pathOrId;
    let explicitId: string | null = null;

    // Resolve Firestore ID to JSON filename
    if (!pathOrId.endsWith('.json')) {
      const doc = await FirestoreService.getVideoById(pathOrId);
      if (doc && doc.jsonName) {
        jsonFilename = doc.jsonName;
        explicitId = pathOrId;
      } else {
        throw new Error(`Video ID ${pathOrId} not found in Firestore metadata.`);
      }
    }

    const cleanFilename = jsonFilename.split('/').pop()?.replace(/^\/+/, '') || '';
    const fetchUrl = `${baseUrl}/${cleanFilename}`;

    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      
      const data: VideoData = await response.json();

      // Enforce the Firestore document ID to prevent 'feed_1' duplicates
      if (explicitId) {
        data.id = explicitId;
      }

      // Resolve relative URLs to CDN
      if (data.mainVideoUrl && !data.mainVideoUrl.startsWith('http')) {
         data.mainVideoUrl = `${baseUrl}/${data.mainVideoUrl.replace(/^\/+/, '')}`;
      }
      
      if (data.branches) {
        data.branches.forEach(b => {
           if (b.targetVideoUrl && !b.targetVideoUrl.startsWith('http')) {
             b.targetVideoUrl = `${baseUrl}/${b.targetVideoUrl.replace(/^\/+/, '')}`;
           }
        });
      }

      if (!data.id && !pathOrId.endsWith('.json')) {
        data.id = pathOrId;
      }

      return data;
    } catch (error) {
      console.error("[VideoService] Error:", error);
      throw error;
    }
  },

  /**
   * Fetches all available video IDs from Firestore and shuffles them for the feed.
   */
  getFeedPaths: async (): Promise<string[]> => {
    try {
      // Fetch some top and new videos to build a pool
      const top = await VideoService.getTopVideos();
      const news = await VideoService.getNewVideos();
      
      // Combine and get unique IDs
      const allIds = Array.from(new Set([
        ...top.map(v => v.id!),
        ...news.map(v => v.id!)
      ]));

      // Fallback if DB is empty
      if (allIds.length === 0) return ['feed_1.json', 'feed_2.json'];

      // Return a randomized list of IDs
      return shuffleArray(allIds);
    } catch (e) {
      console.error("Failed to build randomized feed:", e);
      return ['feed_1.json', 'feed_2.json'];
    }
  },

  getTopVideos: async (): Promise<VideoData[]> => {
    let videos = await FirestoreService.getGlobalTopVideos(10);

    if (videos.length === 0) {
      const promises = MOCK_DB_SEED.map(v => 
        FirestoreService.seedVideoData({
          id: v.id,
          title: v.title,
          thumbnailUrl: v.thumbnailUrl,
          mainVideoUrl: '', 
          branches: [],
          likes: v.likes,
          uploaderId: v.uploaderId,
          jsonName: v.jsonName
        }, v.numericViews, v.daysAgo)
      );
      await Promise.all(promises);
      videos = await FirestoreService.getGlobalTopVideos(10);
    }

    return videos;
  },

  getNewVideos: async (): Promise<VideoData[]> => {
    let videos = await FirestoreService.getGlobalNewVideos(10);
    if (videos.length === 0) {
      await VideoService.getTopVideos();
      videos = await FirestoreService.getGlobalNewVideos(10);
    }
    return videos;
  },

  getMostLovedVideos: async (): Promise<VideoData[]> => {
     return VideoService.getTopVideos();
  },

  getChannels: async (): Promise<Partial<UserProfile>[]> => {
    return [
      { id: '1', username: 'Jenny Wilson', followers: '1.9M', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jenny' },
      { id: '2', username: 'Lisa Alenaes', followers: '500K', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
      { id: '3', username: 'Guy Hawkins', followers: '2.1M', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guy' },
    ];
  },

  getUserProfile: async (username: string): Promise<UserProfile> => {
    const targetUsername = username.replace('@', '');
    const top = await VideoService.getTopVideos();
    const news = await VideoService.getNewVideos();
    const all = [...top, ...news];

    const matchedVideos = all.filter(v => v.uploaderId === targetUsername);

    return {
      id: `user_${targetUsername}`,
      username: targetUsername,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUsername}`,
      followers: (Math.floor(Math.random() * 50) + 1) + 'K',
      likes: (Math.floor(Math.random() * 500) + 1) + 'K',
      bio: 'Creating interactive stories for everyone.',
      additionalInfo: '',
      videos: matchedVideos
    };
  },

  searchChannels: async (query: string): Promise<Partial<UserProfile>[]> => {
    const creators = await VideoService.getChannels();
    return creators.filter(c => c.username?.toLowerCase().includes(query.toLowerCase()));
  },

  uploadVideo: async (data: any): Promise<void> => {
     console.log("Saving video config:", data);
     return Promise.resolve();
  }
};

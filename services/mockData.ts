
import { VideoData, UserProfile } from '../types';
import { FirestoreService } from './firestoreService';

// Hardcoded Storage URL (Bunny CDN)
const BUNNY_STORAGE_URL = "https://my-replaygram.b-cdn.net";

// STATIC DATA FOR SEEDING (Backup)
// Map these IDs to actual JSON files in Bunny Storage for the demo
const MOCK_DB_SEED = [
  {
    id: 'love1',
    title: 'Motivation Speech',
    likes: 1500000,
    numericViews: 2000000,
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

export const VideoService = {
  fetchVideoData: async (pathOrId: string): Promise<VideoData> => {
    const baseUrl = BUNNY_STORAGE_URL.replace(/\/+$/, '');
    let jsonFilename = pathOrId;
    let explicitId: string | null = null;

    // If it's not a .json path, it's a Firestore document ID
    if (!pathOrId.endsWith('.json')) {
      const doc = await FirestoreService.getVideoById(pathOrId);
      if (doc && doc.jsonName) {
        jsonFilename = doc.jsonName;
        explicitId = pathOrId; // Save the Firestore ID to enforce it later
      } else {
        throw new Error(`Video ID ${pathOrId} has no associated jsonName in Firestore.`);
      }
    }

    // Sanitize filename
    const cleanFilename = jsonFilename.split('/').pop()?.replace(/^\/+/, '') || '';
    const fetchUrl = `${baseUrl}/${cleanFilename}`;

    try {
      console.log(`[VideoService] Fetching JSON: ${fetchUrl}`);
      const response = await fetch(fetchUrl);
      
      if (!response.ok) {
        throw new Error(`Bunny Storage returned ${response.status} for ${fetchUrl}`);
      }
      
      const data: VideoData = await response.json();

      // IMPORTANT: If we fetched this using a Firestore ID (like 'love1'), 
      // we MUST use that ID instead of what's inside the JSON file (like 'feed_1')
      // to ensure view counts and likes are attributed correctly in Firestore.
      if (explicitId) {
        data.id = explicitId;
      }

      // Resolve relative video paths to CDN
      if (data.mainVideoUrl && !data.mainVideoUrl.startsWith('http')) {
         const cleanVideo = data.mainVideoUrl.replace(/^\/+/, ''); 
         data.mainVideoUrl = `${baseUrl}/${cleanVideo}`;
      }
      
      if (data.branches) {
        data.branches.forEach(b => {
           if (b.targetVideoUrl && !b.targetVideoUrl.startsWith('http')) {
             const cleanTarget = b.targetVideoUrl.replace(/^\/+/, '');
             b.targetVideoUrl = `${baseUrl}/${cleanTarget}`;
           }
        });
      }

      // Fallback for ID if still missing
      if (!data.id && !pathOrId.endsWith('.json')) {
        data.id = pathOrId;
      }

      return data;
    } catch (error) {
      console.error("[VideoService] Error:", error);
      throw error;
    }
  },

  getFeedPaths: async (): Promise<string[]> => {
    return Promise.resolve(['feed_1.json', 'feed_2.json']);
  },

  getTopVideos: async (): Promise<VideoData[]> => {
    let videos = await FirestoreService.getGlobalTopVideos(7);

    if (videos.length === 0) {
      console.log("Seeding Firestore...");
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
      videos = await FirestoreService.getGlobalTopVideos(7);
    }

    return videos;
  },

  getNewVideos: async (): Promise<VideoData[]> => {
    let videos = await FirestoreService.getGlobalNewVideos(7);
    if (videos.length === 0) {
      await VideoService.getTopVideos();
      videos = await FirestoreService.getGlobalNewVideos(7);
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
    const feedPaths = await VideoService.getFeedPaths();
    const matchedVideos: VideoData[] = [];

    for (const path of feedPaths) {
      try {
        const video = await VideoService.fetchVideoData(path);
        if (video.uploaderId === targetUsername) {
          const videoForGrid = {
            ...video,
            id: video.id || path,
            views: video.views || (Math.floor(Math.random() * 900) + 100 + 'K') 
          };
          matchedVideos.push(videoForGrid);
        }
      } catch (err) {}
    }

    return {
      id: `user_${targetUsername}`,
      username: targetUsername,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUsername}`,
      followers: '1.9K',
      likes: '46K',
      bio: 'NEVER LOSE HOPE',
      additionalInfo: '',
      videos: matchedVideos
    };
  },

  searchChannels: async (query: string): Promise<Partial<UserProfile>[]> => {
    const channels = [
      { id: '1', username: 'narrative_explorer', followers: '1.9K' },
      { id: '2', username: 'scifi_fan', followers: '12K' },
    ];
    return channels.filter(c => c.username.toLowerCase().includes(query.toLowerCase()));
  },

  uploadVideo: async (data: any): Promise<void> => {
     console.log("Mock Upload:", data);
     return Promise.resolve();
  }
};

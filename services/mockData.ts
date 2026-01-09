
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
    uploaderId: 'fashionista',
    daysAgo: 12,
    jsonName: 'feed_2.json'
  },
  {
    id: 'new1',
    title: 'Hidden Gems',
    likes: 2300,
    numericViews: 5400,
    thumbnailUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=800',
    uploaderId: 'guy_hawkins',
    daysAgo: 0,
    jsonName: 'feed_1.json'
  },
  {
    id: 'new2',
    title: 'Skate Tricks',
    likes: 1200,
    numericViews: 3200,
    thumbnailUrl: 'https://images.unsplash.com/photo-1520045864906-820551b7142d?auto=format&fit=crop&q=80&w=800',
    uploaderId: 'guy_hawkins',
    daysAgo: 1,
    jsonName: 'feed_2.json'
  }
];

const MOCK_CHANNEL_SEED = [
  { username: 'inspirer', followers: '1.9M', likes: '46K', bio: 'NEVER LOSE HOPE', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jenny' },
  { username: 'fashionista', followers: '500K', likes: '12K', bio: 'Creating lifestyle vibes', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
  { username: 'guy_hawkins', followers: '2.1M', likes: '102K', bio: 'Skate and Travel', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guy' },
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

    // 1. Resolve ID to filename via Firestore if it's not a path
    if (!pathOrId.endsWith('.json')) {
      const doc = await FirestoreService.getVideoById(pathOrId);
      if (doc && doc.jsonName) {
        jsonFilename = doc.jsonName;
        explicitId = pathOrId;
      } else {
        // If firestore fails, check if ID might be a local filename
        jsonFilename = pathOrId.includes('.') ? pathOrId : `${pathOrId}.json`;
      }
    }

    const cleanFilename = jsonFilename.split('/').pop()?.replace(/^\/+/, '') || '';
    const fetchUrls = [
      `${baseUrl}/${cleanFilename}`,         // Try CDN
      `./data/${cleanFilename}`,            // Try Local Data Folder
      `/data/${cleanFilename}`              // Try Absolute Local
    ];

    let lastError = null;
    for (const url of fetchUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data: VideoData = await response.json();
          if (explicitId) data.id = explicitId;
          
          // Fix relative URLs for assets
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
          if (!data.id) data.id = pathOrId;
          return data;
        }
      } catch (e) {
        lastError = e;
      }
    }

    throw new Error(lastError ? String(lastError) : `Failed to fetch video config from any source: ${cleanFilename}`);
  },

  getFeedPaths: async (): Promise<string[]> => {
    try {
      const top = await VideoService.getTopVideos();
      const news = await VideoService.getNewVideos();
      const allIds = Array.from(new Set([...top.map(v => v.id!), ...news.map(v => v.id!)]));
      if (allIds.length === 0) return ['feed_1.json', 'feed_2.json'];
      return shuffleArray(allIds);
    } catch (e) {
      return ['feed_1.json', 'feed_2.json'];
    }
  },

  getTopVideos: async (): Promise<VideoData[]> => {
    let videos = await FirestoreService.getGlobalTopVideos(10);
    // Seed if empty OR if firestore returned nothing due to initial setup
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
    let channels = await FirestoreService.getGlobalChannels(10);
    if (channels.length === 0) {
      console.log("Seeding channels...");
      const promises = MOCK_CHANNEL_SEED.map(c => FirestoreService.seedChannelData(c));
      await Promise.all(promises);
      channels = await FirestoreService.getGlobalChannels(10);
    }
    return channels;
  },

  getUserProfile: async (username: string): Promise<UserProfile> => {
    const cleanUsername = username.replace('@', '');
    const channelData = await FirestoreService.getChannelByUsername(cleanUsername);
    const videos = await FirestoreService.getVideosByUploader(cleanUsername);

    if (!channelData) {
        return {
            id: `gen_${cleanUsername}`,
            username: cleanUsername,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
            followers: '0',
            likes: '0',
            bio: 'No bio available.',
            additionalInfo: '',
            videos: []
        };
    }

    return {
      id: channelData.id!,
      username: channelData.username!,
      avatarUrl: channelData.avatarUrl!,
      followers: channelData.followers!,
      likes: channelData.likes!,
      bio: channelData.bio!,
      additionalInfo: '',
      videos: videos
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

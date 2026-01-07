
import { VideoData, UserProfile } from '../types';
import { FirestoreService } from './firestoreService';

// Bunny CDN Base URL
const BUNNY_STORAGE_URL = "https://my-replaygram.b-cdn.net";

// Initial data to populate Firestore if empty
const INITIAL_STORY_DATA: VideoData[] = [
  {
    id: "feed_1",
    title: "The Fork in the Road",
    description: "You stand at the crossroads. The path splits into a dark forest and a sunny mountain trail. Choose wisely.",
    likes: 1250,
    uploaderId: "narrative_explorer",
    thumbnailUrl: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=800",
    mainVideoUrl: "https://vz-8d915ecf-df3.b-cdn.net/72ef6d8a-c162-4647-a9b2-0e298ea68c8e/playlist.m3u8",
    branches: [
      {
        appearAtSecond: 2,
        PauseAtappersecond: true,
        DurationPauseseconds: 5,
        label: "Vini View",
        labelpositionx: 5,
        labelpositiony: 70,
        targetVideoUrl: "",
        targetJson: "forest_entry"
      },
      {
        appearAtSecond: 2,
        PauseAtappersecond: true,
        DurationPauseseconds: 5,
        label: "Side View",
        labelpositionx: 75,
        labelpositiony: 50,
        targetVideoUrl: "",
        targetJson: "mountain_climb"
      }
    ],
    viewsCount: 5000
  },
  {
    id: "forest_entry",
    title: "Into the Woods",
    description: "The trees are dense and the air is cold.",
    likes: 85,
    uploaderId: "narrative_explorer",
    thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
    mainVideoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    branches: [
      {
        appearAtSecond: 5,
        PauseAtappersecond: true,
        label: "🔍 Investigate Sound",
        labelpositionx: 50,
        labelpositiony: 30,
        targetVideoUrl: "",
        targetJson: "forest_secret"
      },
      {
        appearAtSecond: 8,
        PauseAtappersecond: true,
        label: "🏃 Run Back",
        labelpositionx: 50,
        labelpositiony: 70,
        targetVideoUrl: "",
        targetJson: "feed_1"
      }
    ],
    viewsCount: 1200
  },
  {
    id: "feed_2",
    title: "Neon Dreams",
    description: "A glimpse into the cyber future.",
    likes: 5000,
    uploaderId: "scifi_fan",
    thumbnailUrl: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=800",
    mainVideoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    branches: [],
    viewsCount: 8900
  }
];

export const VideoService = {
  // Fetch from Firestore and Resolve CDN URLs
  fetchVideoData: async (id: string): Promise<VideoData> => {
    // Clean ID (remove path or extension if accidentally passed)
    const cleanId = id.replace('/data/', '').replace('.json', '');

    try {
      console.log(`[VideoService] Querying Firestore for ID: ${cleanId}`);
      const data = await FirestoreService.getVideoById(cleanId);
      
      if (!data) {
        throw new Error(`Video configuration '${cleanId}' not found in Firestore.`);
      }

      // Resolve relative video paths to Bunny CDN
      const baseUrl = BUNNY_STORAGE_URL.replace(/\/+$/, '');
      if (data.mainVideoUrl && !data.mainVideoUrl.startsWith('http')) {
         const cleanPath = data.mainVideoUrl.replace(/^\/+/, ''); 
         data.mainVideoUrl = `${baseUrl}/${cleanPath}`;
      }
      
      if (data.branches) {
        data.branches.forEach(b => {
           if (b.targetVideoUrl && !b.targetVideoUrl.startsWith('http') && b.targetVideoUrl !== '') {
             const cleanTarget = b.targetVideoUrl.replace(/^\/+/, '');
             b.targetVideoUrl = `${baseUrl}/${cleanTarget}`;
           }
        });
      }

      return data;
    } catch (error) {
      console.error("[VideoService] Error:", error);
      throw error; 
    }
  },

  getFeedIds: async (): Promise<string[]> => {
    let videos = await FirestoreService.getFeedVideos(10);
    
    // --- AUTO SEEDING ---
    if (videos.length === 0) {
      console.log("Firestore empty. Seeding initial story data...");
      await Promise.all(INITIAL_STORY_DATA.map(v => FirestoreService.seedVideoData(v)));
      videos = await FirestoreService.getFeedVideos(10);
    }

    // Filter to only show top-level feed items (e.g. ones starting with 'feed_')
    return videos.filter(v => v.id?.startsWith('feed_')).map(v => v.id!);
  },

  // Legacy compatibility
  getFeedPaths: async (): Promise<string[]> => {
    return VideoService.getFeedIds();
  },

  getTopVideos: async (): Promise<VideoData[]> => {
    return await FirestoreService.getGlobalTopVideos(7);
  },

  getNewVideos: async (): Promise<VideoData[]> => {
    return await FirestoreService.getGlobalNewVideos(7);
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
    const feedIds = await VideoService.getFeedIds();
    const matchedVideos: VideoData[] = [];

    for (const id of feedIds) {
      try {
        const video = await VideoService.fetchVideoData(id);
        if (video.uploaderId === targetUsername) {
          matchedVideos.push(video);
        }
      } catch (err) {}
    }

    return Promise.resolve({
      id: `user_${targetUsername}`,
      username: targetUsername,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUsername}`,
      followers: '1.9K',
      likes: '46K',
      bio: 'Interactive Storyteller',
      additionalInfo: '',
      videos: matchedVideos
    });
  },

  searchChannels: async (query: string): Promise<Partial<UserProfile>[]> => {
    const channels = [
      { id: '1', username: 'narrative_explorer', followers: '1.9K' },
      { id: '2', username: 'scifi_fan', followers: '12K' },
    ];
    return Promise.resolve(channels.filter(c => c.username.toLowerCase().includes(query.toLowerCase())));
  },

  uploadVideo: async (data: VideoData): Promise<void> => {
     await FirestoreService.saveVideoMetadata(data);
  }
};

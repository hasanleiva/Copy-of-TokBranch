import { VideoData, UserProfile } from '../types';

export const VideoService = {
  fetchVideoData: async (path: string): Promise<VideoData> => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load video config at ${path}`);
      }
      const data: VideoData = await response.json();
      return data;
    } catch (error) {
      console.error("VideoService Error:", error);
      throw error;
    }
  },

  getFeedPaths: async (): Promise<string[]> => {
    return Promise.resolve(['/data/feed_1.json', '/data/feed_2.json']);
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
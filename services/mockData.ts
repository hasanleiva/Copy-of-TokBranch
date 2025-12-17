import { Video, BranchOption } from '../types';

// Mock database
const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://picsum.photos/400/800?random=1',
    title: 'Mountain Adventure',
    description: 'Starting the journey at the base camp.',
    likes: 1205,
    views: 5400,
    uploaderId: 'admin',
    branchOptions: [
      { id: 'b1', label: 'Climb Peak', thumbnailUrl: 'https://picsum.photos/100/100?random=2', targetVideoId: 'v2' },
      { id: 'b2', label: 'Explore Cave', thumbnailUrl: 'https://picsum.photos/100/100?random=3', targetVideoId: 'v3' },
      { id: 'b3', label: 'River Path', thumbnailUrl: 'https://picsum.photos/100/100?random=4', targetVideoId: 'v4' },
    ]
  },
  {
    id: 'v2',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://picsum.photos/400/800?random=5',
    title: ' The Peak',
    description: 'The view from the top is amazing.',
    likes: 340,
    views: 1200,
    uploaderId: 'admin',
    branchOptions: [
      { id: 'b4', label: 'Jump Off', thumbnailUrl: 'https://picsum.photos/100/100?random=6', targetVideoId: 'v1' }, // Loop back
    ]
  },
  {
    id: 'v3',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://picsum.photos/400/800?random=7',
    title: 'Deep Cave',
    description: 'It is getting dark in here...',
    likes: 560,
    views: 2300,
    uploaderId: 'admin',
    branchOptions: []
  },
  {
    id: 'v4',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://picsum.photos/400/800?random=8',
    title: 'River Rapids',
    description: 'Hold on tight!',
    likes: 890,
    views: 3100,
    uploaderId: 'admin',
    branchOptions: []
  },
  // A second "root" video for the feed
  {
    id: 'v5',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://picsum.photos/400/800?random=9',
    title: 'Cyber City',
    description: 'Welcome to the future.',
    likes: 9999,
    views: 45000,
    uploaderId: 'admin',
    branchOptions: [
       { id: 'b5', label: 'Enter Matrix', thumbnailUrl: 'https://picsum.photos/100/100?random=10', targetVideoId: 'v1' },
    ]
  }
];

export const VideoService = {
  // Simulate fetching the main feed (root videos)
  getFeed: async (): Promise<Video[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return only videos that are meant to be feed starters (arbitrary logic for mock)
        resolve(MOCK_VIDEOS.filter(v => ['v1', 'v5'].includes(v.id)));
      }, 500);
    });
  },

  getVideoById: async (id: string): Promise<Video | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_VIDEOS.find(v => v.id === id));
      }, 200);
    });
  },

  // Mock upload - in real app, this would use Presigned URLs to R2
  uploadVideo: async (video: Partial<Video>): Promise<Video> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newVideo: Video = {
            id: `v${Date.now()}`,
            url: video.url || '',
            thumbnailUrl: video.thumbnailUrl || 'https://picsum.photos/400/800',
            title: video.title || 'Untitled',
            description: video.description || '',
            likes: 0,
            views: 0,
            uploaderId: 'admin',
            branchOptions: video.branchOptions || []
        };
        MOCK_VIDEOS.push(newVideo);
        resolve(newVideo);
      }, 1000);
    });
  }
};
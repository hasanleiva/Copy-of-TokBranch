import { db } from './firebaseConfig';
// Import firebase for FieldValue access
import firebase from 'firebase/app';
import { VideoData } from '../types';

// Helper to format numbers (e.g. 1200 -> 1.2K)
const formatViews = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const FirestoreService = {
  // Fetch a single video by its Firestore Document ID using namespaced API
  getVideoById: async (id: string): Promise<VideoData | null> => {
    try {
      const docRef = db.collection('videos').doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        const data = docSnap.data();
        if (!data) return null;
        return {
          id: docSnap.id,
          ...data,
          views: formatViews(data.viewsCount || 0),
        } as VideoData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching video by ID:", error);
      throw error;
    }
  },

  // Get initial feed of videos using namespaced API
  getFeedVideos: async (limitCount: number = 10): Promise<VideoData[]> => {
    try {
      const snapshot = await db.collection('videos')
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          views: formatViews(data.viewsCount || 0),
        } as VideoData;
      });
    } catch (e) {
      console.error("Error fetching feed:", e);
      return [];
    }
  },

  // Create or Update a video document using namespaced API
  saveVideoMetadata: async (videoData: VideoData): Promise<string> => {
    try {
      const dataToSave = {
        ...videoData,
        viewsCount: videoData.viewsCount || 0,
        createdAt: videoData.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (videoData.id) {
        await db.collection('videos').doc(videoData.id).set(dataToSave, { merge: true });
        return videoData.id;
      } else {
        const docRef = await db.collection('videos').add(dataToSave);
        return docRef.id;
      }
    } catch (e) {
      console.error("Error saving video:", e);
      throw e;
    }
  },

  // Increment view count atomically using namespaced API
  incrementView: async (videoId: string) => {
    if (!videoId) return;
    const videoRef = db.collection('videos').doc(videoId);
    try {
      await videoRef.set({ 
        viewsCount: firebase.firestore.FieldValue.increment(1),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp() 
      }, { merge: true });
    } catch (e) {
      // Quiet fail for analytics
    }
  },

  toggleLike: async (userId: string, video: VideoData, isLiked: boolean) => {
    if (!video.id || !userId) return;
    const userLikeRef = db.collection('users').doc(userId).collection('likedVideos').doc(video.id);

    try {
      if (isLiked) {
        await userLikeRef.delete();
      } else {
        await userLikeRef.set({
          videoId: video.id,
          thumbnailUrl: video.thumbnailUrl || '',
          title: video.title || '',
          likedAt: firebase.firestore.FieldValue.serverTimestamp(),
          views: video.views || '0' 
        });
      }
    } catch (e) {
      console.error("Error toggling like:", e);
      throw e;
    }
  },

  checkIfLiked: async (userId: string, videoId: string): Promise<boolean> => {
    if (!userId || !videoId) return false;
    const docRef = db.collection('users').doc(userId).collection('likedVideos').doc(videoId);
    try {
      const docSnap = await docRef.get();
      return docSnap.exists;
    } catch (e) {
      return false;
    }
  },

  getUserLikedVideos: async (userId: string): Promise<VideoData[]> => {
    if (!userId) return [];
    try {
      const snapshot = await db.collection('users').doc(userId).collection('likedVideos')
        .orderBy('likedAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: data.videoId,
              mainVideoUrl: '', 
              thumbnailUrl: data.thumbnailUrl,
              title: data.title,
              branches: [],
              views: data.views || '0', 
              likes: 0
          } as VideoData;
      });
    } catch (e) {
      console.error("Error fetching liked videos:", e);
      return [];
    }
  },

  getGlobalTopVideos: async (limitCount: number = 10): Promise<VideoData[]> => {
    try {
      const snapshot = await db.collection('videos')
        .orderBy('viewsCount', 'desc')
        .limit(limitCount)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), views: formatViews(doc.data().viewsCount || 0) } as VideoData));
    } catch (e) { return []; }
  },

  getGlobalNewVideos: async (limitCount: number = 10): Promise<VideoData[]> => {
    try {
      const snapshot = await db.collection('videos')
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), views: formatViews(doc.data().viewsCount || 0) } as VideoData));
    } catch (e) { return []; }
  },

  // Seeding helper using namespaced API
  seedVideoData: async (video: VideoData) => {
    if (!video.id) return;
    await db.collection('videos').doc(video.id).set({
      ...video,
      viewsCount: video.viewsCount || 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }
};

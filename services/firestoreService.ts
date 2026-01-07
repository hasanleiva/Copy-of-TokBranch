import { db } from './firebaseConfig';
import { 
  doc, 
  getDoc, 
  setDoc, 
  increment, 
  deleteDoc, 
  serverTimestamp, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  Timestamp
} from '@firebase/firestore';
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
  // Get a single video document by ID
  getVideoById: async (id: string): Promise<any | null> => {
    try {
      const docRef = doc(db, 'videos', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (e) {
      console.error("Error fetching video by ID:", e);
      return null;
    }
  },

  // Increment view count atomically
  incrementView: async (videoId: string) => {
    if (!videoId) return;
    const videoRef = doc(db, 'videos', videoId);
    try {
      await setDoc(videoRef, { 
        viewsCount: increment(1),
        lastUpdated: serverTimestamp() 
      }, { merge: true });
    } catch (e) {
      console.error("Error incrementing view:", e);
    }
  },

  toggleLike: async (userId: string, video: VideoData, isLiked: boolean) => {
    if (!video.id || !userId) return;
    const userLikeRef = doc(db, 'users', userId, 'likedVideos', video.id);

    try {
      if (isLiked) {
        await deleteDoc(userLikeRef);
      } else {
        await setDoc(userLikeRef, {
          videoId: video.id,
          thumbnailUrl: video.thumbnailUrl || '',
          title: video.title || '',
          likedAt: serverTimestamp(),
          views: '0' 
        });
      }
    } catch (e) {
      console.error("Error toggling like:", e);
      throw e;
    }
  },

  checkIfLiked: async (userId: string, videoId: string): Promise<boolean> => {
    if (!userId || !videoId) return false;
    const docRef = doc(db, 'users', userId, 'likedVideos', videoId);
    try {
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (e) {
      return false;
    }
  },

  getUserLikedVideos: async (userId: string): Promise<VideoData[]> => {
    if (!userId) return [];
    try {
      const likesRef = collection(db, 'users', userId, 'likedVideos');
      const q = query(likesRef, orderBy('likedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: data.videoId,
              mainVideoUrl: '', 
              thumbnailUrl: data.thumbnailUrl,
              title: data.title,
              branches: [],
              views: '0', 
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
      const videosRef = collection(db, 'videos');
      const q = query(videosRef, orderBy('viewsCount', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled',
          thumbnailUrl: data.thumbnailUrl || '',
          mainVideoUrl: data.mainVideoUrl || '',
          views: formatViews(data.viewsCount || 0),
          likes: data.likes || 0,
          uploaderId: data.uploaderId || 'unknown',
          branches: data.branches || [],
          jsonName: data.jsonName || ''
        } as VideoData;
      });
    } catch (e) {
      console.error("Error fetching top videos:", e);
      return [];
    }
  },

  getGlobalNewVideos: async (limitCount: number = 10): Promise<VideoData[]> => {
    try {
      const videosRef = collection(db, 'videos');
      const q = query(videosRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled',
          thumbnailUrl: data.thumbnailUrl || '',
          mainVideoUrl: data.mainVideoUrl || '', 
          views: formatViews(data.viewsCount || 0),
          likes: data.likes || 0,
          uploaderId: data.uploaderId || 'unknown',
          branches: data.branches || [],
          jsonName: data.jsonName || ''
        } as VideoData;
      });
    } catch (e) {
      console.error("Error fetching new videos:", e);
      return [];
    }
  },

  seedVideoData: async (video: VideoData, numericViews: number, daysAgo: number) => {
    if (!video.id) return;
    const videoRef = doc(db, 'videos', video.id);
    
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    await setDoc(videoRef, {
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      mainVideoUrl: video.mainVideoUrl,
      uploaderId: video.uploaderId,
      viewsCount: numericViews,
      likes: video.likes,
      branches: video.branches || [],
      createdAt: Timestamp.fromDate(date),
      jsonName: video.jsonName || ''
    }, { merge: true });
  }
};
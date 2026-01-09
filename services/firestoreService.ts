
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
  where,
  orderBy, 
  limit,
  Timestamp
} from '@firebase/firestore';
import { VideoData, UserProfile } from '../types';

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
  // --- Video Methods ---
  getVideoById: async (id: string): Promise<any | null> => {
    try {
      const docRef = doc(db, 'videos', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (e: any) {
      console.warn("Firestore [getVideoById] error:", e.message);
      return null;
    }
  },

  incrementView: async (videoId: string) => {
    if (!videoId) return;
    try {
      const videoRef = doc(db, 'videos', videoId);
      await setDoc(videoRef, { 
        viewsCount: increment(1),
        lastUpdated: serverTimestamp() 
      }, { merge: true });
    } catch (e: any) {
      console.warn("Firestore [incrementView] error:", e.message);
    }
  },

  getVideosByUploader: async (uploaderId: string): Promise<VideoData[]> => {
    try {
      const videosRef = collection(db, 'videos');
      const q = query(videosRef, where('uploaderId', '==', uploaderId));
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
          uploaderId: data.uploaderId,
          branches: data.branches || [],
          jsonName: data.jsonName || ''
        } as VideoData;
      });
    } catch (e: any) {
      console.warn("Firestore [getVideosByUploader] error:", e.message);
      return [];
    }
  },

  // --- Like Methods ---
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
    } catch (e: any) {
      console.error("Firestore [toggleLike] error:", e.message);
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
    } catch (e: any) {
      console.warn("Firestore [getUserLikedVideos] error:", e.message);
      return [];
    }
  },

  // --- Channel Methods ---
  getGlobalChannels: async (limitCount: number = 20): Promise<Partial<UserProfile>[]> => {
    try {
      const channelsRef = collection(db, 'channels');
      const q = query(channelsRef, limit(limitCount));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          username: data.username,
          avatarUrl: data.avatarUrl,
          followers: data.followers || '0',
          likes: data.likes || '0',
          bio: data.bio || ''
        };
      });
    } catch (e: any) {
      console.warn("Firestore [getGlobalChannels] error:", e.message);
      return [];
    }
  },

  getChannelByUsername: async (username: string): Promise<Partial<UserProfile> | null> => {
    try {
      const cleanUsername = username.replace('@', '');
      const channelsRef = collection(db, 'channels');
      const q = query(channelsRef, where('username', '==', cleanUsername), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Partial<UserProfile>;
      }
      return null;
    } catch (e: any) {
      console.warn("Firestore [getChannelByUsername] error:", e.message);
      return null;
    }
  },

  // --- Seeding Methods ---
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
    } catch (e: any) {
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
    } catch (e: any) {
      return [];
    }
  },

  seedChannelData: async (channel: any) => {
    try {
      const channelId = channel.username.replace(/\s+/g, '_').toLowerCase();
      const channelRef = doc(db, 'channels', channelId);
      await setDoc(channelRef, {
        username: channel.username,
        followers: channel.followers,
        likes: channel.likes,
        bio: channel.bio,
        avatarUrl: channel.avatarUrl,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (e: any) {
      console.warn("Firestore [seedChannelData] error:", e.message);
    }
  },

  seedVideoData: async (video: VideoData, numericViews: number, daysAgo: number) => {
    try {
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
    } catch (e: any) {
      console.warn("Firestore [seedVideoData] error:", e.message);
    }
  }
};

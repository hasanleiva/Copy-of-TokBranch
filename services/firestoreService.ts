import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, increment, deleteDoc, serverTimestamp, collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { VideoData } from '../types';

export const FirestoreService = {
  // Increment view count atomically
  incrementView: async (videoId: string) => {
    if (!videoId) return;
    const videoRef = doc(db, 'videos', videoId);
    try {
      // Use setDoc with merge to ensure document exists, then increment
      await setDoc(videoRef, { 
        views: increment(1),
        lastUpdated: serverTimestamp() 
      }, { merge: true });
    } catch (e) {
      console.error("Error incrementing view:", e);
    }
  },

  // Toggle Like status (Updated: No longer tracking global counts)
  toggleLike: async (userId: string, video: VideoData, isLiked: boolean) => {
    if (!video.id || !userId) return;
    
    // We only manage the user's personal "likedVideos" collection now.
    // We do NOT update the global 'videos' collection for likes.
    const userLikeRef = doc(db, 'users', userId, 'likedVideos', video.id);

    try {
      if (isLiked) {
        // Unlike: Remove from user likes
        await deleteDoc(userLikeRef);
      } else {
        // Like: Add to user likes
        // Save minimal video data to user's collection for Library display
        await setDoc(userLikeRef, {
          videoId: video.id,
          thumbnailUrl: video.thumbnailUrl || '',
          title: video.title || '',
          likedAt: serverTimestamp(),
          views: '0' // Placeholder, real views come from video doc
        });
      }
    } catch (e) {
      console.error("Error toggling like:", e);
      throw e;
    }
  },

  // Check if a specific video is liked by the user
  checkIfLiked: async (userId: string, videoId: string): Promise<boolean> => {
    if (!userId || !videoId) return false;
    const docRef = doc(db, 'users', userId, 'likedVideos', videoId);
    try {
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (e) {
      console.error("Error checking like status:", e);
      return false;
    }
  },

  // Get all videos liked by the user
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
              mainVideoUrl: '', // Not needed for grid thumbnail
              thumbnailUrl: data.thumbnailUrl,
              title: data.title,
              branches: [],
              views: '0', // We can fetch live views if needed, or leave generic
              likes: 0
          } as VideoData;
      });
    } catch (e) {
      console.error("Error fetching liked videos:", e);
      return [];
    }
  }
};
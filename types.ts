
export interface Branch {
  appearAtSecond: number;
  PauseAtappersecond: boolean;
  DurationPauseseconds?: number;
  label: string;
  labelpositionx: number; // Percentage 0-100
  labelpositiony: number; // Percentage 0-100
  targetVideoUrl: string; // Optional direct link
  targetJson: string; // Now represents the Firestore Document ID of the next video
}

export interface VideoData {
  id?: string;
  mainVideoUrl: string;
  branches: Branch[];
  title?: string;
  description?: string;
  likes?: number;
  uploaderId?: string;
  thumbnailUrl?: string;
  views?: string; // Formatted string for UI (e.g. "1.2K")
  viewsCount?: number; // Numeric value for sorting in Firestore
  createdAt?: any; // Firestore Timestamp
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  followers: string;
  likes: string;
  bio: string;
  additionalInfo: string;
  videos: VideoData[];
}

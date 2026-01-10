
export interface Branch {
  appearAtSecond: number;
  PauseAtappersecond: boolean;
  DurationPauseseconds?: number;
  label: string;
  labelpositionx: number; // Percentage 0-100
  labelpositiony: number; // Percentage 0-100
  targetVideoUrl: string;
  targetJson: string; // Path to the next JSON file
}

export interface VideoData {
  mainVideoUrl: string;
  branches: Branch[];
  id?: string;
  title?: string;
  description?: string;
  likes?: number;
  uploaderId?: string;
  thumbnailUrl?: string;
  views?: string; // e.g. "2.1M"
  jsonName?: string; // The specific filename in Bunny Storage (e.g. "feed_1.json")
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
  videoCount?: number;
}

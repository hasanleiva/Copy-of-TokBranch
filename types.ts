export interface BranchOption {
  id: string;
  label: string;
  thumbnailUrl: string;
  targetVideoId: string; // The video this option leads to
}

export interface Video {
  id: string;
  url: string; // URL to the mp4/m3u8
  thumbnailUrl: string;
  title: string;
  description: string;
  likes: number;
  views: number;
  uploaderId: string;
  branchOptions: BranchOption[];
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface VideoUploadPayload {
  title: string;
  description: string;
  videoFile: File | null;
  thumbnailFile: File | null;
  branchOptions: BranchOption[];
}
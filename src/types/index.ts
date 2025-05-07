
export interface User {
  id: string;
  email: string;
  callsign: string;
  firstName: string;
  lastName: string;
  isStaff?: boolean;
  createdAt: string;
}

export interface Photo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  userId: string;
  callsign: string;
  uploaderName: string;
  approved: boolean;
  voteCount: number;
  uploadMonth: number;
  uploadYear: number;
  createdAt: string;
}

export interface Vote {
  id: string;
  photoId: string;
  userId: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isStaff: boolean;
  isLoading: boolean;
}

export interface UploadState {
  uploadCount: number;
  uploadLimit: number;
  votesUsed: number;
  voteLimit: number;
}

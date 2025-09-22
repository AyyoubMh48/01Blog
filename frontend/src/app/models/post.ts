export interface Post {
  id: number;
  content: string;
  createdAt: string; 
  author: {
    id: number;
    username: string;
  };
  mediaUrl?: string; 
  likeCount: number; 
  likedByCurrentUser: boolean;
}
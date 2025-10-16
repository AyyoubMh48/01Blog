export interface Tag {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string; 
  author: {
    id: number;
    username: string;
  };
  mediaUrl?: string; 
  likeCount: number; 
  likedByCurrentUser: boolean;
  commentCount: number;
  tags: Tag[];
}

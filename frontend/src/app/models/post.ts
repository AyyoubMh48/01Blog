export interface Tag {
  id: number;
  name: string;
}

export enum PostStatus {
  PUBLISHED = 'PUBLISHED',
  HIDDEN_BY_ADMIN = 'HIDDEN_BY_ADMIN'
}

export interface Post {
  id: number;
  title: string;
  content: string;
  status: PostStatus;
  createdAt: string; 
  author: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  mediaUrl?: string; 
  likeCount: number; 
  likedByCurrentUser: boolean;
  commentCount: number;
  tags: Tag[];
}

import { Post } from './post';

export interface UserProfile {
  id: number;
  username: string;
  posts: Post[];
  followedByCurrentUser: boolean;
}
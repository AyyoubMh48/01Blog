export interface Post {
  id: number;
  content: string;
  createdAt: string; // The backend sends this as a string
  author: {
    id: number;
    username: string;
  };
}
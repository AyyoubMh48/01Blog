import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post'; 

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8080/api/posts';

  constructor(private http: HttpClient) { }

  // Method to get all posts
  getPublicPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }
  //get the personalized feed for a logged-in user
  getFeed(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/feed`);
  }

  // Method to create a new post
  createPost(postData: { content: string }): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, postData);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post'; 

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // Current page number (0-indexed)
  size: number;
  // Add other Page properties if needed (last, first, etc.)
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8080/api/posts';

  constructor(private http: HttpClient) { }

  getPublicPosts(page: number, size: number): Observable<Page<Post>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Post>>(this.apiUrl, { params });
  }

  getFeed(page: number, size: number): Observable<Page<Post>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Post>>(`${this.apiUrl}/feed`, { params });
  }

  createPost(formData: FormData): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, formData);
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${postId}`);
  }

  getPost(postId: number): Observable<Post> {    
    return this.http.get<Post>(`${this.apiUrl}/${postId}`);
  }

  updatePost(postId: number, formData: FormData): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${postId}`, formData);
  }

  uploadMedia(formData: FormData): Observable<any> {
    return this.http.post('http://localhost:8080/api/media/upload', formData);
  }

  getMyPosts(page: number, size: number): Observable<Page<Post>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Post>>(`${this.apiUrl}/my-posts`, { params });
  }

  getTrendingPosts(limit: number = 5): Observable<Post[]> { 
    return this.http.get<Post[]>(`${this.apiUrl}/trending?limit=${limit}`);
  }



}
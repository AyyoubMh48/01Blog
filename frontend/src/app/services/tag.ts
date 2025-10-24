import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag,Post } from '../models/post';
import { Page } from './post';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = 'http://localhost:8080/api/tags';

  constructor(private http: HttpClient) { }

  getPopularTags(limit: number = 10): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/popular?limit=${limit}`);
  }

  getPostsByTag(tagName: string, page: number, size: number): Observable<Page<Post>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Post>>(`http://localhost:8080/api/tags/${tagName}/posts`, { params });
  }

}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import { Notification } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private stompClient: any;
  private apiUrl = 'http://localhost:8080/api/notifications';
  public notifications$ = new BehaviorSubject<Notification[]>([]);

  constructor(private http: HttpClient) {}

  connect(): void {
    const token = localStorage.getItem('authToken');
    if (!token || this.stompClient?.connected) {
      return;
    }
    
    this.http.get<Notification[]>(this.apiUrl).subscribe(initialNotifications => {
      this.notifications$.next(initialNotifications);
    });

    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({ 'Authorization': `Bearer ${token}` }, (frame: any) => {
      this.stompClient.subscribe('/user/queue/notifications', (message: any) => {
        const newNotification: Notification = JSON.parse(message.body);
        const currentNotifications = this.notifications$.getValue();
        this.notifications$.next([newNotification, ...currentNotifications]);
      });
    });
  }

  markAsRead(notificationId: number) {
    return this.http.post(`${this.apiUrl}/${notificationId}/read`, {});
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }
}
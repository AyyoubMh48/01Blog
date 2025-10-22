import { Routes } from '@angular/router';

import { Admin } from './pages/admin/admin';
import { Block } from './pages/block/block';
import { Feed } from './pages/feed/feed';
import { Login } from './pages/login/login';
import { PostEditor } from './pages/post-editor/post-editor';
import { Profile } from './pages/profile/profile';
import { Register } from './pages/register/register';
import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';
import { PostDetail } from './pages/post-detail/post-detail';
import { Notifications } from './pages/notifications/notifications';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'feed', component: Feed, 
    canActivate: [authGuard] },
  { path: 'block/:username', component: Block , 
    canActivate: [authGuard]},
  { path: 'post/new', component: PostEditor, 
    canActivate: [authGuard] },
  { path: 'post/edit/:postId', component: PostEditor,
    canActivate: [authGuard] },
  { path: '', redirectTo: '/feed', pathMatch: 'full' },
  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard],
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard],
  },
  { path: 'post/:postId', component: PostDetail },
  { 
    path: 'notifications', 
    component: Notifications, 
    canActivate: [authGuard],
  },
];

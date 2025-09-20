import { Routes } from '@angular/router';

import { Admin } from './pages/admin/admin';
import { Block } from './pages/block/block';
import { Feed} from './pages/feed/feed';
import { Login} from './pages/login/login';
import { PostEditor} from './pages/post-editor/post-editor';
import { Profile} from './pages/profile/profile';
import { Register} from './pages/register/register';

export const routes: Routes = [
    { path: 'login', component: Login},
    { path: 'register', component: Register},
    { path: 'feed', component: Feed},
    { path: 'block/:username', component: Block},
    { path: 'post/new', component: PostEditor},
    { path: 'post/edit/:postId', component: PostEditor},
    { path: 'profile', component: Profile},
    { path: 'admin', component: Admin},
    { path: '', redirectTo: '/feed', pathMatch: 'full' },
];
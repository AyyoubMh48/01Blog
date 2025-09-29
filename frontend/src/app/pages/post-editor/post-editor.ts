import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; 
import { PostService } from '../../services/post';
import { Post } from '../../models/post';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-editor.html',
  styleUrl: './post-editor.scss'
})
export class PostEditor implements OnInit {
  isEditMode = false;
  postId: number | null = null;
  post: Post | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('postId');
    if (id) {
      this.isEditMode = true;
      this.postId = +id; // The '+' converts the string to a number
      this.postService.getPost(this.postId).subscribe(postData => {
        this.post = postData;
      });
    }
  }
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('content', form.value.content);


    if (this.isEditMode && this.postId) {
      this.postService.updatePost(this.postId, formData).subscribe(() => {
        this.router.navigate(['/feed']);
      });
    } else if (!this.isEditMode) {
      this.postService.createPost(formData).subscribe(() => {
          this.router.navigate(['/feed']);
      });
    }
}

}
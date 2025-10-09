import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post';
import { Post } from '../../models/post';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './post-editor.html',
  styleUrl: './post-editor.scss',
})
export class PostEditor implements OnInit {
  isEditMode = false;
  postId: number | null = null;
  post: Post | null = null;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  previewFileType: 'image' | 'video' | null = null;
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('postId');
    if (id) {
      this.isEditMode = true;
      this.postId = +id;
      this.postService.getPost(this.postId).subscribe((postData) => {
        this.post = postData;
      });
    } else {
      this.isEditMode = false;
      this.post = {} as Post;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const fileType = this.selectedFile.type;

      if (fileType.startsWith('image/')) {
        this.previewFileType = 'image';
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result;
        };
        reader.readAsDataURL(this.selectedFile);
      } else if (fileType.startsWith('video/')) {
        this.previewFileType = 'video';
        this.imagePreview = URL.createObjectURL(this.selectedFile);
      } else {
        this.selectedFile = null;
        this.imagePreview = null;
        this.previewFileType = null;
        alert('Unsupported file type. Please select an image or video.');
      }
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) return;

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('content', form.value.content);
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    const submission$ =
      this.isEditMode && this.postId
        ? this.postService.updatePost(this.postId, formData)
        : this.postService.createPost(formData);

    submission$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        console.error('Failed to save post:', err);
        this.isSubmitting = false;
      },
    });
  }
}

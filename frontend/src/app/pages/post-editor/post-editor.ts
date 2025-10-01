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
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.isEditMode || !this.postId) {
      return;
    }

    const formData = new FormData();
    formData.append('content', form.value.content);
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }
    
    this.postService.updatePost(this.postId, formData).subscribe(() => {
      this.router.navigate(['/feed']);
    });
  }

}
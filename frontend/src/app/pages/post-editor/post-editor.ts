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
import { MatToolbarModule } from '@angular/material/toolbar';

import { QuillModule } from 'ngx-quill';

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
    MatToolbarModule,
    QuillModule
  ],
  templateUrl: './post-editor.html',
  styleUrl: './post-editor.scss',
})
export class PostEditor implements OnInit {
  isEditMode = false;
  postId: number | null = null;
  post: Post | null = null;

  isSubmitting = false;

  // Quill setup
  editorContent: string = '';
  quillRef: any;  // Holds the Quill instance
  quillModules = {  // Direct modules object (no nested 'modules')
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'header': [1, 2, 3, false] }],
        ['link', 'image', 'video'],
      ]
      // No handlers here—attach dynamically below
    }
  };

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
      this.postService.getPost(this.postId).subscribe(postData => {
        this.post = postData;
        this.editorContent = this.post.content || '';
      });
    } else {
      this.isEditMode = false;
      this.post = { title: '' } as Post;
    }
  }

  // Called when Quill editor is fully initialized
  editorCreated(quill: any) {
    this.quillRef = quill;
    const toolbar = this.quillRef.getModule('toolbar');

    // Attach image handler: Trigger file input for images
    toolbar.addHandler('image', () => {
      console.log('Image button clicked!');  // For debugging
      const input = document.getElementById('editor-media-input') as HTMLInputElement;
      if (input) {
        input.accept = 'image/*';
        input.click();
      }
    });

    // Attach video handler: Trigger file input for videos
    toolbar.addHandler('video', () => {
      console.log('Video button clicked!');  // For debugging
      const input = document.getElementById('editor-media-input') as HTMLInputElement;
      if (input) {
        input.accept = 'video/*';
        input.click();
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.editorContent.trim()) {
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('content', this.editorContent);

    const submission$ = (this.isEditMode && this.postId)
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

  handleEditorMediaUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // Get current selection (focus editor if needed)
    const range = this.quillRef.getSelection(true);

    this.postService.uploadMedia(formData).subscribe({
      next: (response: any) => {
        const url = response.url;
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';

        if (fileType === 'image') {
          // Insert image embed
          this.quillRef.insertEmbed(range.index, 'image', url);
          this.quillRef.setSelection(range.index + 1, 0, 'user');  // Cursor after image
        } else {
          console.log("hona mmppll,,",url);
          
          // Insert video as HTML for native playback (Quill's 'video' is for iframes)
         // const videoHtml = `<video src="${url}" controls style="max-width: 100%; height: auto;" class="ql-video-embed"></video>`;
         // this.quillRef.clipboard.dangerouslyPasteHTML(range.index, videoHtml, 'user');
          this.quillRef.insertEmbed(range.index, 'video', url);
          // Approximate cursor position after video (length of HTML)
          this.quillRef.setSelection(range.index + 1, 0, 'user');
        }
      },
      error: (err) => {
        console.error('Media upload failed:', err);
        // Optionally show user toast/alert
      }
    });

    input.value = '';  // Reset input
  }

  // Removed unused mediaHandler (now handled in editorCreated)
  // Removed commented-out methods (onFileSelected, etc.)—add back if needed
}
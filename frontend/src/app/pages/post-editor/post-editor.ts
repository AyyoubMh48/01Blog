import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post';
import { Post } from '../../models/post';
import { forkJoin } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { QuillModule } from 'ngx-quill';
import Quill from 'quill';

// Configure Quill to allow blob URLs (for local preview)
const Link = Quill.import('formats/link') as any;
Link.PROTOCOL_WHITELIST.push('blob');

// Register custom image blot that allows blob URLs
const BlockEmbed = Quill.import('blots/block/embed') as any;
const ImageBlot = Quill.import('formats/image') as any;

class CustomImageBlot extends ImageBlot {
  static create(value: string) {
    const node = super.create(value) as HTMLImageElement;
    // Allow blob URLs without sanitization
    if (value.startsWith('blob:') || value.startsWith('http://') || value.startsWith('https://')) {
      node.setAttribute('src', value);
    }
    return node;
  }

  static sanitize(url: string) {
    // Allow blob URLs for local preview
    if (url.startsWith('blob:')) {
      return url;
    }
    return super.sanitize ? super.sanitize(url) : url;
  }
}

Quill.register(CustomImageBlot, true);

// Register custom video blot for better video handling
class VideoBlot extends BlockEmbed {
  static blotName = 'video';
  static tagName = 'video';
  static className = 'ql-video';
  static scope = Quill.import('parchment').Scope.BLOCK_BLOT;

  static create(value: string) {
    const node = super.create(value) as HTMLVideoElement;
    node.setAttribute('src', value);
    node.setAttribute('controls', 'true');
    node.setAttribute('style', 'max-width: 100%; height: auto;');
    return node;
  }

  static sanitize(url: string) {
    // Allow blob URLs for local preview
    if (url.startsWith('blob:')) {
      return url;
    }
    // For other URLs, return as-is (you can add more validation if needed)
    return url;
  }

  static value(node: HTMLVideoElement) {
    return node.getAttribute('src');
  }
}

Quill.register('formats/video', VideoBlot, true);

interface PendingMedia {
  file: File;
  localUrl: string;
  type: 'image' | 'video';
}

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
export class PostEditor implements OnInit, OnDestroy {
  isEditMode = false;
  postId: number | null = null;
  post: Post | null = null;

  isSubmitting = false;

  // Store pending media files that will be uploaded on publish
  pendingMediaFiles: PendingMedia[] = [];

  // Quill setup
  editorContent: string = '';
  quillRef: any;
  quillModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'header': [1, 2, 3, false] }],
        ['link', 'image', 'video'],
      ]
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

  ngOnDestroy(): void {
    // Clean up object URLs to prevent memory leaks
    this.pendingMediaFiles.forEach(media => {
      URL.revokeObjectURL(media.localUrl);
    });
  }

  editorCreated(quill: any) {
    this.quillRef = quill;
    const toolbar = this.quillRef.getModule('toolbar');

    // Attach image handler
    toolbar.addHandler('image', () => {
      console.log('Image button clicked!');
      const input = document.getElementById('editor-media-input') as HTMLInputElement;
      if (input) {
        input.accept = 'image/*';
        input.setAttribute('data-media-type', 'image');
        input.click();
      }
    });

    // Attach video handler
    toolbar.addHandler('video', () => {
      console.log('Video button clicked!');
      const input = document.getElementById('editor-media-input') as HTMLInputElement;
      if (input) {
        input.accept = 'video/*';
        input.setAttribute('data-media-type', 'video');
        input.click();
      }
    });

    // Listen for content changes to update editorContent
    quill.on('text-change', () => {
      this.editorContent = quill.root.innerHTML;
      console.log('Editor content updated, HTML:', this.editorContent);
    });
  }

  handleEditorMediaUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const mediaType = input.getAttribute('data-media-type') as 'image' | 'video';

    console.log(`Processing ${mediaType}:`, file.name);

    // Create local URL for preview (blob URL)
    const localUrl = URL.createObjectURL(file);
    console.log('Created blob URL:', localUrl);

    // Get current cursor position - force focus if needed
    if (!this.quillRef.hasFocus()) {
      this.quillRef.focus();
    }
    const range = this.quillRef.getSelection(true);
    console.log('Inserting at position:', range.index);

    // Insert media with LOCAL URL into editor for preview
    if (mediaType === 'image') {
      this.quillRef.insertEmbed(range.index, 'image', localUrl, 'user');
      console.log('Image inserted at index:', range.index);
      
      // Verify image was actually inserted
      setTimeout(() => {
        const imgElements = this.quillRef.root.querySelectorAll('img');
        console.log('Total images in editor:', imgElements.length);
        imgElements.forEach((img: HTMLImageElement, i: number) => {
          console.log(`Image ${i}: src="${img.src}", visible=${img.offsetWidth > 0}, width=${img.offsetWidth}, height=${img.offsetHeight}`);
          console.log(`  computed style:`, window.getComputedStyle(img).display);
        });
        
        // Check Quill Delta contents
        const contents = this.quillRef.getContents();
        console.log('Quill Delta contents:', JSON.stringify(contents.ops, null, 2));
      }, 100);
    } else {
      this.quillRef.insertEmbed(range.index, 'video', localUrl, 'user');
      console.log('Video inserted');
    }

    // Add a line break after the media
    this.quillRef.insertText(range.index + 1, '\n', 'user');
    
    // Move cursor after the inserted media
    this.quillRef.setSelection(range.index + 2, 0, 'user');

    // Force update of editorContent
    this.editorContent = this.quillRef.root.innerHTML;
    console.log('Updated editor content length:', this.editorContent.length);

    // Store the file and its local URL for later upload
    this.pendingMediaFiles.push({
      file: file,
      localUrl: localUrl,
      type: mediaType
    });

    console.log('Total pending media files:', this.pendingMediaFiles.length);

    input.value = '';  // Reset input
    input.removeAttribute('data-media-type');
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.editorContent.trim()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Submitting post...');
    console.log('Pending media files:', this.pendingMediaFiles.length);

    this.isSubmitting = true;

    // If there are pending media files, upload them first
    if (this.pendingMediaFiles.length > 0) {
      this.uploadPendingMediaAndSubmit(form);
    } else {
      // No media to upload, submit directly
      this.submitPost(form);
    }
  }

  private uploadPendingMediaAndSubmit(form: NgForm): void {
    console.log('Starting upload of', this.pendingMediaFiles.length, 'media files...');

    // Create upload observables for all pending media
    const uploadObservables = this.pendingMediaFiles.map((media, index) => {
      const formData = new FormData();
      formData.append('file', media.file);
      console.log(`Uploading file ${index + 1}:`, media.file.name);
      return this.postService.uploadMedia(formData);
    });

    // Upload all media files in parallel
    forkJoin(uploadObservables).subscribe({
      next: (responses: any[]) => {
        console.log('All media uploaded successfully:', responses);

        // Replace local URLs with cloud URLs in editor content
        let updatedContent = this.editorContent;

        this.pendingMediaFiles.forEach((media, index) => {
          const cloudUrl = responses[index].url;
          console.log(`Replacing ${media.localUrl} with ${cloudUrl}`);
          
          // Replace the blob URL with the actual cloud URL
          updatedContent = updatedContent.replace(
            new RegExp(media.localUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            cloudUrl
          );
          
          // Clean up blob URL
          URL.revokeObjectURL(media.localUrl);
        });

        this.editorContent = updatedContent;
        console.log('Content updated with cloud URLs');
        
        this.pendingMediaFiles = []; // Clear pending files

        // Now submit the post with cloud URLs
        this.submitPost(form);
      },
      error: (err) => {
        console.error('Media upload failed:', err);
        this.isSubmitting = false;
        alert('Failed to upload media. Please try again.');
      }
    });
  }

  private submitPost(form: NgForm): void {
    console.log('Submitting post to server...');
    console.log('Content length:', this.editorContent.length);

    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('content', this.editorContent);

    const submission$ = (this.isEditMode && this.postId)
      ? this.postService.updatePost(this.postId, formData)
      : this.postService.createPost(formData);

    submission$.subscribe({
      next: () => {
        console.log('Post saved successfully');
        this.isSubmitting = false;
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        console.error('Failed to save post:', err);
        this.isSubmitting = false;
        alert('Failed to save post. Please try again.');
      },
    });
  }
}
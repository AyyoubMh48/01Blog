import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: 'light' | 'dark';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // Check localStorage for a saved theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    this.currentTheme = savedTheme;
    if (savedTheme === 'dark') {
      this.renderer.addClass(document.body, 'dark-mode');
    }
  }

  toggleTheme(): void {
    if (this.currentTheme === 'light') {
      this.renderer.addClass(document.body, 'dark-mode');
      this.currentTheme = 'dark';
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
      this.currentTheme = 'light';
    }
    localStorage.setItem('theme', this.currentTheme);
  }

  isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }
}
/**
 * Presentation Controller for SIH Pitch PPT Deck
 * Supports Keyboard navigation, Timer, Fullscreen, Presenter Notes, and PDF Print
 */

class PresentationDeckController {
  constructor() {
    this.slides = document.querySelectorAll('.slide');
    this.currentSlideIndex = 0;
    this.notesDrawer = document.getElementById('notes-drawer');
    this.notesContentEl = document.getElementById('notes-content');
    this.slideNumberEl = document.getElementById('slide-counter');
    this.timerEl = document.getElementById('presentation-timer');
    this.timerSeconds = 0;
    this.timerInterval = null;

    this.init();
  }

  init() {
    this.showSlide(0);
    this.bindEvents();
    this.startTimer();
  }

  bindEvents() {
    // Keyboard Controls
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        this.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        this.prevSlide();
      } else if (e.key.toLowerCase() === 'f') {
        this.toggleFullScreen();
      } else if (e.key.toLowerCase() === 'p') {
        this.toggleNotes();
      } else if (e.key.toLowerCase() === 'h') {
        window.location.href = 'index.html';
      }
    });

    // Button controls
    document.getElementById('btn-prev')?.addEventListener('click', () => this.prevSlide());
    document.getElementById('btn-next')?.addEventListener('click', () => this.nextSlide());
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => this.toggleFullScreen());
    document.getElementById('btn-notes')?.addEventListener('click', () => this.toggleNotes());
    document.getElementById('btn-print-pdf')?.addEventListener('click', () => window.print());
  }

  showSlide(index) {
    if (index < 0 || index >= this.slides.length) return;

    this.slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === index);
    });

    this.currentSlideIndex = index;
    document.querySelectorAll('.slide-number-pill').forEach(el => {
      el.textContent = `Slide ${index + 1} / ${this.slides.length}`;
    });

    // Update presenter notes
    const activeSlide = this.slides[index];
    const notes = activeSlide.getAttribute('data-notes') || 'No speaker notes for this slide.';
    if (this.notesContentEl) {
      this.notesContentEl.innerHTML = notes;
    }
  }

  nextSlide() {
    if (this.currentSlideIndex < this.slides.length - 1) {
      this.showSlide(this.currentSlideIndex + 1);
    }
  }

  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.showSlide(this.currentSlideIndex - 1);
    }
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  toggleNotes() {
    if (this.notesDrawer) {
      this.notesDrawer.classList.toggle('open');
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
      const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
      if (this.timerEl) {
        this.timerEl.textContent = `⏱️ ${mins}:${secs}`;
      }
    }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.deck = new PresentationDeckController();
});

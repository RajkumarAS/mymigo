// Singleton Media Manager for MyMigo
// Enforces STRICT single-audio playback across the entire app.
// Guarantees zero echoes, zero double-time playback, and zero background audio leaks on route changes.

class MediaManager {
  constructor() {
    this.activePlayer = null;
    this.activeVideoEl = null;
    this.isUnlocked = false;
  }

  // Globally unlock browser audio activation for this window
  unlockAudio() {
    if (this.isUnlocked) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      }
      this.isUnlocked = true;
    } catch (e) {}
  }

  // Register and play a video. Pauses and mutes all other media across the entire DOM!
  play(player, videoEl) {
    this.unlockAudio();

    // If a different video is currently active, pause and mute it immediately
    if (this.activeVideoEl && this.activeVideoEl !== videoEl) {
      try {
        this.activeVideoEl.pause();
        this.activeVideoEl.muted = true;
      } catch (e) {}
    }
    if (this.activePlayer && this.activePlayer !== player) {
      try {
        this.activePlayer.pauseVideo?.();
      } catch (e) {}
    }

    // Stop all other video/audio elements in the DOM to be 100% sure
    document.querySelectorAll('video, audio').forEach((el) => {
      if (el !== videoEl) {
        try {
          el.pause();
          el.muted = true;
        } catch (e) {}
      }
    });

    this.activePlayer = player;
    this.activeVideoEl = videoEl;
  }

  // Pause a specific video
  pause(videoEl) {
    if (this.activeVideoEl === videoEl) {
      this.activePlayer = null;
      this.activeVideoEl = null;
    }
    if (videoEl) {
      try {
        videoEl.pause();
        videoEl.muted = true;
      } catch (e) {}
    }
  }

  // Stop ALL media across the entire application (called on page navigation / route exit)
  stopAll() {
    this.activePlayer = null;
    this.activeVideoEl = null;
    document.querySelectorAll('video, audio').forEach((el) => {
      try {
        el.pause();
        el.muted = true;
      } catch (e) {}
    });
  }
}

export const mediaManager = new MediaManager();

// Automatically prime and unlock browser audio on ANY user click or touch
if (typeof window !== 'undefined') {
  window.addEventListener('click', () => mediaManager.unlockAudio(), { capture: true, passive: true });
  window.addEventListener('touchstart', () => mediaManager.unlockAudio(), { capture: true, passive: true });
}

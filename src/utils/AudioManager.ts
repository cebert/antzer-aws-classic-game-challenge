import Phaser from 'phaser';

export class AudioManager {
  private scene: Phaser.Scene;
  private soundCache: Map<string, Phaser.Sound.BaseSound | null> = new Map();
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Safely adds a sound to the scene
   */
  add(key: string, config?: Phaser.Types.Sound.SoundConfig): Phaser.Sound.BaseSound {
    try {
      // Check if sound exists in cache
      if (!this.scene.cache.audio.exists(key)) {
        console.warn(`Audio key "${key}" not found in cache`);
        return this.createDummySound();
      }
      
      // Try to create the sound
      const sound = this.scene.sound.add(key, config);
      this.soundCache.set(key, sound);
      return sound;
    } catch (error) {
      console.warn(`Failed to add sound "${key}":`, error);
      return this.createDummySound();
    }
  }

  /**
   * Safely plays a sound
   */
  play(key: string, config?: Phaser.Types.Sound.SoundConfig): Phaser.Sound.BaseSound {
    try {
      // Check if we've already created this sound
      let sound = this.soundCache.get(key);
      
      // If not, try to create it
      if (!sound) {
        sound = this.add(key, config);
      }
      
      // Try to play the sound
      if (sound && sound.play) {
        sound.play(config);
      }
      
      return sound;
    } catch (error) {
      console.warn(`Failed to play sound "${key}":`, error);
      return this.createDummySound();
    }
  }

  /**
   * Safely stops a sound
   */
  stop(key: string): void {
    try {
      const sound = this.soundCache.get(key);
      if (sound && sound.stop) {
        sound.stop();
      }
    } catch (error) {
      console.warn(`Failed to stop sound "${key}":`, error);
    }
  }

  /**
   * Creates a dummy sound object that implements the BaseSound interface
   * but doesn't do anything when methods are called
   */
  private createDummySound(): Phaser.Sound.BaseSound {
    // Create a minimal implementation of BaseSound that does nothing
    return {
      play: () => { return this; },
      stop: () => {},
      pause: () => {},
      resume: () => {},
      isPlaying: false,
      isPaused: false,
      loop: false,
      volume: 1,
      seek: 0,
      duration: 0,
      totalDuration: 0,
      setVolume: () => { return this; },
      setSeek: () => { return this; },
      setLoop: () => { return this; },
      setMute: () => { return this; },
      setRate: () => { return this; },
      setDetune: () => { return this; },
      setPosition: () => { return this; },
      setPan: () => { return this; },
      on: () => { return this; },
      addMarker: () => { return this; },
      removeMarker: () => {},
      clearMarkers: () => {},
      key: 'dummy-sound',
      mute: false,
      rate: 1,
      detune: 0,
      markers: {},
      currentMarker: null,
      pan: 0,
      scene: this.scene,
      manager: this.scene.sound,
      events: this.scene.events
    } as unknown as Phaser.Sound.BaseSound;
  }
}
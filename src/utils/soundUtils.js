// Sound notification utilities for browser
class SoundNotification {
  constructor() {
    this.audioContext = null;
    this.audioBuffer = null;
    this.isSupported = this.checkSupport();
  }

  // Check if Web Audio API is supported
  checkSupport() {
    return 'AudioContext' in window || 'webkitAudioContext' in window;
  }

  // Initialize audio context
  async init() {
    if (!this.isSupported) {
      console.warn('[SOUND] Web Audio API not supported');
      return false;
    }

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await this.createNotificationSound();
      return true;
    } catch (error) {
      console.error('[SOUND] Failed to initialize audio context:', error);
      return false;
    }
  }

  // Create a simple notification sound (beep)
  async createNotificationSound() {
    try {
      // Create different sounds for different notification types
      const sampleRate = this.audioContext.sampleRate;
      
      // Success sound: ascending two-tone
      this.successBuffer = this.createTwoToneSound(sampleRate, 800, 1000, 0.4);
      
      // Error sound: descending two-tone
      this.errorBuffer = this.createTwoToneSound(sampleRate, 1000, 600, 0.5);
      
      // Warning sound: three-tone alert
      this.warningBuffer = this.createThreeToneSound(sampleRate, 600, 800, 1000, 0.45);
      
      // Info sound: single soft beep
      this.infoBuffer = this.createSingleToneSound(sampleRate, 800, 0.3);
      
      console.log('[SOUND] All notification sounds created successfully');
    } catch (error) {
      console.error('[SOUND] Failed to create notification sounds:', error);
    }
  }

  // Create single tone sound
  createSingleToneSound(sampleRate, frequency, volume = 0.3) {
    const duration = 0.3;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
    }
    
    return buffer;
  }

  // Create two-tone sound (ascending or descending)
  createTwoToneSound(sampleRate, freq1, freq2, volume = 0.3) {
    const duration = 0.4;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    const halfSamples = Math.floor(samples / 2);
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2.5);
      
      let frequency;
      if (i < halfSamples) {
        frequency = freq1;
      } else {
        frequency = freq2;
      }
      
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
    }
    
    return buffer;
  }

  // Create three-tone alert sound
  createThreeToneSound(sampleRate, freq1, freq2, freq3, volume = 0.3) {
    const duration = 0.6;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    const thirdSamples = Math.floor(samples / 3);
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2);
      
      let frequency;
      if (i < thirdSamples) {
        frequency = freq1;
      } else if (i < thirdSamples * 2) {
        frequency = freq2;
      } else {
        frequency = freq3;
      }
      
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
    }
    
    return buffer;
  }

  // Play notification sound
  async play(type = 'default') {
    if (!this.isSupported || !this.audioContext) {
      console.warn('[SOUND] Audio not available');
      return;
    }

    try {
      // Resume audio context if suspended (browser policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      let buffer;
      switch (type) {
        case 'success':
          buffer = this.successBuffer;
          break;
        case 'error':
        case 'critical':
          buffer = this.errorBuffer;
          break;
        case 'warning':
          buffer = this.warningBuffer;
          break;
        case 'info':
          buffer = this.infoBuffer;
          break;
        default:
          buffer = this.infoBuffer;
      }

      if (!buffer) {
        console.warn('[SOUND] Buffer not available for type:', type);
        return;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      
      source.start(0);
      console.log(`[SOUND] Playing ${type} notification sound`);
      
      // Cleanup
      source.onended = () => {
        source.disconnect();
      };
    } catch (error) {
      console.error('[SOUND] Failed to play sound:', error);
    }
  }

  // Play different sounds for different notification types
  async playSuccess() {
    await this.play('success');
  }

  async playError() {
    await this.play('error');
  }

  async playWarning() {
    await this.play('warning');
  }

  async playInfo() {
    await this.play('info');
  }

  // Cleanup
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioBuffer = null;
  }
}

// Create singleton instance
const soundNotification = new SoundNotification();

// Initialize on module load
soundNotification.init();

export default soundNotification;

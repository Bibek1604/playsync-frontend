/**
 * Sound Notification Utility
 * Plays subtle sounds for different notification types
 */

class SoundManager {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        // AudioContext will be initialized on first use to comply with browser policies
    }

    /**
     * Initialize AudioContext if not already done
     */
    private initAudioContext() {
        if (typeof window !== 'undefined' && !this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    /**
     * Enable or disable sounds
     */
    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    /**
     * Play a beep sound with specific frequency and duration
     */
    private playBeep(frequency: number, duration: number, volume: number = 0.3) {
        this.initAudioContext();
        if (!this.enabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Failed to play notification sound:', error);
        }
    }

    /**
     * Success sound - Pleasant ascending tone
     */
    success() {
        this.initAudioContext();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        this.playBeep(523.25, 0.1, 0.2); // C5
        setTimeout(() => this.playBeep(659.25, 0.15, 0.25), 80); // E5
    }

    /**
     * Error sound - Alert tone
     */
    error() {
        this.initAudioContext();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        this.playBeep(329.63, 0.15, 0.3); // E4
        setTimeout(() => this.playBeep(293.66, 0.2, 0.3), 100); // D4
    }

    /**
     * Info sound - Neutral single tone
     */
    info() {
        this.initAudioContext();
        this.playBeep(440, 0.15, 0.2); // A4
    }

    /**
     * Warning sound - Double beep
     */
    warning() {
        this.initAudioContext();
        this.playBeep(493.88, 0.1, 0.25); // B4
        setTimeout(() => this.playBeep(493.88, 0.1, 0.25), 150);
    }

    /**
     * Generic notification sound
     */
    notification() {
        this.initAudioContext();
        this.playBeep(587.33, 0.12, 0.2); // D5
    }
}

// Export singleton instance
export const soundManager = new SoundManager();

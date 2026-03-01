/**
 * Notification Sound Utility
 * Plays a pleasant notification sound when new notifications arrive
 */

// Create a notification sound using Web Audio API
export class NotificationSound {
    private audioContext: AudioContext | null = null;
    private isEnabled = true;

    constructor() {
        // Initialize AudioContext on first user interaction (browser requirement)
        if (typeof window !== 'undefined') {
            this.initAudioContext();
        }
    }

    private initAudioContext() {
        try {
            // @ts-expect-error - AudioContext may have webkit prefix in Safari
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    /**
     * Play a pleasant notification sound
     */
    async play() {
        if (!this.isEnabled || !this.audioContext) {
            return;
        }

        try {
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const now = this.audioContext.currentTime;

            // Create oscillator for the main tone
            const oscillator1 = this.audioContext.createOscillator();
            const gainNode1 = this.audioContext.createGain();

            // Create second oscillator for harmony
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode2 = this.audioContext.createGain();

            // Connect nodes
            oscillator1.connect(gainNode1);
            oscillator2.connect(gainNode2);
            gainNode1.connect(this.audioContext.destination);
            gainNode2.connect(this.audioContext.destination);

            // Set frequencies (pleasant notification tones)
            oscillator1.frequency.value = 800; // E5
            oscillator2.frequency.value = 1000; // B5

            // Set waveform type
            oscillator1.type = 'sine';
            oscillator2.type = 'sine';

            // Create envelope for smooth sound
            gainNode1.gain.setValueAtTime(0, now);
            gainNode1.gain.linearRampToValueAtTime(0.15, now + 0.01); // Quick attack
            gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Smooth decay

            gainNode2.gain.setValueAtTime(0, now);
            gainNode2.gain.linearRampToValueAtTime(0.1, now + 0.01);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            // Play the sound
            oscillator1.start(now);
            oscillator2.start(now);
            oscillator1.stop(now + 0.3);
            oscillator2.stop(now + 0.3);

        } catch (error) {
            console.warn('Failed to play notification sound:', error);
        }
    }

    /**
     * Alternative: Play a double-beep notification sound
     */
    async playDoubleBeep() {
        if (!this.isEnabled || !this.audioContext) {
            return;
        }

        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const now = this.audioContext.currentTime;

            // First beep
            this.createBeep(now, 800, 0.15);
            // Second beep (slightly higher pitch)
            this.createBeep(now + 0.15, 1000, 0.15);

        } catch (error) {
            console.warn('Failed to play notification sound:', error);
        }
    }

    private createBeep(startTime: number, frequency: number, duration: number) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    /**
     * Enable or disable notification sounds
     */
    setEnabled(enabled: boolean) {
        this.isEnabled = enabled;
        if (typeof window !== 'undefined') {
            localStorage.setItem('notificationSoundEnabled', String(enabled));
        }
    }

    /**
     * Check if sounds are enabled
     */
    getEnabled(): boolean {
        if (typeof window === 'undefined') return true;
        const stored = localStorage.getItem('notificationSoundEnabled');
        return stored === null ? true : stored === 'true';
    }
}

// Singleton instance
let notificationSound: NotificationSound | null = null;

/**
 * Get the notification sound instance
 */
export function getNotificationSound(): NotificationSound {
    if (!notificationSound) {
        notificationSound = new NotificationSound();
    }
    return notificationSound;
}

/**
 * Play notification sound (convenience function)
 */
export function playNotificationSound() {
    getNotificationSound().play();
}

/**
 * Play double-beep notification sound (convenience function)
 */
export function playNotificationBeep() {
    getNotificationSound().playDoubleBeep();
}

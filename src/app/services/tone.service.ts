import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToneService {
  audioContext: AudioContext;

  constructor() {
    this.audioContext = new window.AudioContext();
  }

  /**
   * Make a tone sound.
   * @param frequency - 3200 on success, 450 on failure
   * @param length - 80 msec
   */
  make(frequency: number, length: number) {
    const oscillator = this.audioContext.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.type = 'sawtooth';
    oscillator.start();
    oscillator.connect(this.audioContext.destination);

    setTimeout(() => {
      oscillator.disconnect(this.audioContext.destination);
      oscillator.stop();
    }, length);
  }

}

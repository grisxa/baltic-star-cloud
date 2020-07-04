import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToneService {
  audioContext: AudioContext;
  gainNode: GainNode;

  constructor() {
    // @ts-ignore
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    // set the maximum volume
    this.gainNode.gain.value = this.gainNode.gain.maxValue;
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
    oscillator.connect(this.gainNode);

    setTimeout(() => {
      oscillator.disconnect(this.gainNode);
      oscillator.stop();
    }, length);
  }

}

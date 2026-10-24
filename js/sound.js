/*
SoundFile
  small replacement for processing.sound.SoundFile built on the Web Audio API
  Autor: Korel Öztekin
*/

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// MUTE: while an online client catches up on many frames at once
let soundMuted = false;

class SoundFile {

  constructor(path) {
    this.buffer = null;
    this.sources = new Set();
    this.offset = 0;
    this.startedAt = 0;

    //LOAD: async, play() does nothing until the file is decoded
    fetch(path)
      .then((response) => response.arrayBuffer())
      .then((data) => audioCtx.decodeAudioData(data))
      .then((buffer) => { this.buffer = buffer; })
      .catch((err) => console.warn("Could not load sound", path, err));
  }

  start(rate, amp, loop) {
    if (!this.buffer || soundMuted) {
      return;
    }
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = this.buffer;
    source.playbackRate.value = rate;
    source.loop = loop;
    gain.gain.value = amp;
    source.connect(gain).connect(audioCtx.destination);
    source.onended = () => this.sources.delete(source);

    //RESUME: loops continue where pause() stopped them
    const from = loop ? this.offset % this.buffer.duration : 0;
    source.start(0, from);
    this.startedAt = audioCtx.currentTime - from;
    this.sources.add(source);
  }

  play(rate = 1, amp = 1) {
    this.start(rate, amp, false);
  }

  loop(rate = 1, amp = 1) {
    this.start(rate, amp, true);
  }

  isPlaying() {
    return this.sources.size > 0;
  }

  stopSources() {
    for (const source of this.sources) {
      source.onended = null;
      source.stop();
    }
    this.sources.clear();
  }

  pause() {
    if (this.isPlaying()) {
      this.offset = audioCtx.currentTime - this.startedAt;
      this.stopSources();
    }
  }

  stop() {
    this.stopSources();
    this.offset = 0;
  }
}

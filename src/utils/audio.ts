/**
 * Web Audio Synthesizer and Natural Cute SpeechSynthesis Engine for EastAi
 */

let audioCtx: AudioContext | null = null;

export function ensureAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// Play melodic sine chime tones
export function playChime(frequencies: number[] = [440, 660, 880], durations: number = 0.12) {
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * durations);

      gain.gain.setValueAtTime(0.0001, now + idx * durations);
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * durations + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * durations + durations * 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * durations);
      osc.stop(now + idx * durations + durations * 1.8);
    });
  } catch {
    // Audio playback blocked or unavailable
  }
}

// Special sound effects with cute voice announcements
export function playConnectedSound(voiceEnabled = true, lang: 'taglish' | 'english' = 'taglish') {
  playChime([523.25, 659.25, 783.99, 1046.5], 0.08); // Ascending harmonic chime
  if (voiceEnabled) {
    const phrase = lang === 'taglish' ? 'Connected na po ang drone!' : 'Drone signal connected!';
    setTimeout(() => {
      queueSpeech(phrase, voiceEnabled);
    }, 250);
  }
}

export function playSensorLandedSound(voiceEnabled = true, lang: 'taglish' | 'english' = 'taglish') {
  playChime([392.0, 523.25, 659.25], 0.1); // Crisp contact chord
  if (voiceEnabled) {
    const phrase = lang === 'taglish' ? 'Sensor landed na sa lupa! Nagbabasa ng datos...' : 'Sensor landed! Reading telemetry...';
    setTimeout(() => {
      queueSpeech(phrase, voiceEnabled);
    }, 200);
  }
}

export function playAlertSound() {
  playChime([587.33, 440.0], 0.14); // Notice tone
}

// Voice synthesis helpers
let cachedCuteVoice: SpeechSynthesisVoice | null = null;

export function loadBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Look for native Filipino / Tagalog voices (fil-PH, tl-PH)
  const filipinoVoice = voices.find(
    (v) => /fil|tl[-_]PH/i.test(v.lang) || /filipino|tagalog/i.test(v.name)
  );
  if (filipinoVoice) {
    cachedCuteVoice = filipinoVoice;
    return cachedCuteVoice;
  }

  // 2. Look for English (Philippines)
  const phEnVoice = voices.find((v) => /en[-_]PH/i.test(v.lang));
  if (phEnVoice) {
    cachedCuteVoice = phEnVoice;
    return cachedCuteVoice;
  }

  // 3. Look for warm, clear female / pleasant voices
  const clearFemale = voices.find((v) =>
    /female|samantha|zira|karen|victoria|tessa|moira|google.*(filipino|philippines|female)/i.test(
      v.name
    )
  );
  if (clearFemale) {
    cachedCuteVoice = clearFemale;
    return cachedCuteVoice;
  }

  // 4. Fallback to default en voice or first voice
  cachedCuteVoice = voices.find((v) => /^en/i.test(v.lang)) || voices[0] || null;
  return cachedCuteVoice;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadBestVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    loadBestVoice();
  };
}

export function queueSpeech(text: string, voiceEnabled = true) {
  if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
    return;
  }

  try {
    ensureAudioContext();
    const voice = cachedCuteVoice || loadBestVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'fil-PH';
    } else {
      utterance.lang = 'fil-PH';
    }
    // Natural cheerful and cute pitch without sounding distorted or chipmunk
    utterance.pitch = 1.15;
    utterance.rate = 0.98;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch {
    // TTS error handling
  }
}

export function speakImmediate(text: string, voiceEnabled = true) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    queueSpeech(text, voiceEnabled);
  } catch {
    // TTS cancel or speak error
  }
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}



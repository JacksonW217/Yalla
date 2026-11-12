/**
 * Text-to-speech using the device's built-in Arabic voice. These voices speak
 * formal / standard Arabic, not an Egyptian accent, and the app says so.
 */
let cached: SpeechSynthesisVoice | undefined;

function pick(): SpeechSynthesisVoice | undefined {
  if (typeof speechSynthesis === 'undefined') return undefined;
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ar'));
  // An Egyptian voice if the device has one, otherwise any Arabic voice.
  return voices.find((v) => /eg/i.test(v.lang)) ?? voices.find((v) => v.localService) ?? voices[0];
}

export function arabicVoice(): SpeechSynthesisVoice | undefined {
  cached = cached ?? pick();
  return cached;
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    cached = pick();
    window.dispatchEvent(new Event('yalla-voices'));
  });
}

export const speechSupported = () => typeof speechSynthesis !== 'undefined';

export function speak(text: string, rate = 0.8) {
  if (!speechSupported()) return;
  speechSynthesis.cancel();
  // Strip joiners and placeholder dots that are only there for display.
  const u = new SpeechSynthesisUtterance(text.replace(/[‍.…?؟]/g, ' ').trim());
  const v = arabicVoice();
  if (v) u.voice = v;
  u.lang = v?.lang ?? 'ar-SA';
  u.rate = rate;
  speechSynthesis.speak(u);
}

// @ts-nocheck
class SpeechSynthesisSingleton {
  private static instance: SpeechSynthesisSingleton | null = null;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  private constructor() {
    // Initialize the speech synthesis object
    this.synth = window?.speechSynthesis || window?.webkitSpeechSynthesis;
    this.synth.onvoiceschanged = this.updateVoices;
    this.updateVoices(); // Call the updateVoices function initially
  }

  private updateVoices = () => {
    this.voices = this.synth?.getVoices();
  };

  public static getInstance(): SpeechSynthesisSingleton {
    if (!SpeechSynthesisSingleton.instance)
      SpeechSynthesisSingleton.instance = new SpeechSynthesisSingleton();

    return SpeechSynthesisSingleton.instance;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public speak(
    text: string,
    onSpeechStart?: () => void,
    onSpeechEnd?: () => void
  ): void {
    if (!this.synth) {
      console.error("SpeechSynthesis not supported");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Find the selected voice by name
    if (this.voices.length) {
      const selectedVoice = this.voices
        .filter((item) => item.lang === "zh-CN")
        .find(
          (item) =>
            item.name.includes("Xiaoxiao") || item.name.includes("Xiaoyi")
        );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        utterance.voice = this.voices.filter(
          (item) => item.lang === "zh-CN"
        )[0];
        console.warn("Selected voice not found");
      }
      // utterance.voice = this.voices.filter(item => item.lang === 'zh-CN')[4];
    }

    if (onSpeechEnd) {
      utterance.onend = onSpeechEnd;
    }

    if (onSpeechStart) {
      utterance.onstart = () => {
        setTimeout(() => {
          onSpeechStart()
        }, 1500)
      };
    }

    this.synth.speak(utterance);
  }
}

export default SpeechSynthesisSingleton;

// Shared Web Speech API type declarations for RYVYNN
// Referenced by all voice-enabled components

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((e: Event) => void) | null;
  onend: ((e: Event) => void) | null;
  onerror: ((e: ISpeechRecognitionErrorEvent) => void) | null;
  onresult: ((e: ISpeechRecognitionResultEvent) => void) | null;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ISpeechRecognitionResultEvent extends Event {
  results: ISpeechRecognitionResultList;
  resultIndex: number;
}

interface ISpeechRecognitionResultList {
  length: number;
  item(index: number): ISpeechRecognitionResultItem;
  [index: number]: ISpeechRecognitionResultItem;
}

interface ISpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string; confidence: number };
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
    ryvynnNotify?: (msg: string) => void;
  }
}

export {};

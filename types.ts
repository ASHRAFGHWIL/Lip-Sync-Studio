export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SCRIPT_WRITER = 'SCRIPT_WRITER',
  VOICE_STUDIO = 'VOICE_STUDIO',
  AVATAR_STUDIO = 'AVATAR_STUDIO',
  LIVE_REHEARSAL = 'LIVE_REHEARSAL'
}

export interface ScriptData {
  title: string;
  content: string;
}

export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr'
}

export interface GeneratedAudio {
  url: string;
  text: string;
  voice: VoiceName;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}


export enum Language {
  FR = 'Français',
  EN = 'Anglais',
  ES = 'Espagnol',
  AR = 'Arabe Classique',
  DARIJA = 'Arabe Darija (Marocain)',
  PL = 'Polonais'
}

export enum Tone {
  MARKETING = 'Marketing Hyper-actif',
  PRO = 'Professionnel & Formel',
  CALM = 'Calme & Relaxant',
  FRIENDLY = 'Amical & Chaleureux',
  MYSTERY = 'Mystérieux & Narrateur',
  ENERGETIC = 'Energique & Sportif',
  CHILD = 'Enfantin & Joyeux',
  NEWS = 'Journaliste TV',
  LUXURY = 'Luxe & Élégance',
  CINEMATIC = 'Cinématique & Épique',
  WHISPER = 'Chuchotement / ASMR',
  SARCASTIC = 'Sarcasme & Humour Noir',
  SAD = 'Triste & Mélancolique',
  ANGRY = 'Colère & Tension',
  STORYTELLER = 'Conteur de Contes',
  RADIO_DJ = 'Animateur Radio FM'
}

export enum ReadingStyle {
  NATURAL = 'Naturel',
  THEATRICAL = 'Théâtral',
  RADIO = 'Radio / Studio',
  STREET = 'Rue / Spontané'
}

export interface ToneMetadata {
  id: string;
  label: string;
  description: string;
  icon: string;
  isCustom?: boolean;
}

export interface VoicePersona {
  id: string;
  name: string;
  gender: 'M' | 'F';
  geminiVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  description: string;
  supportedLanguages: Language[];
  previewText: string;
  avatarUrl: string;
}

export interface ScriptSegment {
  id: string;
  text: string;
  voiceId: string;
  toneId: string;
  speed: number;
  style?: ReadingStyle;
  breathIntensity?: number; // 0 to 1
  hesitationFrequency?: number; // 0 to 1
  audioUrl?: string;
  isGenerating?: boolean;
}

export interface GeneratedAudio {
  id: string;
  text: string;
  language: Language;
  toneLabel: string;
  voiceName: string;
  speed: number;
  autoPitchDisabled: boolean;
  timestamp: Date;
  blob: Blob;
  url: string;
}

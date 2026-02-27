
import { Language, Tone, VoicePersona, ToneMetadata } from './types';

export const VOICE_PERSONAS: VoicePersona[] = [
  // DARIJA MAROCAIN (EXTENDED & ULTRA-REALISTIC)
  { 
    id: 'dr-1', name: 'Youssef', gender: 'M', geminiVoice: 'Puck', 
    description: 'Authentique • Médina • Chaleureux', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Salam! Ana Youssef, kankhelli l-message dyalk iwsal l-9elb b-dakchi li khassou i-t-gal.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'
  },
  { 
    id: 'dr-2', name: 'Zineb', gender: 'F', geminiVoice: 'Zephyr', 
    description: 'Moderne • Urbaine • Dynamique', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Bonjour! Ana Zineb. Sout dyali fih dik l-lamssa l-moderna dyal bnat casa.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
  },
  { 
    id: 'dr-5', name: 'Haj Driss', gender: 'M', geminiVoice: 'Fenrir', 
    description: 'Sagesse • Profond • Ancien', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Aweldi, sma3 l-had l-hader. L-klem l-mouzin i-khrej men l-9elb.',
    avatarUrl: 'https://images.unsplash.com/photo-1542345812-d98b5cd6cf98?w=400&h=400&fit=crop'
  },
  { 
    id: 'dr-6', name: 'Khadija', gender: 'F', geminiVoice: 'Charon', 
    description: 'Traditionnelle • Conteuse • Douce', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Ahlan wa sahlan. Khadija m3akom, n-3awed likom 9issat had l-mouchrou3.',
    avatarUrl: 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=400&h=400&fit=crop'
  },
  { 
    id: 'dr-3', name: 'Mehdi', gender: 'M', geminiVoice: 'Puck', 
    description: 'Style "Street" • Jeune • Direct', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Wesh! M3ak Mehdi. Ila kounti baghi sout dyal l-wa9i3, ana hna.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'
  },
  { 
    id: 'dr-4', name: 'Salma', gender: 'F', geminiVoice: 'Kore', 
    description: 'Corporate • Radio • Élegante', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Salma m3akom, l-sout l-ihtirafi li ka-irafe9 l-branda dyalkom.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
  },
  { 
    id: 'dr-7', name: 'Amine', gender: 'M', geminiVoice: 'Charon', 
    description: 'Sérieux • Narrateur • Profond', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Amine m3akom. Sout dyali i-khlik t-fhem l-mouhtawa b-souhoula.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
  },
  { 
    id: 'dr-8', name: 'Leila', gender: 'F', geminiVoice: 'Fenrir', 
    description: 'Autoritaire • Forte • Directe', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Leila hna. Sout dyali fih l-9ouwa w l-ihtirafiya.',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop'
  },
  { 
    id: 'dr-9', name: 'Simo', gender: 'M', geminiVoice: 'Zephyr', 
    description: 'Cool • Relax • Naturel', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Simo m3akom. Sout dyali khfif w d-drif, bhal ila kalsin f-9hiwa.',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop'
  },
  { 
    id: 'dr-10', name: 'Hiba', gender: 'F', geminiVoice: 'Kore', 
    description: 'Influenceuse • Jeune • Pétillante', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Coucou! Hiba m3akom. Sout dyali fih l-vibe dyal l-influencers dyal t-tok.',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop'
  },
  { 
    id: 'dr-11', name: 'Omar', gender: 'M', geminiVoice: 'Fenrir', 
    description: 'Cinéma • Trailer • Épique', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Omar m3akom. Sout dyali i-khlik t-3ich l-film 9bel ma i-bda.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'
  },
  { 
    id: 'dr-12', name: 'Fatima', gender: 'F', geminiVoice: 'Charon', 
    description: 'Maternelle • Douce • Bienveillante', 
    supportedLanguages: [Language.DARIJA], 
    previewText: 'Ahlan b-wlidi. Fatima m3akom, sout dyali i-fekkrek f-l-hanan dyal l-walida.',
    avatarUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop'
  },

  // POLONAIS
  { 
    id: 'pl-1', name: 'Marek', gender: 'M', geminiVoice: 'Puck', 
    description: 'Głęboki • Lektor', 
    supportedLanguages: [Language.PL], 
    previewText: 'Dzień dobry, jestem Marek. Mój głos nada powagi Twoim projektom.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
  },
  { 
    id: 'pl-2', name: 'Agnieszka', gender: 'F', geminiVoice: 'Zephyr', 
    description: 'Naturalna • Ciepła', 
    supportedLanguages: [Language.PL], 
    previewText: 'Cześć, mam na imię Agnieszka. Pomogę Ci stworzyć przyjazny przekaz.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
  },

  // FRANÇAIS
  { 
    id: 'fr-1', name: 'Léa', gender: 'F', geminiVoice: 'Zephyr', 
    description: 'Claire • Podcast', 
    supportedLanguages: [Language.FR], 
    previewText: 'Bonjour, je suis Léa. Ma voix est idéale pour vos projets de bien-être.',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
  },
  { 
    id: 'fr-2', name: 'Thomas', gender: 'M', geminiVoice: 'Puck', 
    description: 'Grave • Institutionnel', 
    supportedLanguages: [Language.FR], 
    previewText: 'Bonjour, je suis Thomas. Prêtons à vos mots la force qu\'ils méritent.',
    avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop'
  }
];

export const TONE_METADATA: ToneMetadata[] = [
  { id: Tone.FRIENDLY, label: 'Amical', description: 'Chaleureux et naturel', icon: '😊' },
  { id: Tone.PRO, label: 'Expert', description: 'Professionnel et posé', icon: '💼' },
  { id: Tone.MARKETING, label: 'Marketing', description: 'Dynamique et percutant', icon: '⚡' },
  { id: Tone.CALM, label: 'Calme', description: 'Doux et relaxant', icon: '🍃' },
  { id: Tone.MYSTERY, label: 'Narratif', description: 'Mystérieux et profond', icon: '🎭' },
  { id: Tone.ENERGETIC, label: 'Énergique', description: 'Sportif et rapide', icon: '🏃' },
  { id: Tone.WHISPER, label: 'ASMR', description: 'Chuchoté', icon: '🤫' },
  { id: Tone.LUXURY, label: 'Luxe', description: 'Élégant et raffiné', icon: '💎' },
  { id: Tone.CHILD, label: 'Enfantin', description: 'Joyeux et léger', icon: '🎈' },
  { id: Tone.SARCASTIC, label: 'Sarcasme', description: 'Ironique et moqueur', icon: '😏' },
  { id: Tone.SAD, label: 'Triste', description: 'Émouvant et lent', icon: '😢' },
  { id: Tone.ANGRY, label: 'Colère', description: 'Tendu et agressif', icon: '😤' },
  { id: Tone.STORYTELLER, label: 'Conteur', description: 'Magique et captivant', icon: '📖' },
  { id: Tone.RADIO_DJ, label: 'Radio DJ', description: 'Punchy et rythmé', icon: '🎙️' }
];

export const TONE_PROMPTS: Record<Tone, string> = {
  [Tone.MARKETING]: "avec un ton marketing hyper-actif, enthousiaste, persuasif et rapide",
  [Tone.PRO]: "avec un ton professionnel, formel, posé et très clair",
  [Tone.CALM]: "avec un ton calme, doux, lent et apaisant",
  [Tone.FRIENDLY]: "avec un ton amical, chaleureux, naturel et accueillant",
  [Tone.MYSTERY]: "avec un ton narratif, profond, mystérieux et captivant",
  [Tone.ENERGETIC]: "avec un ton très énergique, dynamique et motivant",
  [Tone.CHILD]: "avec un ton enfantin, innocent, joyeux et aigu",
  [Tone.NEWS]: "avec un ton de journaliste TV, neutre, informatif et articulé",
  [Tone.LUXURY]: "avec un ton luxueux, élégant, sophistique et lent",
  [Tone.CINEMATIC]: "avec un ton cinématique, épique et puissant",
  [Tone.WHISPER]: "avec un ton chuchoté, intime et très bas",
  [Tone.SARCASTIC]: "avec un ton sarcastique, ironique, un peu moqueur et cynique",
  [Tone.SAD]: "avec un ton triste, mélancolique, émouvant et chargé de chagrin",
  [Tone.ANGRY]: "avec un ton en colère, tendu, agressif et autoritaire",
  [Tone.STORYTELLER]: "avec un ton de conteur, magique, captivant, avec des variations d'intonation pour chaque personnage",
  [Tone.RADIO_DJ]: "avec un ton d'animateur radio FM, très dynamique, rythmé, avec une voix 'souriante' et entraînante"
};

export const READING_STYLE_PROMPTS: Record<string, string> = {
  'Naturel': "en parlant de manière totalement naturelle, comme dans une conversation spontanée, avec des hésitations légères et des respirations audibles",
  'Théâtral': "en parlant de manière dramatique, exagérée, avec une grande amplitude émotionnelle et des pauses marquées pour l'effet",
  'Radio / Studio': "en parlant avec une technique de micro parfaite, une articulation impeccable et une compression vocale perçue (voix de studio)",
  'Rue / Spontané': "en parlant de manière très informelle, rapide, avec l'argot local et une énergie de la rue"
};

export const LANGUAGE_CODES: Record<Language, string> = {
  [Language.FR]: "en Français de France",
  [Language.EN]: "en Anglais International",
  [Language.ES]: "en Espagnol",
  [Language.AR]: "en Arabe Classique",
  [Language.DARIJA]: "en Arabe Darija Marocain authentique. Utilise les expressions locales, les pauses naturelles et les intonations typiques du terroir marocain (accent de Casablanca, Rabat ou Fès selon le personnage)",
  [Language.PL]: "w języku polskim"
};

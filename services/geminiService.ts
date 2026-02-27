
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { Language, ReadingStyle } from "../types";
import { LANGUAGE_CODES, READING_STYLE_PROMPTS } from "../constants";

// Initialisation conforme aux directives SDK
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fonction utilitaire pour attendre (sleep)
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper pour les appels API avec gestion des limites de débit (429)
 */
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isQuotaError && i < maxRetries - 1) {
        // Attente exponentielle : 2s, 4s, 8s...
        const waitTime = Math.pow(2, i + 1) * 1000;
        console.warn(`Quota atteint (429). Nouvelle tentative dans ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * Normalise le type MIME pour l'API Gemini.
 */
const normalizeMimeType = (mimeType: string): string => {
  if (mimeType.includes('application/ogg')) return 'audio/ogg';
  if (mimeType.includes('audio/webm')) return 'audio/webm';
  if (mimeType.includes('audio/x-wav') || mimeType.includes('audio/vnd.wav')) return 'audio/wav';
  return mimeType;
};

/**
 * Encode les données PCM en WAV.
 */
const encodeWAV = (pcmData: Int16Array, sampleRate: number): Blob => {
  const buffer = new ArrayBuffer(44 + pcmData.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 32 + pcmData.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmData.length * 2, true);

  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(44 + i * 2, pcmData[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

export const generateSpeech = async (
  text: string,
  language: Language,
  toneInstruction: string,
  voiceName: string,
  speed: number = 1.0,
  autoPitchDisabled: boolean = false,
  readingStyle: ReadingStyle = ReadingStyle.NATURAL,
  breathIntensity: number = 0.5,
  hesitationFrequency: number = 0.2
): Promise<Blob> => {
  const ai = getAI();
  const langInstruction = LANGUAGE_CODES[language];
  const styleInstruction = READING_STYLE_PROMPTS[readingStyle] || READING_STYLE_PROMPTS['Naturel'];
  
  let speedInstruction = "à vitesse normale";
  if (speed < 0.8) speedInstruction = "très lentement";
  else if (speed < 1.0) speedInstruction = "lentement";
  else if (speed > 1.5) speedInstruction = "très rapidement";
  else if (speed > 1.0) speedInstruction = "rapidement";

  const pitchInstruction = autoPitchDisabled ? "en conservant strictement le pitch naturel de la voix sans aucun ajustement automatique de hauteur" : "";

  const humanV2Instruction = `
    HUMAN IMPROVEMENT V2 ACTIVATED:
    - Intensité des respirations : ${Math.round(breathIntensity * 100)}%. Incorpore des inspirations et expirations audibles et naturelles entre les phrases.
    - Fréquence des hésitations : ${Math.round(hesitationFrequency * 100)}%. Ajoute des micro-pauses, des répétitions légères de syllabes ou des sons de réflexion ("euh", "ehm") de manière organique si la fréquence est élevée.
    - Texture vocale : Privilégie une texture "proche du micro" avec des détails de bouche naturels (clics de langue très subtils, humidité).
  `;

  // Prompt renforcé pour un réalisme extrême
  const prompt = `Dit ${langInstruction} ${toneInstruction}, ${styleInstruction}, ${pitchInstruction} et ${speedInstruction}. 
${humanV2Instruction}
EXTRÊME RÉALISME : La voix doit sonner 100% humaine, avec des variations de débit naturelles, des pauses de réflexion si nécessaire, et une émotion palpable. 
S'il s'agit de Darija Marocain, utilise les contractions et les liaisons typiques de la langue parlée au quotidien.

IMPORTANT : Respecte la mise en forme du texte suivant pour l'intonation :
- Le texte entre doubles astérisques (**texte**) doit être prononcé avec une emphase forte (accentuation, stress).
- Le texte entre astérisques simples (*texte*) doit être prononcé avec une intonation plus nuancée, douce ou émotionnelle.
- Les points de suspension (...) indiquent une pause de réflexion naturelle.
- Les balises comme [breath], [sigh], [laugh], [clear_throat] doivent être interprétées et réalisées vocalement.

Voici le script : ${text}`;

  // Fix: Ensure response is typed correctly to access candidates property
  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  })) as GenerateContentResponse;

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Aucune donnée audio reçue de l'API");
  }

  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const pcmData = new Int16Array(bytes.buffer);
  return encodeWAV(pcmData, 24000);
};

export const analyzeVoiceReference = async (audioBlob: Blob): Promise<{ geminiVoice: string, name: string, description: string }> => {
  const ai = getAI();
  
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
  });
  reader.readAsDataURL(audioBlob);
  const base64Data = await base64Promise;

  // Fix: Cast response to GenerateContentResponse to access text property
  const response = await callWithRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: normalizeMimeType(audioBlob.type),
            data: base64Data,
          },
        },
        { text: `Analyse cette voix et dis-moi laquelle de ces voix pré-construites lui ressemble le plus en termes de genre, de pitch et de texture : 
        - Kore (Femme, claire, vive)
        - Puck (Homme, profond, chaleureux)
        - Charon (Femme, professionnelle, posée)
        - Fenrir (Homme, fort, autoritaire)
        - Zephyr (Femme, douce, naturelle)
        
        Réponds uniquement au format JSON : {"voice": "Kore|Puck|Charon|Fenrir|Zephyr", "description": "Brève description de la voix analysée"}` },
      ],
    },
    config: {
      responseMimeType: "application/json"
    }
  })) as GenerateContentResponse;

  try {
    const jsonStr = response.text || '{}';
    const result = JSON.parse(jsonStr);
    return {
      geminiVoice: result.voice || 'Zephyr',
      name: 'Référence Upload',
      description: result.description || 'Voix basée sur votre échantillon'
    };
  } catch (e) {
    return { geminiVoice: 'Zephyr', name: 'Référence Upload', description: 'Analyse simplifiée' };
  }
};

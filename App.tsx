
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Language, Tone, GeneratedAudio, VoicePersona, ToneMetadata, ScriptSegment, ReadingStyle } from './types';
import { VOICE_PERSONAS, TONE_METADATA, TONE_PROMPTS, READING_STYLE_PROMPTS } from './constants';
import { generateSpeech, analyzeVoiceReference } from './services/geminiService';
import AudioVisualizer from './components/AudioVisualizer';

const PLACEHOLDER_AVATAR = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop";

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<Language>(Language.DARIJA);
  const [selectedToneId, setSelectedToneId] = useState<string>(Tone.FRIENDLY);
  const [selectedStyle, setSelectedStyle] = useState<ReadingStyle>(ReadingStyle.NATURAL);
  const [breathIntensity, setBreathIntensity] = useState<number>(0.5);
  const [hesitationFrequency, setHesitationFrequency] = useState<number>(0.2);
  const [speed, setSpeed] = useState<number>(1.0);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedAudio[]>([]);
  const [customVoices, setCustomVoices] = useState<VoicePersona[]>([]);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [isPreviewingId, setIsPreviewingId] = useState<string | null>(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Cache local pour les aperçus audio afin d'éviter les appels API redondants et d'économiser le quota
  const previewCache = useRef<Map<string, string>>(new Map());

  const [isDirectorMode, setIsDirectorMode] = useState(false);
  const [segments, setSegments] = useState<ScriptSegment[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredVoices = useMemo(() => {
    const preBuilt = VOICE_PERSONAS.filter(v => v.supportedLanguages.includes(language));
    const custom = customVoices.filter(v => v.supportedLanguages.includes(language));
    return [...custom, ...preBuilt];
  }, [language, customVoices]);

  useEffect(() => {
    if (filteredVoices.length > 0 && !filteredVoices.find(v => v.id === selectedVoiceId)) {
      setSelectedVoiceId(filteredVoices[0].id);
    }
  }, [filteredVoices, selectedVoiceId]);

  const selectedVoice = useMemo(() => {
    return filteredVoices.find(v => v.id === selectedVoiceId) || filteredVoices[0];
  }, [selectedVoiceId, filteredVoices]);

  const formatError = (error: any) => {
    if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      return "Quota dépassé (Limite API). L'application essaie de contourner le problème automatiquement via le cache et des délais d'attente.";
    }
    return "Erreur technique lors de la génération. Veuillez réessayer.";
  };

  const handlePreviewSegment = async (segment: ScriptSegment) => {
    if (segment.isGenerating) return;
    setErrorMessage(null);
    updateSegment(segment.id, { isGenerating: true });
    try {
      const tone = TONE_METADATA.find(t => t.id === segment.toneId) || TONE_METADATA[0];
      const voice = filteredVoices.find(v => v.id === segment.voiceId) || selectedVoice;
      const blob = await generateSpeech(
        segment.text, 
        language, 
        TONE_PROMPTS[tone.id as Tone], 
        voice.geminiVoice, 
        segment.speed, 
        false, 
        segment.style || ReadingStyle.NATURAL,
        segment.breathIntensity ?? breathIntensity,
        segment.hesitationFrequency ?? hesitationFrequency
      );
      const url = URL.createObjectURL(blob);
      updateSegment(segment.id, { audioUrl: url, isGenerating: false });
      setPlayingAudioUrl(url);
      setIsPlaying(true);
      const audio = new Audio(url);
      audio.onended = () => { 
        setIsPlaying(false);
      };
      audio.play();
    } catch (e: any) {
      updateSegment(segment.id, { isGenerating: false });
      setErrorMessage(formatError(e));
    }
  };

  const handlePreviewVoice = async (persona: VoicePersona) => {
    if (isPreviewingId) return;
    setErrorMessage(null);

    // Vérifier le cache avant de faire un appel API
    const cacheKey = `${persona.id}_${language}`;
    if (previewCache.current.has(cacheKey)) {
      setIsPreviewingId(persona.id);
      const url = previewCache.current.get(cacheKey)!;
      setPlayingAudioUrl(url);
      setIsPlaying(true);
      const audio = new Audio(url);
      audio.onended = () => {
        setIsPreviewingId(null);
        setIsPlaying(false);
      };
      audio.play();
      return;
    }

    setIsPreviewingId(persona.id);
    try {
      const tone = TONE_METADATA.find(t => t.id === Tone.FRIENDLY) || TONE_METADATA[0];
      const blob = await generateSpeech(persona.previewText, language, TONE_PROMPTS[tone.id as Tone], persona.geminiVoice, 1.0, false, ReadingStyle.NATURAL);
      const url = URL.createObjectURL(blob);
      
      // Stocker dans le cache
      previewCache.current.set(cacheKey, url);
      setPlayingAudioUrl(url);
      setIsPlaying(true);
      
      const audio = new Audio(url);
      audio.onended = () => {
        setIsPreviewingId(null);
        setIsPlaying(false);
      };
      audio.play();
    } catch (e: any) {
      setIsPreviewingId(null);
      setErrorMessage(formatError(e));
    }
  };

  const handleGenerateFinal = async () => {
    const finalContent = isDirectorMode ? segments.map(s => s.text).join(' ') : text;
    if (!finalContent.trim() || !selectedVoice) return;
    setErrorMessage(null);
    setIsGenerating(true);
    try {
      const tone = TONE_METADATA.find(t => t.id === selectedToneId) || TONE_METADATA[0];
      const blob = await generateSpeech(
        finalContent, 
        language, 
        TONE_PROMPTS[tone.id as Tone], 
        selectedVoice.geminiVoice, 
        speed, 
        false, 
        selectedStyle,
        breathIntensity,
        hesitationFrequency
      );
      const url = URL.createObjectURL(blob);
      setPlayingAudioUrl(url);
      setIsPlaying(true);
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      audio.play();

      setHistory(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        text: finalContent, language, toneLabel: tone.label, voiceName: selectedVoice.name,
        speed, autoPitchDisabled: false, timestamp: new Date(), blob, url
      }, ...prev]);
    } catch (e: any) {
      setErrorMessage(formatError(e));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleDirector = () => {
    if (!isDirectorMode) {
      const parts = text.split(/(?<=[.!?])\s+/).filter(p => p.trim().length > 0);
      const newSegments: ScriptSegment[] = parts.map((p, i) => ({
        id: `seg-${Date.now()}-${i}`,
        text: p,
        voiceId: selectedVoiceId,
        toneId: selectedToneId,
        speed: speed,
        style: selectedStyle,
        breathIntensity: breathIntensity,
        hesitationFrequency: hesitationFrequency
      }));
      setSegments(newSegments);
    }
    setIsDirectorMode(!isDirectorMode);
  };

  const updateSegment = (id: string, updates: Partial<ScriptSegment>) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setIsAnalyzingVoice(true);
    try {
      const analysis = await analyzeVoiceReference(file);
      const newVoice: VoicePersona = {
        id: `custom-${Date.now()}`,
        name: `Clone IA ${customVoices.length + 1}`,
        gender: ['Kore', 'Charon', 'Zephyr'].includes(analysis.geminiVoice) ? 'F' : 'M',
        geminiVoice: analysis.geminiVoice as any,
        description: analysis.description,
        supportedLanguages: [language],
        previewText: "Ceci est mon nouveau profil vocal.",
        avatarUrl: PLACEHOLDER_AVATAR
      };
      setCustomVoices(prev => [newVoice, ...prev]);
      setSelectedVoiceId(newVoice.id);
    } catch (e: any) { 
      setErrorMessage(formatError(e));
    }
    finally { setIsAnalyzingVoice(false); }
  };

  const handleExportVoices = () => {
    const allVoices = [...customVoices, ...VOICE_PERSONAS];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allVoices, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "voxgenius_library.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-amber-500/30 hardware-grid relative overflow-hidden">
      <div className="absolute inset-0 scanline pointer-events-none"></div>
      <div className="fixed inset-0 pointer-events-none opacity-5 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/arabesque.png")' }}></div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <header className="flex flex-col items-center mb-16 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-white to-amber-200">
            VOX<span className="font-light">GENIUS</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded font-black uppercase tracking-widest">STUDIO IA</span>
            <div className="h-px w-12 bg-slate-800"></div>
            <button 
              onClick={handleToggleDirector}
              className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border transition-all ${isDirectorMode ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-xl' : 'border-slate-800 text-slate-600 hover:border-slate-600'}`}
            >
              {isDirectorMode ? '🎬 Mode Réalisateur Actif' : 'Activer Mode Réalisateur'}
            </button>
          </div>
        </header>

        {errorMessage && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/50 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="p-2 bg-amber-500/20 rounded-full text-amber-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-200">{errorMessage}</p>
              <p className="text-[10px] text-amber-500 uppercase tracking-widest mt-1">L'application réessaiera automatiquement avec des délais.</p>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-amber-400 hover:text-amber-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
              <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                Console de Mixage
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Langue</label>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.values(Language).map(lang => (
                      <button 
                        key={lang} onClick={() => setLanguage(lang)}
                        className={`px-2 py-1.5 rounded text-[9px] font-bold text-left transition-all border ${language === lang ? 'bg-amber-600/10 border-amber-500/50 text-amber-500' : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Style de Lecture</label>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.values(ReadingStyle).map(style => (
                      <button 
                        key={style} onClick={() => setSelectedStyle(style)}
                        className={`px-2 py-1.5 rounded text-[9px] font-bold text-left transition-all border ${selectedStyle === style ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Tonalité</label>
                  <div className="grid grid-cols-4 gap-1">
                    {TONE_METADATA.map(tone => (
                      <button 
                        key={tone.id} onClick={() => setSelectedToneId(tone.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded transition-all border ${selectedToneId === tone.id ? 'bg-slate-800 border-amber-500/50 text-amber-500' : 'bg-slate-950/30 border-slate-800 text-slate-600 hover:text-slate-400'}`}
                        title={tone.description}
                      >
                        <span className="text-lg mb-1">{tone.icon}</span>
                        <span className="text-[7px] font-black uppercase tracking-tighter text-center">{tone.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50 space-y-4">
                  <h3 className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest">Human Improvement V2</h3>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Intensité Respiratoire</label>
                      <span className="text-[9px] font-mono text-amber-500">{(breathIntensity * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={breathIntensity} 
                      onChange={(e) => setBreathIntensity(parseFloat(e.target.value))} 
                      className="w-full accent-amber-500 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fréquence Hésitations</label>
                      <span className="text-[9px] font-mono text-amber-500">{(hesitationFrequency * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={hesitationFrequency} 
                      onChange={(e) => setHesitationFrequency(parseFloat(e.target.value))} 
                      className="w-full accent-amber-500 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer" 
                    />
                  </div>
                </div>

                {!isDirectorMode && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Vitesse : {speed}x</label>
                    <input type="range" min="0.5" max="1.5" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full accent-amber-500" />
                  </div>
                )}
              </div>
            </section>

            <section className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
              <div className="flex flex-col gap-1 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">Casting Vocaux</h2>
                  <button onClick={handleExportVoices} className="text-[8px] font-black text-slate-400 hover:text-amber-500 transition-colors uppercase tracking-widest flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Export
                  </button>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="text-[8px] font-black text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-widest text-left mt-1 flex items-center gap-2">
                  <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                  Cloner Voix
                </button>
                <input type="file" accept="audio/*" className="hidden" ref={fileInputRef} onChange={handleVoiceUpload} />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {filteredVoices.map(voice => (
                  <div key={voice.id} className="relative group">
                    <button 
                      onClick={() => setSelectedVoiceId(voice.id)}
                      className={`w-full flex items-center gap-4 p-2 rounded border transition-all ${selectedVoiceId === voice.id ? 'bg-amber-600/5 border-amber-500/30' : 'bg-slate-950/30 border-slate-800/50 hover:border-slate-700'}`}
                    >
                      <div className="relative shrink-0">
                        <img src={voice.avatarUrl} className={`w-10 h-10 rounded object-cover grayscale transition-all ${selectedVoiceId === voice.id ? 'grayscale-0' : 'group-hover:grayscale-0'}`} />
                        {selectedVoiceId === voice.id && <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>}
                      </div>
                      <div className="text-left overflow-hidden flex-1">
                        <p className={`text-[9px] font-black uppercase tracking-widest font-mono ${selectedVoiceId === voice.id ? 'text-amber-500' : 'text-slate-400'}`}>{voice.name}</p>
                        <p className="text-[7px] text-slate-600 font-bold uppercase truncate font-mono">{voice.description}</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePreviewVoice(voice); }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded transition-all ${isPreviewingId === voice.id ? 'bg-amber-500 text-black' : 'bg-slate-800/50 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-white'}`}
                    >
                      {isPreviewingId === voice.id ? (
                        <div className="w-3 h-3 border border-black/40 border-t-black rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/20 to-transparent rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900/30 backdrop-blur-3xl border border-slate-800/50 rounded-[2.5rem] p-10 shadow-2xl min-h-[500px] flex flex-col">
                
                {!isDirectorMode ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button onClick={() => setText(prev => prev + ' **emphase**')} className="text-[9px] font-black uppercase px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-500 transition-all">** Emphase</button>
                      <button onClick={() => setText(prev => prev + ' *nuance*')} className="text-[9px] font-black uppercase px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-500 transition-all">* Nuance</button>
                      <button onClick={() => setText(prev => prev + ' ...')} className="text-[9px] font-black uppercase px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-500 transition-all">... Pause</button>
                      <div className="w-px h-4 bg-slate-800 mx-1 self-center"></div>
                      <button onClick={() => setText(prev => prev + ' [breath]')} className="text-[9px] font-black uppercase px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-500 transition-all">🌬️ Breath</button>
                      <button onClick={() => setText(prev => prev + ' [sigh]')} className="text-[9px] font-black uppercase px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-500 transition-all">💨 Sigh</button>
                      <button onClick={() => setText(prev => prev + ' [laugh]')} className="text-[9px] font-black uppercase px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-500 transition-all">😆 Laugh</button>
                      <button onClick={() => setText(prev => prev + ' [clear_throat]')} className="text-[9px] font-black uppercase px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-500 transition-all">🗣️ Clear Throat</button>
                    </div>
                    <textarea
                      value={text} onChange={(e) => setText(e.target.value)}
                      placeholder="Écrivez votre script ici. Utilisez des astérisques pour l'intonation : **emphase forte** ou *nuance douce*..."
                      className="flex-1 bg-transparent border-none text-2xl font-light leading-relaxed text-white placeholder:text-slate-800 outline-none resize-none custom-scrollbar"
                    />
                  </div>
                ) : (
                  <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4">
                    {segments.map((seg, idx) => (
                      <div key={seg.id} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start gap-6 hover:border-amber-500/30 transition-all">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black text-amber-500 shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 w-full">
                          <textarea
                            value={seg.text}
                            onChange={(e) => updateSegment(seg.id, { text: e.target.value })}
                            className="w-full bg-transparent border-none text-lg font-light text-white outline-none resize-none h-auto min-h-[40px]"
                          />
                          <div className="flex flex-wrap items-center gap-4 mt-4 border-t border-white/5 pt-4">
                             <select value={seg.toneId} onChange={(e) => updateSegment(seg.id, { toneId: e.target.value })} className="bg-slate-900 text-[9px] font-bold uppercase border border-slate-800 rounded px-2 py-1 outline-none text-amber-500">
                               {TONE_METADATA.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                             </select>
                             <select value={seg.style} onChange={(e) => updateSegment(seg.id, { style: e.target.value as ReadingStyle })} className="bg-slate-900 text-[9px] font-bold uppercase border border-slate-800 rounded px-2 py-1 outline-none text-indigo-400">
                               {Object.values(ReadingStyle).map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                             <div className="flex items-center gap-2">
                               <span className="text-[8px] font-black text-slate-600">{seg.speed}x</span>
                               <input type="range" min="0.5" max="1.5" step="0.1" value={seg.speed} onChange={(e) => updateSegment(seg.id, { speed: parseFloat(e.target.value) })} className="w-16 h-1 accent-amber-500" />
                             </div>
                             <button 
                               onClick={() => handlePreviewSegment(seg)}
                               disabled={seg.isGenerating}
                               className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${seg.isGenerating ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 hover:bg-amber-600 text-white'}`}
                             >
                               {seg.isGenerating ? 'IA Génération...' : 'Pré-écouter'}
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Moteur Vocal</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-white uppercase">{selectedVoice?.name}</span>
                    </div>
                  </div>

                  <div className="flex-1 max-w-xs mx-8">
                    <AudioVisualizer audioUrl={playingAudioUrl} isPlaying={isPlaying} />
                  </div>
                  
                  <button 
                    onClick={handleGenerateFinal} 
                    disabled={isGenerating || !text.trim()}
                    className={`px-12 py-5 rounded-3xl text-xs font-black tracking-[0.4em] uppercase text-white shadow-2xl transition-all active:scale-95 ${isGenerating ? 'bg-amber-500 animate-pulse cursor-wait' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30'}`}
                  >
                    {isGenerating ? 'Production Master...' : 'Produire Master Audio'}
                  </button>
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="space-y-4 pt-8">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Rack de Production</h3>
                  <div className="flex-1 h-px bg-slate-800/50"></div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {history.map(item => (
                    <div key={item.id} className="group bg-slate-900/40 border-l-2 border-slate-800 hover:border-amber-500 p-4 flex items-center gap-6 transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="w-12 h-12 rounded bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        <img 
                          src={[...customVoices, ...VOICE_PERSONAS].find(v => v.name === item.voiceName)?.avatarUrl || PLACEHOLDER_AVATAR} 
                          className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest font-mono">{item.voiceName}</span>
                          <span className="text-[7px] font-bold text-slate-500 uppercase border border-slate-800 px-1.5 py-0.5 rounded font-mono">{item.toneLabel}</span>
                          <span className="text-[7px] font-bold text-slate-600 uppercase font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate font-light font-mono">"{item.text}"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setPlayingAudioUrl(item.url);
                            setIsPlaying(true);
                            const audio = new Audio(item.url);
                            audio.onended = () => setIsPlaying(false);
                            audio.play();
                          }}
                          className="p-2 bg-slate-950 border border-slate-800 text-slate-500 hover:text-amber-500 hover:border-amber-500/50 rounded transition-all"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                        </button>
                        <a 
                          href={item.url} download={`voxgenius_${item.id}.wav`}
                          className="p-2 bg-slate-950 border border-slate-800 text-slate-500 hover:text-amber-500 hover:border-amber-500/50 rounded transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="mt-32 pb-12 text-center opacity-30">
          <p className="text-[10px] font-black text-white uppercase tracking-[2em] mb-4">La Science de la Voix • 2025</p>
          <div className="flex justify-center gap-10 text-[8px] font-bold uppercase tracking-widest">
            <span>Maroc</span>
            <span>Pologne</span>
            <span>France</span>
            <span>USA</span>
          </div>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d97706; border-radius: 10px; }
        
        .hardware-grid {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0);
          background-size: 24px 24px;
        }

        input[type=range] { -webkit-appearance: none; background: #0f172a; height: 2px; border-radius: 4px; outline: none; }
        input[type=range]::-webkit-slider-thumb { 
          -webkit-appearance: none; 
          height: 12px; 
          width: 12px; 
          border-radius: 2px; 
          background: #d97706; 
          cursor: pointer; 
          border: 1px solid #020617;
          box-shadow: 0 0 10px rgba(217, 119, 6, 0.3);
        }
        
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        .scanline::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, rgba(217, 119, 6, 0.05), transparent);
          animation: scanline 8s linear infinite;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default App;

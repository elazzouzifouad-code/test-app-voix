
import React from 'react';
import { GeneratedAudio } from '../types';

interface AudioCardProps {
  audio: GeneratedAudio;
  onDelete: (id: string) => void;
}

export const AudioCard: React.FC<AudioCardProps> = ({ audio, onDelete }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-blue-500/50 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">{audio.language}</h3>
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            <p className="text-[10px] text-slate-400">
              {audio.toneLabel} • {audio.voiceName} • {audio.speed}x
            </p>
            {audio.autoPitchDisabled && (
              <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1 rounded border border-indigo-500/30 uppercase font-bold tracking-tighter">
                Pitch Naturel
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={() => onDelete(audio.id)}
          className="text-slate-500 hover:text-red-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
      
      <p className="text-sm text-slate-200 line-clamp-2 italic">"{audio.text}"</p>
      
      <div className="flex items-center gap-2 mt-2">
        <audio src={audio.url} controls className="h-10 w-full rounded-lg bg-slate-900" />
        <a 
          href={audio.url} 
          download={`voxgenius_${audio.id}.wav`}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex-shrink-0"
          title="Télécharger"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        </a>
      </div>
    </div>
  );
};

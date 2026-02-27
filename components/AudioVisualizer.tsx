import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioUrl: string | null;
  isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioUrl, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioUrl || !canvasRef.current) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      if (!sourceRef.current && audioRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current!);
        analyserRef.current!.connect(audioContextRef.current.destination);
      }
    };

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const r = 245;
        const g = 158;
        const b = 11;
        const alpha = dataArray[i] / 255;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      animationIdRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      initAudio();
      audio.play();
      draw();
    } else {
      audio.pause();
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    }

    return () => {
      audio.pause();
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [audioUrl, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={60} 
      className="w-full h-12 opacity-50 pointer-events-none"
    />
  );
};

export default AudioVisualizer;

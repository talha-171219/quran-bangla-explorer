import { useState, useEffect, useRef } from "react";

interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentAyah: string | null;
}

export function useAudioPlayer() {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    currentAyah: null,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = async (surahNumber: number, ayahNumber: number) => {
    const ayahKey = `${surahNumber}:${ayahNumber}`;
    
    // If same ayah is playing, pause it
    if (state.currentAyah === ayahKey && audioRef.current) {
      audioRef.current.pause();
      setState({ isPlaying: false, isLoading: false, currentAyah: null });
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setState({ isPlaying: false, isLoading: true, currentAyah: ayahKey });

    try {
      // Mishary bin Rashid Alafasy - High Quality (128kbps)
      const surahPadded = String(surahNumber).padStart(3, '0');
      const ayahPadded = String(ayahNumber).padStart(3, '0');
      const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${surahPadded}${ayahPadded}.mp3`;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('loadeddata', () => {
        setState({ isPlaying: true, isLoading: false, currentAyah: ayahKey });
      });

      audio.addEventListener('ended', () => {
        setState({ isPlaying: false, isLoading: false, currentAyah: null });
      });

      audio.addEventListener('error', () => {
        setState({ isPlaying: false, isLoading: false, currentAyah: null });
      });

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setState({ isPlaying: false, isLoading: false, currentAyah: null });
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setState({ isPlaying: false, isLoading: false, currentAyah: null });
  };

  return {
    ...state,
    play,
    stop,
  };
}

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
  // Autoplay / queue refs
  const autoplayRef = useRef<boolean>(false);
  const queueSurahRef = useRef<number | null>(null);
  const queueIndexRef = useRef<number>(-1);
  const queueLengthRef = useRef<number>(0);

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
        // If autoplay queue is active, play next
        const playing = ayahKey;
        const [sStr, aStr] = playing.split(":");
        const sNum = Number(sStr);
        const aNum = Number(aStr);

        if (autoplayRef.current && queueSurahRef.current === sNum) {
          // queueIndexRef points to current index (0-based). Advance if possible
          const nextIndex = queueIndexRef.current + 1;
          if (nextIndex < queueLengthRef.current) {
            queueIndexRef.current = nextIndex;
            const nextAyah = nextIndex + 1; // ayah numbers are 1-based
            // play next ayah in same surah
            play(sNum, nextAyah).catch(() => {});
            return;
          }
        }

        // otherwise stop
        autoplayRef.current = false;
        queueSurahRef.current = null;
        queueIndexRef.current = -1;
        queueLengthRef.current = 0;
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

  // Enhanced play that accepts autoplay options
  // options: { autoplay?: boolean, queueLength?: number }
  const playWithOptions = async (surahNumber: number, ayahNumber: number, options?: { autoplay?: boolean; queueLength?: number }) => {
    const autoplay = options?.autoplay || false;
    if (autoplay) {
      autoplayRef.current = true;
      queueSurahRef.current = surahNumber;
      // set queue index based on ayahNumber (0-based)
      queueIndexRef.current = ayahNumber - 1;
      queueLengthRef.current = options?.queueLength || 0;
    } else {
      // clear autoplay if not requested
      autoplayRef.current = false;
      queueSurahRef.current = null;
      queueIndexRef.current = -1;
      queueLengthRef.current = 0;
    }

    return play(surahNumber, ayahNumber);
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // also clear autoplay
    autoplayRef.current = false;
    queueSurahRef.current = null;
    queueIndexRef.current = -1;
    queueLengthRef.current = 0;
    setState({ isPlaying: false, isLoading: false, currentAyah: null });
  };

  return {
    ...state,
    play: playWithOptions,
    stop,
  };
}

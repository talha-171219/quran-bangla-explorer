import { Ayah } from "@/types/quran";
import { Button } from "@/components/ui/button";
import { Play, Pause, Copy, Share2, BookMarked, Loader2, Edit3, Save } from "lucide-react";
import { WordChip } from "./WordChip";
import { toast } from "sonner";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { saveBookmark, getBookmarks, deleteBookmark } from "@/lib/db";
import { useEffect, useState, useRef } from "react";

interface AyatCardProps {
  ayah: Ayah;
  surahNumber: number;
  showWordMeanings?: boolean;
  autoplayEnabled?: boolean;
  surahAyahCount?: number;
}

export function AyatCard({ ayah, surahNumber, showWordMeanings = true, autoplayEnabled = false, surahAyahCount = 0 }: AyatCardProps) {
  const { isPlaying, isLoading, currentAyah, play } = useAudioPlayer();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const ayahKey = `${surahNumber}:${ayah.ayahNumber}`;
  const isThisAyahPlaying = currentAyah === ayahKey && isPlaying;
  const isThisAyahLoading = currentAyah === ayahKey && isLoading;
  const bookmarkId = `${surahNumber}_${ayah.ayahNumber}`;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [note, setNote] = useState<string>("");
  const [editingNote, setEditingNote] = useState(false);

  const handleCopy = () => {
    const text = `${ayah.text_ar}\n\nঅনুবাদ: ${ayah.translation_bn}\n\n(সূরা ${surahNumber}, আয়াত ${ayah.ayahNumber})`;
    navigator.clipboard.writeText(text);
    toast.success("আয়াত কপি করা হয়েছে");
  };

  const handleShare = async () => {
    const text = `${ayah.text_ar}\n\nঅনুবাদ: ${ayah.translation_bn}\n\n(সূরা ${surahNumber}, আয়াত ${ayah.ayahNumber})`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      handleCopy();
    }
  };

  const handlePlayAudio = async () => {
    if (autoplayEnabled && surahAyahCount > 0) {
      await play(surahNumber, ayah.ayahNumber, { autoplay: true, queueLength: surahAyahCount });
    } else {
      await play(surahNumber, ayah.ayahNumber);
    }
  };

  // Scroll into view when this ayah becomes the current playing ayah
  useEffect(() => {
    try {
      if (!rootRef.current) return;
      if (currentAyah === ayahKey && (isPlaying || isLoading)) {
        // smooth center the ayah on screen
        rootRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (e) {
      // ignore scroll errors
    }
  }, [currentAyah, isPlaying, isLoading, ayahKey]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getBookmarks();
        if (!mounted) return;
        const found = list.find((b) => b.id === bookmarkId);
        if (found) {
          setIsBookmarked(true);
          setNote(found.note || "");
        } else {
          // load note from localStorage if present
          try { const raw = localStorage.getItem(`notes_surah_${surahNumber}_${ayah.ayahNumber}`); if (raw) setNote(raw); } catch(e) {}
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [bookmarkId, surahNumber, ayah.ayahNumber]);

  async function toggleBookmark() {
    if (isBookmarked) {
      try {
        await deleteBookmark(bookmarkId);
        setIsBookmarked(false);
        toast.success("বুকমার্ক মুছে ফেলা হয়েছে");
      } catch (e) { console.error(e); toast.error("বুকমার্ক মুছতে সমস্যা হয়েছে"); }
    } else {
      try {
        await saveBookmark({ id: bookmarkId, surahNumber, ayahNumber: ayah.ayahNumber, note: note || "", createdAt: Date.now() });
        setIsBookmarked(true);
        toast.success("বুকমার্ক সংরক্ষিত হয়েছে");
      } catch (e) { console.error(e); toast.error("বুকমার্ক সংরক্ষণে সমস্যা হয়েছে"); }
    }
  }

  function saveNote() {
    try {
      localStorage.setItem(`notes_surah_${surahNumber}_${ayah.ayahNumber}`, note);
      // if bookmarked, update bookmark entry
      if (isBookmarked) saveBookmark({ id: bookmarkId, surahNumber, ayahNumber: ayah.ayahNumber, note: note || "", createdAt: Date.now() }).catch(() => {});
      setEditingNote(false);
      toast.success("নোট সেভ করা হয়েছে");
    } catch (e) { console.error(e); toast.error("নোট সেভ করতে সমস্যা হয়েছে"); }
  }

  return (
    <div
      ref={rootRef}
      className={`bg-white/60 backdrop-blur-md border border-white/30 rounded-3xl p-5 md:p-6 space-y-4 shadow-2xl transition-shadow duration-300 ${isThisAyahPlaying ? 'ring-4 ring-primary/30 bg-primary/5' : 'hover:shadow-2xl hover:scale-[1.01]'}`}
    >
      {/* Ayat Number Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-primary/10 to-primary/20 text-primary rounded-full text-sm font-semibold shadow-sm">
            আয়াত {ayah.ayahNumber}
          </span>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayAudio}
            className="h-8 w-8"
            aria-label={isThisAyahPlaying ? "Pause" : "Play"}
            disabled={isThisAyahLoading}
          >
            {isThisAyahLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isThisAyahPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8" aria-label="Copy ayat">
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-8 w-8"
            aria-label="Share ayat"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant={isBookmarked ? "secondary" : "ghost"}
            size="icon"
            onClick={toggleBookmark}
            className={`h-8 w-8 ${isBookmarked ? "!bg-primary/10" : ""}`}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <BookMarked className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setEditingNote((s) => !s)} className="h-8 w-8" aria-label="Note">
            {editingNote ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Special highlight for first ayah (Bismillah) */}
      {ayah.ayahNumber === 1 && (
        <div className="flex items-center justify-center mb-2">
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-900 text-sm font-medium border border-yellow-200 shadow-sm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        </div>
      )}

      {/* Arabic Text */}
      <div className="text-2xl md:text-3xl arabic-text leading-relaxed text-slate-900">
        {ayah.text_ar}
      </div>

      {/* Word-by-Word Meanings */}
      {showWordMeanings && ayah.words.length > 0 && (
        <div className="flex flex-wrap gap-2 py-2">
          {ayah.words.map((word) => (
            <WordChip key={word.index} word={word} />
          ))}
        </div>
      )}

      {/* Bangla Translation */}
      <div className="pt-2 border-t border-border">
        <p className="text-base bangla-text text-foreground leading-relaxed">
          {ayah.translation_bn}
        </p>
      </div>

      {/* Notes area (collapsed) */}
      {editingNote && (
        <div className="pt-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[80px] p-3 rounded-md border border-border resize-vertical"
            placeholder="আপনার নোট লিখুন..."
          />
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" onClick={saveNote}>
              সংরক্ষণ
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditingNote(false); }}>
              বাতिल
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

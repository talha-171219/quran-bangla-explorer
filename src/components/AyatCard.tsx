import { Ayah } from "@/types/quran";
import { Button } from "@/components/ui/button";
import { Play, Pause, Copy, Share2, BookMarked, Loader2 } from "lucide-react";
import { WordChip } from "./WordChip";
import { toast } from "sonner";
import { useAudioPlayer } from "@/hooks/use-audio-player";

interface AyatCardProps {
  ayah: Ayah;
  surahNumber: number;
  onOpenTafsir: () => void;
  showWordMeanings?: boolean;
}

export function AyatCard({
  ayah,
  surahNumber,
  onOpenTafsir,
  showWordMeanings = true,
}: AyatCardProps) {
  const { isPlaying, isLoading, currentAyah, play } = useAudioPlayer();
  const ayahKey = `${surahNumber}:${ayah.ayahNumber}`;
  const isThisAyahPlaying = currentAyah === ayahKey && isPlaying;
  const isThisAyahLoading = currentAyah === ayahKey && isLoading;

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
    await play(surahNumber, ayah.ayahNumber);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
      {/* Ayat Number Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8"
            aria-label="Copy ayat"
          >
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
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Bookmark"
          >
            <BookMarked className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Arabic Text */}
      <div className="text-arabic-lg arabic-text leading-loose">
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

      {/* Short Tafsir */}
      {ayah.tafsir_short_bn && (
        <div className="bg-muted rounded-md p-3">
          <p className="text-sm bangla-text text-muted-foreground mb-2">
            {ayah.tafsir_short_bn}
          </p>
          <Button
            variant="link"
            onClick={onOpenTafsir}
            className="h-auto p-0 text-primary bangla-text"
          >
            বিস্তারিত তাফসির পড়ুন →
          </Button>
        </div>
      )}
    </div>
  );
}

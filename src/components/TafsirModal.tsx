import { Ayah } from "@/types/quran";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Share2, BookMarked } from "lucide-react";
import { toast } from "sonner";

interface TafsirModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ayah: Ayah | null;
  surahNumber: number;
  surahName: string;
}

export function TafsirModal({
  open,
  onOpenChange,
  ayah,
  surahNumber,
  surahName,
}: TafsirModalProps) {
  if (!ayah) return null;

  const handleCopy = () => {
    const text = `${ayah.text_ar}\n\nঅনুবাদ: ${ayah.translation_bn}\n\nতাফসির: ${ayah.tafsir_full_bn}\n\n(${surahName}, আয়াত ${ayah.ayahNumber})`;
    navigator.clipboard.writeText(text);
    toast.success("তাফসির কপি করা হয়েছে");
  };

  const handleShare = async () => {
    const text = `${ayah.text_ar}\n\nঅনুবাদ: ${ayah.translation_bn}\n\nতাফসির: ${ayah.tafsir_full_bn}\n\n(${surahName}, আয়াত ${ayah.ayahNumber})`;
    
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="bangla-text">
              {surahName} - আয়াত {ayah.ayahNumber}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="h-8 w-8"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <BookMarked className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed tafsir for ayat {ayah.ayahNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Arabic Text */}
          <div className="text-2xl arabic-text leading-loose text-center">
            {ayah.text_ar}
          </div>

          {/* Translation */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold bangla-text mb-2 text-muted-foreground">
              অনুবাদ
            </h3>
            <p className="text-base bangla-text leading-relaxed">
              {ayah.translation_bn}
            </p>
          </div>

          {/* Full Tafsir */}
          <div>
            <h3 className="text-sm font-semibold bangla-text mb-3 text-muted-foreground">
              বিস্তারিত তাফসির
            </h3>
            <div className="prose prose-sm max-w-none bangla-text leading-relaxed whitespace-pre-wrap">
              {ayah.tafsir_full_bn}
            </div>
          </div>

          {/* Attribution */}
          <div className="border-t pt-4 text-xs text-muted-foreground bangla-text">
            <p>
              <strong>সূত্র:</strong> তাফসির লাইসেন্স এবং অ্যাট্রিবিউশন এখানে প্রদর্শিত হবে
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Settings, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AyatCard } from "@/components/AyatCard";
import { Surah, Ayah } from "@/types/quran";
import { fetchSurahDetail } from "@/lib/quran-api";
import { getSurah, saveSurah } from "@/lib/db";
import { toast } from "sonner";

const SurahDetail = () => {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  // Tafsir feature removed
  const [showWordMeanings, setShowWordMeanings] = useState(true);

  useEffect(() => {
    loadSurah();
  }, [surahNumber]);

  const loadSurah = async () => {
    if (!surahNumber) return;

    try {
      setLoading(true);
      const number = parseInt(surahNumber);

      // Try to load from cache first
      let data = await getSurah(number);

      // If not in cache, fetch from API
      if (!data) {
        data = await fetchSurahDetail(number);
        if (data) {
          // Optionally cache it
          await saveSurah(data);
        }
      }

      setSurah(data);
    } catch (error) {
      console.error("Error loading surah:", error);
      toast.error("সূরা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!surah) return;
    
    try {
      await saveSurah(surah);
      toast.success("সূরা অফলাইন ডাউনলোড করা হয়েছে");
    } catch (error) {
      console.error("Error downloading surah:", error);
      toast.error("ডাউনলোড করতে সমস্যা হয়েছে");
    }
  };

  // handleOpenTafsir removed

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground bangla-text">
            সূরা লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 bangla-text">সূরা পাওয়া যায়নি</h2>
          <Button asChild>
            <Link to="/">হোম পেজে ফিরে যান</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-gray-50">
      {/* Hero/Header - premium glass card over gradient */}
      <header className="sticky top-0 z-50">
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-[#0b5fff] to-[#7c5cff] h-44 md:h-56 w-full" />
          <div className="container mx-auto px-4">
            <div className="-mt-28 md:-mt-32 mb-6">
              <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-3xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col">
                    <h2 className="text-4xl md:text-5xl arabic-text font-extrabold leading-tight text-slate-900">{surah.name}</h2>
                    <p className="text-sm md:text-base bangla-text text-slate-700 mt-1">{surah.name_bn}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2">{surah.englishName} • {surah.revelation} • {surah.ayahCount} আয়াত</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/" aria-label="Back to home">
                      <ArrowLeft className="w-5 h-5 text-slate-800" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDownload} aria-label="Download for offline">
                    <Download className="w-5 h-5 text-slate-800" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setShowWordMeanings(!showWordMeanings)} aria-label="Toggle word meanings">
                    <Settings className="w-5 h-5 text-slate-800" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        <div className="-mt-6 mb-6">
          <div className="bg-gradient-to-r from-white/70 to-white/30 border border-gray-100/60 rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <h3 className="arabic-text text-2xl md:text-3xl font-semibold text-slate-900">{surah.name}</h3>
              <p className="bangla-text text-md text-slate-700 mt-1">{surah.name_bn}</p>
            </div>
          </div>
        </div>

        {/* Ayahs */}
        <div className="space-y-6">
          {surah.ayahs?.map((ayah) => (
            <AyatCard
              key={ayah.ayahNumber}
              ayah={ayah}
              surahNumber={surah.surahNumber}
              showWordMeanings={showWordMeanings}
              surahAyahCount={surah.ayahCount}
            />
          ))}
        </div>

        {/* Attribution */}
        {surah.meta && (
          <div className="mt-8 p-4 bg-white/60 backdrop-blur rounded-lg text-sm text-muted-foreground bangla-text border border-gray-100/60">
            <p>
              <strong>সূত্র:</strong> {surah.meta.source_ar} | {surah.meta.source_translation}
            </p>
            <p className="text-xs mt-1">{surah.meta.license}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SurahDetail;

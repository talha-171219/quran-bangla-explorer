import { useEffect, useState } from "react";
import { Search, Settings, Info, BookMarked, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurahCard } from "@/components/SurahCard";
import surahPageMap from "@/lib/surah-page-map";
import { Surah } from "@/types/quran";
import { fetchSurahList } from "@/lib/quran-api";
import { initDB, getAllSurahs, saveSurah } from "@/lib/db";
import { toast } from "sonner";

const Index = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadedSurahs, setDownloadedSurahs] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    loadSurahs();
    loadDownloadedSurahs();
  }, []);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      const data = await fetchSurahList();
      setSurahs(data);
    } catch (error) {
      console.error("Error loading surahs:", error);
      toast.error("সূরা তালিকা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const loadDownloadedSurahs = async () => {
    try {
      await initDB();
      const cached = await getAllSurahs();
      setDownloadedSurahs(new Set(cached.map((s) => s.surahNumber)));
    } catch (error) {
      console.error("Error loading downloaded surahs:", error);
    }
  };

  const handleDownload = async (surahNumber: number) => {
    toast.info("ডাউনলোড ফিচার শীঘ্রই আসছে");
    // Download implementation would go here
  };

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.name.includes(searchQuery) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.name_bn.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-800 to-slate-700 text-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                কুরআন শব্দে শব্দে
              </h1>
              <p className="text-sm text-slate-200 bangla-text">
                Word by Word Quran in Bangla
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/bookmarks" aria-label="Bookmarks">
                  <BookMarked className="w-5 h-5" />
                </Link>
              </Button>
              {/* Hafezi Quran link intentionally hidden from main UI
                  The Hafezi mini-app remains in the codebase and is reachable
                  via direct URL (e.g. /hafezi-quran-view/1) but should not be
                  accessible from the main navigation. Uncomment below to
                  re-enable the link. */}
              {false && (
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/hafezi-quran" aria-label="Hafezi Quran">
                    <BookOpen className="w-5 h-5" />
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link to="/settings" aria-label="Settings">
                  <Settings className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/about" aria-label="About">
                  <Info className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="সূরা খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bangla-text"
            />
          </div>
        </div>
      </header>

      {/* Main Content - stylish multi-column list */}
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-border max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="sr-only">কুরআন — সূরা তালিকা</h2>
                <p className="text-sm text-muted-foreground">সূরা খুলে শব্দে শব্দে অনুবাদ দেখুন</p>
              </div>
              <div className="text-sm text-muted-foreground">{surahs.length} সূরা</div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">📖 সূরা তালিকা থেকে যে কোন সূরা খুলে শব্দভিত্তিক বাংলা অর্থ দেখুন।</p>
            </div>
          </div>

          {/* Surah Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground bangla-text">সূরা তালিকা লোড হচ্ছে...</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSurahs.length > 0 ? (
                filteredSurahs.map((surah) => (
                  <SurahCard
                      key={surah.surahNumber}
                      surah={surah}
                      isDownloaded={downloadedSurahs.has(surah.surahNumber)}
                      onDownload={handleDownload}
                      // Open Surah detail page (default behaviour)
                      linkTo={`/surah/${surah.surahNumber}`}
                    />
                ))
              ) : (
                <div className="text-center py-12 col-span-full">
                  <p className="text-muted-foreground bangla-text">কোন সূরা পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Attribution Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground bangla-text">
          <p>
            আরবি পাঠ: Al-Quran Cloud API | বাংলা অনুবাদ ও তাফসির: লাইসেন্সকৃত
            উৎস প্রয়োজন
          </p>
          <p className="text-xs mt-2">
            ⚠️ ডেভেলপমেন্ট সংস্করণ - সঠিক লাইসেন্সকৃত বাংলা অনুবাদ এবং তাফসির
            ইন্টিগ্রেশন প্রয়োজন
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

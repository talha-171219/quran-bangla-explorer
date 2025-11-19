import { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bookmark } from "@/types/quran";
import { getBookmarks, deleteBookmark } from "@/lib/db";
import { toast } from "sonner";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await getBookmarks();
      setBookmarks(data);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      toast.error("বুকমার্ক লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBookmark(id);
      setBookmarks(bookmarks.filter((b) => b.id !== id));
      toast.success("বুকমার্ক মুছে ফেলা হয়েছে");
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      toast.error("বুকমার্ক মুছতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0b5fff] to-[#7c5cff] text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/" aria-label="Back to home">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">বুকমার্ক</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-muted-foreground bangla-text">
              বুকমার্ক লোড হচ্ছে...
            </p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <span className="text-3xl">📖</span>
            </div>
            <h2 className="text-xl font-semibold mb-2 bangla-text">
              কোন বুকমার্ক নেই
            </h2>
            <p className="text-muted-foreground bangla-text mb-4">
              আপনার পছন্দের আয়াত বুকমার্ক করুন
            </p>
            <Button asChild>
              <Link to="/">সূরা তালিকায় যান</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link
                    to={`/surah/${bookmark.surahNumber}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-semibold text-primary">
                        সূরা {bookmark.surahNumber}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        আয়াত {bookmark.ayahNumber}
                      </span>
                    </div>
                    {bookmark.note && (
                      <p className="text-sm text-muted-foreground bangla-text line-clamp-2">
                        {bookmark.note}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(bookmark.createdAt).toLocaleDateString("bn-BD")}
                    </p>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(bookmark.id)}
                    className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Delete bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bookmarks;

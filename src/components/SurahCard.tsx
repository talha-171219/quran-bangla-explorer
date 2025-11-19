import { Surah } from "@/types/quran";
import { Button } from "@/components/ui/button";
import { Download, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface SurahCardProps {
  surah: Surah;
  isDownloaded?: boolean;
  onDownload?: (surahNumber: number) => void;
  compact?: boolean;
  // Optional: override default link target. If provided, card will link to this URL instead of `/surah/{n}`
  linkTo?: string;
}

function NumberBadge({ n, size = 40, gradient = false }: { n: number | string; size?: number; gradient?: boolean }) {
  const w = size;
  const fill = gradient ? "url(#g)" : "#ffffff";
  const stroke = "#dbeafe";
  return (
    <svg width={w} height={w} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {gradient && (
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0%" stopColor="#0b5fff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#7c5cff" stopOpacity="0.16" />
          </linearGradient>
        </defs>
      )}
      <path d="M24 3 L30 15 L44 17 L33 26 L36 40 L24 33 L12 40 L15 26 L4 17 L18 15 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
      <text x="50%" y="56%" textAnchor="middle" fontSize={size > 44 ? 14 : 12} fontWeight={700} fill="#0b5fff" fontFamily="Inter, sans-serif">{n}</text>
    </svg>
  );
}

export function SurahCard({ surah, isDownloaded, onDownload, compact = false, linkTo }: SurahCardProps) {
  const target = linkTo ?? `/surah/${surah.surahNumber}`;

  if (compact) {
    return (
      <Link to={target} className="block">
        <div className="flex items-center gap-3 py-3 px-3 bg-amber-50 border border-amber-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-inner">
              <NumberBadge n={surah.surahNumber} size={36} gradient />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold arabic-text text-amber-700">{surah.name}</h3>
                <p className="text-xs bangla-text text-amber-600">{surah.name_bn}</p>
              </div>
              <div className="text-xs text-amber-600">{surah.ayahCount} আয়াত</div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={target} className="block">
      <div className="group bg-gradient-to-r from-amber-50 via-white to-white border border-amber-100 rounded-2xl p-4 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
              <NumberBadge n={surah.surahNumber} size={44} gradient />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-base font-semibold text-amber-900">{surah.englishName}</h3>
                <p className="text-sm bangla-text text-amber-700">{surah.name_bn}</p>
              </div>
              <div className="text-sm text-amber-600">{surah.ayahCount} আয়াত</div>
            </div>
            <div className="text-right">
              <h3 className="text-lg arabic-text font-semibold text-amber-700">{surah.name}</h3>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{surah.revelation}</span>
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            {isDownloaded ? (
              <div className="flex items-center gap-1 text-amber-700 text-sm">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">ডাউনলোড</span>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  onDownload?.(surah.surahNumber);
                }}
                className="hover:bg-amber-50 hover:text-amber-700"
                aria-label="Download surah"
              >
                <Download className="w-4 h-4 text-amber-700" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

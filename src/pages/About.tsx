import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ATTRIBUTION } from "@/lib/quran-api";

const About = () => {
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
            <h1 className="text-xl font-semibold">সম্পর্কে ও অ্যাট্রিবিউশন</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {/* About Section */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 bangla-text">
              কুরআন শব্দে শব্দে - বাংলা
            </h2>
            <div className="space-y-3 bangla-text text-foreground">
              <p>
                এই অ্যাপ্লিকেশনটি পবিত্র কুরআনের শব্দে শব্দে বাংলা অর্থ সহ অধ্যয়নের
                জন্য তৈরি করা হয়েছে। প্রতিটি আরবি শব্দের নিচে বাংলা অর্থ দেখে
                সহজেই কুরআন বুঝতে পারবেন।
              </p>
              <p>
                <strong>বৈশিষ্ট্য:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>শব্দে শব্দে বাংলা অর্থ</li>
                <li>সম্পূর্ণ আয়াতের বাংলা অনুবাদ</li>
                <li>অফলাইন পড়ার সুবিধা</li>
                <li>অডিও তেলাওয়াত (শীঘ্রই)</li>
                <li>বুকমার্ক এবং নোট</li>
              </ul>
            </div>
          </section>

          {/* Data Sources Section */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 bangla-text">ডেটা উৎস এবং লাইসেন্স</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-1">আরবি পাঠ্য</h3>
                <p className="text-sm text-muted-foreground">{ATTRIBUTION.arabic}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  উৎস: Tanzil/Al-Quran Cloud (উসমানি লিপি)
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-1 bangla-text">বাংলা অনুবাদ</h3>
                <p className="text-sm text-muted-foreground bangla-text">
                  {ATTRIBUTION.translation}
                </p>
                <p className="text-xs text-muted-foreground mt-1 bangla-text">
                  অনুবাদক: মুহিউদ্দীন খান (Al-Quran Cloud API এর মাধ্যমে)
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-1 bangla-text">শব্দ অর্থ</h3>
                <p className="text-sm text-muted-foreground bangla-text">
                  {ATTRIBUTION.wordByWord}
                </p>
                <p className="text-xs text-muted-foreground mt-1 bangla-text">
                  উপলব্ধ হলে Quran.com API থেকে প্রদর্শিত
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-1 bangla-text">তাফসির</h3>
                <p className="text-sm text-muted-foreground bangla-text">
                  তাফসির (বিস্তারিত ব্যাখ্যা) এই সংস্করণে সরাসরি অন্তর্ভুক্ত করা হয়নি।
                </p>
                <p className="text-xs text-muted-foreground mt-1 bangla-text">
                  বিস্তারিত তাফসিরের জন্য অনুমোদিত তাফসির গ্রন্থ দেখুন
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                <p className="text-sm bangla-text text-foreground">
                  ✅ <strong>বিশ্বস্ত উৎস:</strong> {ATTRIBUTION.note}
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Section */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 bangla-text">গোপনীয়তা ও ডেটা</h2>
            <div className="space-y-3 text-sm bangla-text text-foreground">
              <p>
                <strong>আমরা আপনার গোপনীয়তাকে সম্মান করি:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>কোন ব্যক্তিগত তথ্য সংগ্রহ করা হয় না</li>
                <li>সব বুকমার্ক এবং নোট আপনার ডিভাইসে স্থানীয়ভাবে সংরক্ষিত</li>
                <li>কোন তৃতীয় পক্ষের ট্র্যাকিং নেই</li>
                <li>অফলাইন ব্যবহার সম্পূর্ণ সমর্থিত</li>
              </ul>
            </div>
          </section>

          {/* Technical Info */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 bangla-text">প্রযুক্তিগত তথ্য</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Platform:</strong> Progressive Web App (PWA)
              </p>
              <p>
                <strong>Offline Support:</strong> IndexedDB + Service Worker
              </p>
              <p>
                <strong>Fonts:</strong> Noto Naskh Arabic, Noto Sans Bengali
              </p>
              <p>
                <strong>Built with:</strong> React, TypeScript, Tailwind CSS
              </p>
            </div>
          </section>

          {/* Contact & Feedback */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 bangla-text">
              যোগাযোগ ও প্রতিক্রিয়া
            </h2>
            <p className="text-sm bangla-text text-foreground mb-4">
              কোন ভুল খুঁজে পেলে বা পরামর্শ থাকলে আমাদের জানান। আপনার মতামত
              আমাদের জন্য অত্যন্ত গুরুত্বপূর্ণ।
            </p>
            <Button variant="outline" className="bangla-text">
              প্রতিক্রিয়া পাঠান
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </section>

          {/* Version Info */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Quran WordByWord — Bangla v1.0.0 (Development)</p>
            <p className="mt-1">© 2024 • Made with ❤️ for learning</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;

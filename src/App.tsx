import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SurahDetail from "./pages/SurahDetail";
import About from "./pages/About";
import Settings from "./pages/Settings";
import Bookmarks from "./pages/Bookmarks";
import NotFound from "./pages/NotFound";
// Hafezi pages removed — imports intentionally deleted

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/surah/:surahNumber" element={<SurahDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          {/* Hafezi mini-app routes removed */}
          {/* removed duplicate/conflicting route for hafezi-quran-view */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

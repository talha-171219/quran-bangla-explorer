import { Surah, Ayah } from "@/types/quran";

// Using Al-Quran Cloud API and Quran.com API as trusted sources
const API_BASE = "https://api.alquran.cloud/v1";
const QURAN_COM_API = "https://api.quran.com/api/v4";

// Bangla translation editions available
const BANGLA_TRANSLATION = "bn.bengali"; // Muhiuddin Khan Bangla translation

export async function fetchSurahList(): Promise<Surah[]> {
  try {
    const response = await fetch(`${API_BASE}/surah`);
    const data = await response.json();
    
    if (data.code === 200) {
      return data.data.map((surah: any) => ({
        surahNumber: surah.number,
        name: surah.name,
        name_bn: getBanglaSurahName(surah.englishName),
        englishName: surah.englishName,
        ayahCount: surah.numberOfAyahs,
        revelation: surah.revelationType === 'Meccan' ? 'Makki' : 'Madani',
      }));
    }
    
    // Fallback to cached data
    return getCachedSurahList();
  } catch (error) {
    console.error("Error fetching surah list:", error);
    return getCachedSurahList();
  }
}

export async function fetchSurahDetail(surahNumber: number): Promise<Surah | null> {
  try {
    // Fetch Arabic text, Bangla translation, word-by-word meanings, and tafsir
    const [arabicResponse, banglaResponse, wordByWordResponse, tafsirResponse] = await Promise.all([
      fetch(`${API_BASE}/surah/${surahNumber}`),
      fetch(`${API_BASE}/surah/${surahNumber}/${BANGLA_TRANSLATION}`),
      fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?language=bn&words=true&per_page=300&fields=text_uthmani,words`),
      // Fetch Tafsir Ibn Kathir in Bangla (resource_id: 163)
      fetch(`https://api.quran.com/api/v4/quran/tafsirs/163?chapter_number=${surahNumber}`)
    ]);

    const arabicData = await arabicResponse.json();
    const banglaData = await banglaResponse.json();

    if (arabicData.code !== 200 || banglaData.code !== 200) {
      return null;
    }

    const surah = arabicData.data;
    const banglaAyahs = banglaData.data.ayahs;

    // Process word-by-word data from Quran.com API v4
    let wordByWordData: any = {};
    try {
      const wordData = await wordByWordResponse.json();
      
      if (wordData.verses) {
        wordData.verses.forEach((verse: any) => {
          if (verse.words) {
            wordByWordData[verse.verse_number] = verse.words;
          }
        });
      }
    } catch (error) {
      console.error("Error fetching word-by-word from Quran.com:", error);
    }

    // Process tafsir data from Quran.com API v4
    let tafsirData: any = {};
    try {
      const tafsirJson = await tafsirResponse.json();
      
      if (tafsirJson.tafsirs) {
        tafsirJson.tafsirs.forEach((tafsir: any) => {
          // verse_key format is "58:1" for surah 58, ayah 1
          const ayahNumber = parseInt(tafsir.verse_key.split(':')[1]);
          tafsirData[ayahNumber] = tafsir.text;
        });
      }
    } catch (error) {
      console.error("Error fetching tafsir from Quran.com:", error);
    }

    // Convert to our format
    const ayahs: Ayah[] = surah.ayahs.map((ayah: any, index: number) => {
      const banglaAyah = banglaAyahs[index];
      const ayahWords = wordByWordData[ayah.numberInSurah] || [];

      // Process words with Bangla meanings
      let words: any[] = [];
      
      if (ayahWords.length > 0) {
        words = ayahWords
          .filter((word: any) => word.char_type_name === "word") // Only actual words, not pause marks
          .map((word: any, idx: number) => ({
            index: idx + 1,
            text_ar: word.text_uthmani || word.text_imlaei || "",
            transliteration: word.transliteration?.text || "",
            word_meaning_bn: word.translation?.text || getWordMeaningFallback(word.text_uthmani),
            morph: word.char_type_name || "",
          }));
      }
      
      // Fallback to basic word splitting if no word data
      if (words.length === 0) {
        words = parseWordsFromText(ayah.text);
      }

      // Get actual tafsir from API - no fallback generation
      const actualTafsir = tafsirData[ayah.numberInSurah] || '';
      const shortTafsir = actualTafsir 
        ? actualTafsir.substring(0, 200).trim() + (actualTafsir.length > 200 ? '...' : '')
        : 'তাফসির লোড হচ্ছে...';
      const fullTafsir = actualTafsir || 'এই আয়াতের বিস্তারিত তাফসির শীঘ্রই যুক্ত করা হবে।';

      return {
        ayahNumber: ayah.numberInSurah,
        text_ar: ayah.text,
        words: words,
        translation_bn: banglaAyah?.text || "অনুবাদ উপলব্ধ নেই",
        tafsir_short_bn: shortTafsir,
        tafsir_full_bn: fullTafsir,
        audio_url: `https://everyayah.com/data/Alafasy_128kbps/${String(surahNumber).padStart(3, '0')}${String(ayah.numberInSurah).padStart(3, '0')}.mp3`,
      };
    });

    return {
      surahNumber: surah.number,
      name: surah.name,
      name_bn: getBanglaSurahName(surah.englishName),
      englishName: surah.englishName,
      ayahCount: surah.numberOfAyahs,
      revelation: surah.revelationType === "Meccan" ? "Makki" : "Madani",
      ayahs,
      meta: {
        source_ar: "Al-Quran Cloud (Uthmani script)",
        source_translation: "মুহিউদ্দীন খান (Muhiuddin Khan) Bangla Translation",
        source_tafsir: "তাফসীর ইবনে কাসীর (বাংলা) - Tafsir Ibn Kathir Bangla",
        license: "Creative Commons - Public Domain",
      },
    };
  } catch (error) {
    console.error("Error fetching surah detail:", error);
    return null;
  }
}

// Helper to parse words from Arabic text (fallback)
function parseWordsFromText(text: string): any[] {
  // Remove Bismillah if present and clean the text
  const cleanText = text.replace(/^بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ\s*/, "").trim();
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  
  return words.map((word, index) => ({
    index: index + 1,
    text_ar: word,
    transliteration: "",
    word_meaning_bn: getWordMeaningFallback(word),
    morph: "",
  }));
}

// Get fallback word meaning for common Arabic words
function getWordMeaningFallback(arabicWord: string): string {
  const commonWords: Record<string, string> = {
    "ٱللَّهِ": "আল্লাহ",
    "ٱللَّهُ": "আল্লাহ",
    "ٱللَّهَ": "আল্লাহকে",
    "بِسۡمِ": "নামে",
    "ٱلرَّحۡمَـٰنِ": "পরম করুণাময়",
    "ٱلرَّحِیمِ": "অতি দয়ালু",
    "ٱلۡحَمۡدُ": "প্রশংসা",
    "رَبِّ": "রব/প্রতিপালক",
    "ٱلۡعَـٰلَمِینَ": "সকল জগতের",
    "مَـٰلِكِ": "মালিক",
    "یَوۡمِ": "দিনের",
    "ٱلدِّینِ": "বিচার",
    "إِیَّاكَ": "তোমাকেই",
    "نَعۡبُدُ": "আমরা ইবাদত করি",
    "وَإِیَّاكَ": "এবং তোমার কাছেই",
    "نَسۡتَعِینُ": "আমরা সাহায্য চাই",
    "ٱهۡدِنَا": "আমাদের হেদায়েত দাও",
    "ٱلصِّرَ ٰ⁠طَ": "পথ",
    "ٱلۡمُسۡتَقِیمَ": "সরল",
    "صِرَ ٰ⁠طَ": "পথ",
    "ٱلَّذِینَ": "যারা/যাদের",
    "أَنۡعَمۡتَ": "তুমি নেয়ামত দিয়েছ",
    "عَلَیۡهِمۡ": "তাদের উপর",
    "غَیۡرِ": "নয়",
    "ٱلۡمَغۡضُوبِ": "ক্রোধপ্রাপ্ত",
    "وَلَا": "এবং না",
    "ٱلضَّاۤلِّینَ": "পথভ্রষ্ট",
    "مِنَ": "থেকে",
    "ٱلۡكِتَـٰبِ": "কিতাবের",
    "فِی": "মধ্যে",
    "ذَ ٰ⁠لِكَ": "এটি",
    "هُدࣰى": "হেদায়েত",
    "لِّلۡمُتَّقِینَ": "মুত্তাকিদের জন্য",
    "یُؤۡمِنُونَ": "বিশ্বাস করে",
    "بِٱلۡغَیۡبِ": "অদৃশ্যে",
    "وَیُقِیمُونَ": "এবং প্রতিষ্ঠা করে",
    "ٱلصَّلَوٰةَ": "নামায",
    "وَمِمَّا": "এবং যা",
    "رَزَقۡنَـٰهُمۡ": "আমরা তাদের রিযিক দিয়েছি",
    "یُنفِقُونَ": "তারা ব্যয় করে",
  };
  
  // Clean the word
  const cleanWord = arabicWord?.trim() || "";
  
  // Check if we have a direct match
  if (commonWords[cleanWord]) {
    return commonWords[cleanWord];
  }
  
  // Return generic meaning
  return "অর্থ";
}


// Get Bangla surah names
function getBanglaSurahName(englishName: string): string {
  const surahNames: Record<string, string> = {
    "Al-Faatiha": "ফাতিহা",
    "Al-Baqara": "বাকারা",
    "Aal-i-Imraan": "আলে ইমরান",
    "An-Nisaa": "নিসা",
    "Al-Maaida": "মায়িদা",
    "Al-An'aam": "আনআম",
    "Al-A'raaf": "আরাফ",
    "Al-Anfaal": "আনফাল",
    "At-Tawba": "তাওবা",
    "Yunus": "ইউনুস",
    "Hud": "হুদ",
    "Yusuf": "ইউসুফ",
    "Ar-Ra'd": "রা'দ",
    "Ibrahim": "ইবরাহীম",
    "Al-Hijr": "হিজর",
    "An-Nahl": "নাহল",
    "Al-Israa": "ইসরা",
    "Al-Kahf": "কাহফ",
    "Maryam": "মারইয়াম",
    "Taa-Haa": "ত্বা-হা",
    "Al-Anbiyaa": "আম্বিয়া",
    "Al-Hajj": "হাজ্জ",
    "Al-Muminoon": "মুমিনুন",
    "An-Noor": "নূর",
    "Al-Furqaan": "ফুরকান",
    "Ash-Shu'araa": "শুআরা",
    "An-Naml": "নামল",
    "Al-Qasas": "কাসাস",
    "Al-Ankaboot": "আনকাবুত",
    "Ar-Room": "রুম",
    "Luqman": "লুকমান",
    "As-Sajda": "সাজদাহ",
    "Al-Ahzaab": "আহযাব",
    "Saba": "সাবা",
    "Faatir": "ফাতির",
    "Yaseen": "ইয়াসিন",
    "As-Saaffaat": "সাফফাত",
    "Saad": "সোয়াদ",
    "Az-Zumar": "যুমার",
    "Ghafir": "গাফির",
    "Fussilat": "ফুসসিলাত",
    "Ash-Shura": "শুরা",
    "Az-Zukhruf": "যুখরুফ",
    "Ad-Dukhaan": "দুখান",
    "Al-Jaathiya": "জাসিয়া",
    "Al-Ahqaf": "আহকাফ",
    "Muhammad": "মুহাম্মদ",
    "Al-Fath": "ফাতহ",
    "Al-Hujuraat": "হুজুরাত",
    "Qaaf": "কাফ",
    "Adh-Dhaariyat": "যারিয়াত",
    "At-Tur": "তুর",
    "An-Najm": "নাজম",
    "Al-Qamar": "কামার",
    "Ar-Rahmaan": "রাহমান",
    "Al-Waaqia": "ওয়াকিয়া",
    "Al-Hadid": "হাদিদ",
    "Al-Mujaadila": "মুজাদালা",
    "Al-Hashr": "হাশর",
    "Al-Mumtahana": "মুমতাহানা",
    "As-Saff": "সফ",
    "Al-Jumu'a": "জুমুআ",
    "Al-Munaafiqoon": "মুনাফিকুন",
    "At-Taghaabun": "তাগাবুন",
    "At-Talaaq": "তালাক",
    "At-Tahrim": "তাহরিম",
    "Al-Mulk": "মুলক",
    "Al-Qalam": "কলম",
    "Al-Haaqqa": "হাক্কা",
    "Al-Ma'aarij": "মাআরিজ",
    "Nooh": "নূহ",
    "Al-Jinn": "জিন্ন",
    "Al-Muzzammil": "মুযযাম্মিল",
    "Al-Muddaththir": "মুদ্দাসসির",
    "Al-Qiyaama": "কিয়ামাহ",
    "Al-Insaan": "ইনসান",
    "Al-Mursalaat": "মুরসালাত",
    "An-Naba": "নাবা",
    "An-Naazi'aat": "নাযিআত",
    "Abasa": "আবাসা",
    "At-Takwir": "তাকভীর",
    "Al-Infitaar": "ইনফিতার",
    "Al-Mutaffifin": "মুতাফফিফিন",
    "Al-Inshiqaaq": "ইনশিকাক",
    "Al-Burooj": "বুরুজ",
    "At-Taariq": "তারিক",
    "Al-A'laa": "আ'লা",
    "Al-Ghaashiya": "গাশিয়া",
    "Al-Fajr": "ফজর",
    "Al-Balad": "বালাদ",
    "Ash-Shams": "শামস",
    "Al-Lail": "লাইল",
    "Ad-Dhuhaa": "দুহা",
    "Ash-Sharh": "শারহ",
    "At-Tin": "তীন",
    "Al-Alaq": "আলাক",
    "Al-Qadr": "কদর",
    "Al-Bayyina": "বাইয়্যিনা",
    "Az-Zalzala": "যিলযাল",
    "Al-Aadiyaat": "আদিয়াত",
    "Al-Qaari'a": "কারিআ",
    "At-Takaathur": "তাকাসুর",
    "Al-Asr": "আসর",
    "Al-Humaza": "হুমাযা",
    "Al-Fil": "ফীল",
    "Quraish": "কুরাইশ",
    "Al-Maa'un": "মাউন",
    "Al-Kawthar": "কাওসার",
    "Al-Kaafiroon": "কাফিরুন",
    "An-Nasr": "নাসর",
    "Al-Masad": "মাসাদ",
    "Al-Ikhlaas": "ইখলাস",
    "Al-Falaq": "ফালাক",
    "An-Naas": "নাস"
  };
  
  return surahNames[englishName] || englishName;
}

// Fallback cached data for offline
function getCachedSurahList(): Surah[] {
  return [
    { surahNumber: 1, name: "الفاتحة", name_bn: "ফাতিহা", englishName: "Al-Faatiha", ayahCount: 7, revelation: 'Makki' },
    { surahNumber: 2, name: "البقرة", name_bn: "বাকারা", englishName: "Al-Baqara", ayahCount: 286, revelation: 'Madani' },
    { surahNumber: 36, name: "يس", name_bn: "ইয়াসিন", englishName: "Yaseen", ayahCount: 83, revelation: 'Makki' },
  ];
}

export const ATTRIBUTION = {
  arabic: "Arabic text: Al-Quran Cloud API (Uthmani Script)",
  translation: "Bangla translation: Muhiuddin Khan (via Al-Quran Cloud API)",
  tafsir: "Tafsir: Context-based interpretations (for detailed tafsir, consult authorized scholars)",
  wordByWord: "Word meanings: Quran.com API (when available)",
  note: "📖 This app uses trusted open APIs. For scholarly research, please consult authorized tafsir books.",
};

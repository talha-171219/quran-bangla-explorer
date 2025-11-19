export interface Word {
  index: number;
  text_ar: string;
  transliteration?: string;
  word_meaning_bn: string;
  morph?: string;
}

export interface Ayah {
  ayahNumber: number;
  text_ar: string;
  words: Word[];
  translation_bn: string;
  audio_url?: string;
}

export interface SurahMeta {
  source_ar: string;
  source_translation: string;
  license: string;
}

export interface Surah {
  surahNumber: number;
  name: string;
  name_bn: string;
  englishName: string;
  ayahCount: number;
  revelation?: 'Makki' | 'Madani';
  ayahs?: Ayah[];
  meta?: SurahMeta;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  note?: string;
  createdAt: number;
}

export interface Settings {
  fontSize: number;
  showTransliteration: boolean;
  showWordMeanings: boolean;
  selectedTranslation?: string;
}

export type TranslationVariables = Record<string, string | number>;

export type TranslationSearch = (key: string, vars?: Record<string, string | number>) => string;

export type LanguageContextType = {
    t: TranslationSearch;
    language: string;
    setLanguage: (langCode: string) => void;
    getLanguages: () => string[];
};

export type TranslationPack = Record<string, string>;

export type LanguagesMap = Record<string, TranslationPack>;

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import languages from '../../ui/locales/languages';
import { logWarn } from '../utils/loggerService';
import { LanguageContextType, TranslationVariables } from '../../types/language';
import { findBestAvailableLanguage, getSystemLanguage } from '../utils/system';
import Storage from '../storage/storageService'
import getAppConfig from '../utils/appConfigHandler';


const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({
    children,
    defaultLanguage = 'en-US',
}: {
    children: React.ReactNode;
    defaultLanguage?: string;
}) => {
    const [language, setLanguageState] = useState(defaultLanguage);
    const [isReady, setIsReady] = useState(false);

    const setLanguage = useCallback((lang: string) => {
        if (!(lang in languages)) {
            logWarn(`LanguageProvider: language '${lang}' not found`);
            return;
        }
        setLanguageState(lang);
        const storageKey = getAppConfig().settings.language.keys.current;
        Storage.set(storageKey, lang);
    }, []);

    const getLanguages = useCallback(() => {
        return Object.keys(languages);
    }, []);

    const t = useCallback(
        (key: string, vars: TranslationVariables = {}) => {
            if (!key) return '';

            const text = languages[language]?.[key] ?? languages[defaultLanguage]?.[key] ?? key;

            if (Object.keys(vars).length === 0) return text;

            return text.replace(/{{(.*?)}}/g, (match, p1) => {
                const value = vars[p1.trim()];
                return value !== undefined ? String(value) : match;
            });
        },
        [language, defaultLanguage],
    );

    useEffect(() => {
        const initLanguage = async () => {
            try {
                const storageKey = getAppConfig().settings.language.keys.current;
                const savedLang = await Storage.get(storageKey);
                
                const bestLang = findBestAvailableLanguage(
                    savedLang ?? getSystemLanguage(),
                    languages,
                    defaultLanguage
                );

                setLanguageState(bestLang);
            } catch (error) {
                logWarn("Failed to load language from storage", error);
            } finally {
                setIsReady(true);
            }
        };
        initLanguage();
    }, []);

    const contextValue = useMemo(() => ({
        t,
        language,
        setLanguage,
        getLanguages
    }), [t, language, setLanguage, getLanguages]);


    if (!isReady) return null;

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

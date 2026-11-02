import { NativeModules, Platform } from "react-native";

export const getSystemLanguage = () => {
    // Web
    if (Platform.OS === 'web') {
        const webLang = window.navigator.language || window.navigator.languages?.[0];
        return webLang ? webLang.split('-')[0] : 'en';
    }

    // iOS
    if (Platform.OS === 'ios') {
        const settings = NativeModules.SettingsManager?.settings;
        const locale = settings?.AppleLocale || settings?.AppleLanguages?.[0];
        return locale ? locale.replace(/[-_]/, '_').split('_')[0] : 'en';
    }

    // Android
    if (Platform.OS === 'android') {
        const locale = NativeModules.I18nManager?.localeIdentifier;
        return locale ? locale.split('_')[0] : 'en';
    }

    return 'en';
};

export const findBestAvailableLanguage = (systemLang: string, availableLanguages: Record<string, any>, defaultLang: string): string => {
    const availableKeys = Object.keys(availableLanguages);

    if (availableKeys.includes(systemLang)) {
        return systemLang;
    }

    const baseSystemLang = systemLang.split('-')[0];
    
    const partialMatch = availableKeys.find(key => {
        const baseKey = key.split('-')[0];
        return baseKey === baseSystemLang;
    });

    return partialMatch || defaultLang;
};
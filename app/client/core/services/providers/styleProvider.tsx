import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
} from 'react';
import themes from '../../ui/styles';
import getAppConfig from '../utils/appConfigHandler';
import Storage from '../storage/storageService'
import type { ReactNode } from 'react';
import type { Theme, ThemeMode } from '../../types/theme';
import { logWarn } from '../utils/loggerService';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { SysValues } from '../../../app/config';


const ThemeContext = createContext<ThemeProviderContext | null>(null);


interface ThemeProviderContext {
    theme: Theme;
    themeMode: ThemeMode;
    currentTheme: string;
    selectTheme: (name: string) => void;
    getThemes: () => string[];
    selectMode: (mode: ThemeMode) => void;
}
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false);
    const [themeMode, setThemeMode] = useState<ThemeMode>('light');
    const [currentTheme, setCurrentTheme] = useState<string>('system');

    const colorScheme = useColorScheme(); 
    const isDarkMode = colorScheme === 'dark';

    const theme = useMemo(() => {
        return themes?.[currentTheme]?.[themeMode] ?? {};
    }, [themeMode, currentTheme]);

    const selectTheme = useCallback((thm: string) => {
        setCurrentTheme(thm);
        const storageKey = getAppConfig().settings.theme.keys.currentTheme;
        Storage.set(storageKey, thm);
    }, []);

    const getThemeNames = useCallback(() => {
        return Object.keys(themes);
    }, []);

    const selectMode = useCallback((mode: ThemeMode) => {
        setThemeMode(mode);
        const storageKey = getAppConfig().settings.theme.keys.currentMode;
        Storage.set(storageKey, mode);
    }, []);


    useEffect(() => {
        const init = async () => {
            try {
                const themeKey = getAppConfig().settings.theme.keys.currentTheme;
                const savedTheme = await Storage.get<string>(themeKey);

                const modeKey = getAppConfig().settings.theme.keys.currentMode;
                const savedMode = await Storage.get<string>(modeKey);
                
                if (savedTheme && savedTheme.length > 0) setCurrentTheme(savedTheme);
                if (savedMode && savedMode.length > 0) setThemeMode(savedMode as ThemeMode);
            } catch (error) {
                logWarn("Failed to load language from storage", error);
            } finally {
                setIsReady(true);
            }
        };
        init();
    }, []);
    useEffect(() => {
        StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor(isDarkMode ? '#000' : '#fff', true);
        }
        const isHidden = Boolean(SysValues.isStatusBarHidden);
        StatusBar.setHidden(isHidden, 'slide');
    }, [isDarkMode]);


    if (!isReady) return null;

    return (
        <ThemeContext.Provider
            value={{
                theme,
                themeMode,
                currentTheme,
                selectTheme,
                getThemes: getThemeNames,
                selectMode,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useStyleContext = (): ThemeProviderContext => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};

export function useStyleAdapter<T>(createStylesFunc: (theme: Theme) => T): T {
    const { theme } = useStyleContext();

    return useMemo(() => createStylesFunc(theme), [createStylesFunc, theme]);
}
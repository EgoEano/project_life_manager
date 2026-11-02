import { ReactNode } from 'react';
import { LanguageProvider } from './languageProviderService';
import { ThemeProvider } from './styleProvider';
import { StorageProvider } from './storageProvider';
import { NotificationProvider } from './notificationProvider';

export function SuperProvider({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <StorageProvider>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                </StorageProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

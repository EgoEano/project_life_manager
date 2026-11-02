import { useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initBootstrap } from "../core/services/bootstrap";
import RootNavigator from "../core/services/navigation/RootNavigator/RootNavigator";
import { SuperProvider } from "../core/services/providers/superProviderService";
import GestureHandlerWrapper from "../core/services/navigation/GestureHandlerWrapper/GestureHandlerWrapper";


export function App() {
    const [isBootstrapped, setIsBootstrapped] = useState(false);

    useEffect(() => {
        async function startApp() {
            try {
                await initBootstrap(); 
                setIsBootstrapped(true);
            } catch (error) {
                console.error("Critical Bootstrap Error:", error);
            }
        }
        startApp();
    }, []);

    if (!isBootstrapped) return null;
    
    return (
        <GestureHandlerWrapper>
            <SafeAreaProvider>
                <SuperProvider>
                    <RootNavigator />
                </SuperProvider>
            </SafeAreaProvider>
        </GestureHandlerWrapper>
    );
}
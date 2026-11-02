import { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function GestureHandlerWrapper({ children }: { children: ReactNode }) {
    return <GestureHandlerRootView style={{ flex: 1 }}>
        {children}
    </GestureHandlerRootView>
}         
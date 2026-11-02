import React, { useMemo } from 'react';
import { NavigationContainer, useNavigationContainerRef, NavigationRoute, NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Navigator } from '../navigationService';
import { RouteNode } from '../../../types/types';
import appRoot from '../../../../modules/routes';
import { NavigationAdapter, NavigationAdapterRoute } from '../../../types/navigation';
import { BackHandler, Platform } from 'react-native';


const Stack = createNativeStackNavigator();


export default function RootNavigator() {
    const navigationRef = useNavigationContainerRef<Record<string, object | undefined>>();
    const RootAppStructure = useMemo(() => compileFlattenScreens(appRoot), []);

    const syncCurrentRoute = () => {
        const currentRoute = navigationRef.getCurrentRoute() as NavigationRoute<Record<string, object | undefined>, string> | undefined;
        if (currentRoute) {
            Navigator.updateRoute({
                name: currentRoute.name,
                params: currentRoute.params || {},
                key: currentRoute.key,
            });
        }
    };

    return (
        <NavigationContainer 
            ref={navigationRef}
            onReady={() => {
                Navigator.setAdapter(createNavigationAdapter(navigationRef));
                syncCurrentRoute();
            }}
            onStateChange={() => syncCurrentRoute()}
        >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {RootAppStructure}
            </Stack.Navigator>
        </NavigationContainer>
    );
}


function compileFlattenScreens(node: RouteNode, screensAcc: React.ReactNode[] = []): React.ReactNode[] {
    if (node.component) {
        const ScreenComponent = node.component as React.ComponentType<unknown>;
        screensAcc.push(
            <Stack.Screen
                key={node.name}
                name={node.name}
                component={ScreenComponent}
                options={node.options as React.ComponentProps<typeof Stack.Screen>['options']}
            />
        );
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
        node.children.forEach((child) => compileFlattenScreens(child, screensAcc));
    }

    return screensAcc;
}

function createNavigationAdapter(ref: NavigationContainerRefWithCurrent<Record<string, object | undefined>>): NavigationAdapter {
    return {
        navigate: (route: NavigationAdapterRoute, params?: unknown) => {
            ref.navigate(route.name, params as object | undefined);
        },
        goBack: () => {
            ref.goBack();
        },
        reset: (config: { index: number; routes: Array<{ name: string }> }) => {
            ref.reset(config);
        },
        exitApp: () => {
            if (Platform.OS === 'android') {
                BackHandler.exitApp();
            } else if (Platform.OS === 'ios') {
                console.warn('Программное закрытие приложения на iOS не поддерживается App Store');
            }
        },
    };
};
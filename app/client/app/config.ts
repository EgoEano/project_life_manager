export const SysValues = {
    isStatusBarHidden: true,
    //#FIXME Не используется в навигаторе
    defaultNavigatorScreenOptions: {
        stack: {
            headerShown: false,
            title: 'My Screen',
            animation: 'fade',
            gestureEnabled: true,
            presentation: 'modal',
            headerStyle: { backgroundColor: '#f00' },
            headerTintColor: '#fff',
        },
    },
} as const;
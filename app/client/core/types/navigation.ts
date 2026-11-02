export interface NavigationAdapterRoute {
    path: string;
    name: string;
}

export interface NavigationAdapter {
    navigate: (route: NavigationAdapterRoute, params?: any) => void;
    goBack: () => void;
    reset: (config: { index: number; routes: Array<{ name: string }> }) => void;
    exitApp: () => void;
}

export interface NavigatorUseRoute {
    params: any;
    name: string;
    key: string;
}
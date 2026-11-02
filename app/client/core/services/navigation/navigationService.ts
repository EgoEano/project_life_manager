import { NavigationAdapter, NavigatorUseRoute, NavigationAdapterRoute } from "../../types/navigation";

let adapter: NavigationAdapter | null = null;
let currentRoute: NavigatorUseRoute = { name: '/', params: {}, key: '' };
const listeners = new Set<(route: NavigatorUseRoute) => void>();


export const Navigator = {
    setAdapter(nav: NavigationAdapter) {
        adapter = nav;
    },

    getCurrentRoute(): NavigatorUseRoute {
        return currentRoute;
    },
    updateRoute(route: NavigatorUseRoute) {
        currentRoute = route;
        listeners.forEach((listener) => listener(route));
    },
    subscribe(listener: (route: NavigatorUseRoute) => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    navigate(route: NavigationAdapterRoute, params?: any) {
        adapter?.navigate(route, params);
    },
    goBack() {
        adapter?.goBack();
    },
    reset(config: { index: number; routes: Array<{ name: string }> }) {
        adapter?.reset(config);
    },

    exitApp() {
        adapter?.exitApp();
    },
};
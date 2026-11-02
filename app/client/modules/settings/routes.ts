import { RouteNode } from '../../core/types/types';
import { SettingsScreen } from './screens/main';

const mainRoutes: RouteNode = {
    path: 'settings',
    name: 'navigation.settings',
    optionsNavigator: {
        type: 'tabs',
        options: {
            headerShown: false,
        },
    },
    component: SettingsScreen,
};

export default mainRoutes;

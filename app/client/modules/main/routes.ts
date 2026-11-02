import { isHeaderBarButtonsAvailableForCurrentPlatform } from 'react-native-screens/lib/typescript/utils';
import { RouteNode } from '../../core/types/types';
import { MainScreen } from './screens/main';

const mainRoutes: RouteNode = {
    path: '',
    name: 'navigation.main',
    optionsNavigator: {
        type: 'tabs',
        options: {
            headerShown: false,
        },
    },
    component: MainScreen,
};

export default mainRoutes;

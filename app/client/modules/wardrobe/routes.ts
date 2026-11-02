import { RouteNode } from '../../core/types/types';
import { Categories } from './screens/categories';
import { Clothing } from './screens/clothings';
import { Outfits } from './screens/outfits';
import { Queue } from './screens/queue';

export default {
    path: 'wardrobe',
    name: 'navigation.wardrobe',
    optionsNavigator: {
        type: 'tabs',
        options: {
            headerShown: false,
        },
    },
    component: Queue,
    children: [
        {
            path: 'queue',
            name: 'navigation.wardrobe.queue',
            component: Queue,
        },
        {
            path: 'outfits',
            name: 'navigation.wardrobe.outfits',
            component: Outfits,
        },
        {
            path: 'clothings',
            name: 'navigation.wardrobe.clothing',
            component: Clothing,
        },
        {
            path: 'categories',
            name: 'navigation.wardrobe.categories',
            component: Categories,
        },
    ],
} as RouteNode;
import { RouteNode } from '../../core/types/types';
import { Products } from './screens/products';
import { Dishes } from './screens/dishes';
import { Categories } from './screens/categories';
import { Queue } from './screens/queue';

export default {
    path: 'kitchen',
    name: 'navigation.kitchen',
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
            name: 'navigation.kitchen.queue',
            component: Queue,
        },
        {
            path: 'products',
            name: 'navigation.kitchen.products',
            component: Products,
        },
        {
            path: 'dishes',
            name: 'navigation.kitchen.dishes',
            component: Dishes,
        },
        {
            path: 'categories',
            name: 'navigation.kitchen.categories',
            component: Categories,
        },
    ],
} as RouteNode;
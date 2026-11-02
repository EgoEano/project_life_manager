import { configureStore } from '@reduxjs/toolkit';

import mainReducer from './main/store/slice';
import wardrobeReducer from './wardrobe/store/slice';
import kitchenReducer from './kitchen/store/slice';

const store = configureStore({
    reducer: {
        main: mainReducer,
        wardrobe: wardrobeReducer,
        kitchen: kitchenReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            thunk: {
                extraArgument: {
                },
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

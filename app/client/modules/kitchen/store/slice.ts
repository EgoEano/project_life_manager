import { createSlice, PayloadAction  } from '@reduxjs/toolkit';
import { ProductItem, FormProductFilter, FormProductItem, FormDishFilter, FormDishItem, DishItem, ChosenDishProducts, SelectedDishProducts, DishItemProduct, KitchenRefs, KitchenOptions, ProductUnit, ProductCategory, DishCategory, DishQueueData, SelectedDishItems, ChosenDishItems } from '../types';
import { fetchProducts, fetchDishes, fetchRefs, fetchDishesQueue } from './thunk'
import { createOptions } from '../../../core/services/utils/parsers';

export interface KitchenState {
    // product
    products: ProductItem[];
    productListVersion: number;
    productFilter: FormProductFilter;
    isProductLoading: boolean;
    // dish
    dishes: DishItem[];
    dishListVersion: number;
    dishFilter: FormDishFilter;
    isDishLoading: boolean;
    selectedDishes: SelectedDishItems; // for selecting in list
    chosenDishes: ChosenDishItems; // as chosen entities
    selectedDishProducts: SelectedDishProducts; // for selecting in list
    chosenDishProducts: ChosenDishProducts; // as chosen entities in dish
    
    // queue
    dishesCurrentQueueData: DishQueueData | null;
    dishesQueue: DishItem["id"][];
    isDishesQueueLoading: boolean;
    // refs
    kitchenRefs: KitchenRefs;
    kitchenOptions: KitchenOptions;
    isRefsLoading: boolean;
}

export const defaultProductItem: FormProductItem = {
    id: null,
    title: "",
    description: "",
    unit: null,
    category: null,
    image: null,
    imageMimeType: null,
};
const defaultProductFilter: FormProductFilter = {
    category: 0,
};
export const defaultDishesFilter: FormDishFilter = {
    category: 0,
};
export const defaultDishesItem: FormDishItem = {
    id: null,
    title: "",
    description: "",
    category: null,
    image: null,
    imageMimeType: null,
    products: [],
};
const initialState: KitchenState = {
    // product
    products: [],
    productListVersion: 1,
    productFilter: defaultProductFilter,
    isProductLoading: false,
    // dish
    dishes: [],
    dishListVersion: 1,
    dishFilter: defaultDishesFilter,
    isDishLoading: false,
    selectedDishes: {},
    chosenDishes: {},
    selectedDishProducts: {},
    chosenDishProducts: {},
    // queue
    dishesCurrentQueueData: null,
    dishesQueue: [],
    isDishesQueueLoading: false,
    // refs
    kitchenRefs: { 
        kitchen_ref_units: [], kitchen_ref_product_categories: [], kitchen_ref_dish_categories: [] 
    },
    kitchenOptions: { 
        kitchen_ref_units: [], 
        kitchen_ref_units_short: [], 
        kitchen_ref_units_filter: [], 
        kitchen_ref_product_categories: [], 
        kitchen_ref_product_categories_filter: [], 
        kitchen_ref_dish_categories: [],
        kitchen_ref_dish_categories_filter: [],
    },
    isRefsLoading: false,
};


const kitchenSlice = createSlice({
    name: 'kitchen',
    initialState,
    reducers: {
        // product
        updateProductListVersion(state) {
            state.productListVersion += 1;
        },

        setProductFilter(state, action: PayloadAction<FormProductFilter>) {
            state.productFilter = action.payload;
        },
        dropProductFilter(state) {
            state.productFilter = defaultProductFilter;
        },
        toggleSelectedProductItems(state, action: PayloadAction<number>) {
            const id = action.payload;
            state.selectedDishProducts[id] = !state.selectedDishProducts[id];
        },
        setSelectedProductItems(state, action: PayloadAction<SelectedDishProducts>) {
            state.selectedDishProducts = action.payload;
        },
        dropSelectedProductItems(state) {
            state.selectedDishProducts = {};
        },
        setSelectedProductItemsFromChosen(state) {
            state.selectedDishProducts = {};
            Object.keys(state.chosenDishProducts).forEach((id) => {
                state.selectedDishProducts[Number(id)] = true;
            });
        },
        dropChosenDishProducts(state) {
            state.chosenDishProducts = {};
        },

        // dish
        updateDishListVersion(state) {
            state.dishListVersion += 1;
        },
        setDishFilter(state, action: PayloadAction<FormDishFilter>) {
            state.dishFilter = action.payload;
        },
        dropDishFilter(state) {
            state.dishFilter = defaultDishesFilter;
        },
        toggleSelectedDishItems(state, action: PayloadAction<number>) {
            const id = action.payload;
            state.selectedDishes[id] = !state.selectedDishes[id];
        },

        setChosenDishProducts(state, action: PayloadAction<FormDishItem["id"]>) {
            state.chosenDishProducts = {};
            state.selectedDishProducts = {};

            const id = action.payload;
            if (!id) return;
                
            const nw = state.dishes.find(d => d.id === id);
            if (!nw) return;

            nw.products.forEach((np) => {
                const has = (state.products?.length > 0) ? state.products.some(p => p.id === np.id) : true;
                if (has) state.chosenDishProducts[np.id] = np;
            });
        },
        updateChosenDishProductsFromSelected(state) {
            const currentChosen = { ...state.chosenDishProducts };

            state.chosenDishProducts = {};

            Object.entries(state.selectedDishProducts).forEach(([stringId, isSelected]) => {
                if (isSelected) {
                    const id = Number(stringId) as ProductItem["id"];
                    const count = currentChosen[id]?.count ?? 1;

                    state.chosenDishProducts[id] = { id, count };
                }
            });
        },
        setChosenDishProductCount(state, action: PayloadAction<DishItemProduct>) {
            const { id, count } = action.payload;
            state.chosenDishProducts = { ...state.chosenDishProducts, [id]: { id, count }};
        },
        dropSelectedDishItems(state) {
            state.selectedDishes = {};
        },
        setSelectedDishesFromChosen(state) {
            state.selectedDishes = {};
            Object.entries(state.chosenDishes).forEach(([id, item]) => {
                if (item && item.isActive) {
                    state.selectedDishes[Number(id)] = true;
                }
            });
        },

        // queue
        setChosenDishesFromQueue(state) {
            state.chosenDishes = {};
            state.selectedDishes = {};

            const nw = state.dishesQueue;
            if (!nw) return;

            nw.forEach((id, orderIdx) => {
                const has = (state.dishes?.length > 0) ? state.dishes.some(p => p.id === id) : true;
                if (has) state.chosenDishes[id] = { id, orderIdx, isActive: true };
            });
        },
        updateChosenDishesFromSelected(state) {
            const previousChosen = { ...state.chosenDishes };
            state.chosenDishes = {};

            const sortedSelectedIds = Object.keys(state.selectedDishes)
                .filter(id => state.selectedDishes[Number(id)])
                .map(Number)
                .sort((a, b) => {
                    const idxA = previousChosen[a]?.orderIdx ?? 0;
                    const idxB = previousChosen[b]?.orderIdx ?? 0;
                    return idxA - idxB;
                });

            sortedSelectedIds.forEach((id, orderIdx) => {
                state.chosenDishes[id] = { id, orderIdx, isActive: true };
            });
        },
        updateChosenDishesFromNewOrder(state, action: PayloadAction<DishItem[]>) {
            const previousChosen = state.chosenDishes;
            state.chosenDishes = {};

            action.payload.forEach(({ id }, orderIdx) => {
                const wasActive = previousChosen[id]?.isActive ?? true;
                state.chosenDishes[id] = { id, orderIdx, isActive: wasActive };
            });
        },
        pushDishToQueueEnd(state, action: PayloadAction<DishItem>) {
            const { id } = action.payload;
            if (!id) return;
        
            const currentItems = Object.values(state.chosenDishes);
            const maxOrderIdx = currentItems.reduce((max, item) => {
                if (item && typeof item.orderIdx === 'number') {
                    return Math.max(max, item.orderIdx);
                }
                return max;
            }, -1);
            const nextOrderIdx = maxOrderIdx + 1;
            const wasActive = state.chosenDishes[id]?.isActive ?? true;
        
            state.chosenDishes[id] = {
                id,
                orderIdx: nextOrderIdx,
                isActive: wasActive
            };
        },
        dropChosenDishes(state) {
            state.chosenDishes = {};
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchProducts
            .addCase(fetchProducts.pending, (state) => {
                state.isProductLoading = true;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.products = action.payload || [];
                state.isProductLoading = false;
            })
            .addCase(fetchProducts.rejected, (state) => {
                state.isProductLoading = false;
            })
            // fetchDishes
            .addCase(fetchDishes.pending, (state) => {
                state.selectedDishProducts = {};
                state.chosenDishProducts = {};
                state.isDishLoading = true;
            })
            .addCase(fetchDishes.fulfilled, (state, action) => {
                state.dishes = action.payload || [];
                state.isDishLoading = false;
            })
            .addCase(fetchDishes.rejected, (state) => {
                state.isDishLoading = false;
            })
            // fetchOutfitsQueue
            .addCase(fetchDishesQueue.pending, (state) => {
                state.dishesCurrentQueueData = null;
                state.selectedDishes = {};
                state.chosenDishes = {};
                state.isDishesQueueLoading = true;
            })
            .addCase(fetchDishesQueue.fulfilled, (state, action) => {
                const payload = action.payload;
                if (payload) {
                    const { ids, ...meta } = payload;
                    state.dishesCurrentQueueData = meta ?? null;
                    state.dishesQueue = ids ?? [];
                }
                state.isDishesQueueLoading = false;
                state.dishListVersion += 1;
            })
            .addCase(fetchDishesQueue.rejected, (state) => {
                state.isDishesQueueLoading = false;
            })
            // fetchRefs
            .addCase(fetchRefs.pending, (state) => {
                state.kitchenRefs = initialState.kitchenRefs;
                state.kitchenOptions = initialState.kitchenOptions;
                state.isRefsLoading = true;
            })
            .addCase(fetchRefs.fulfilled, (state, action) => {
                state.kitchenRefs = action.payload;

                const kitchen_ref_units = createOptions<ProductUnit>({ source: action.payload.kitchen_ref_units, key: "id", value: "label" });
                const kitchen_ref_product_categories = createOptions<ProductCategory>({ source: action.payload.kitchen_ref_product_categories, key: "id", value: "label" });
                const kitchen_ref_dish_categories = createOptions<DishCategory>({ source: action.payload.kitchen_ref_dish_categories, key: "id", value: "label" });
                const tt = { 
                    kitchen_ref_units, 
                    kitchen_ref_units_short: createOptions<ProductUnit>({ source: action.payload.kitchen_ref_units, key: "id", value: "labelShort" }), 
                    kitchen_ref_units_filter: [
                        { key: "0", value: "kitchen.units.all" },
                        ...kitchen_ref_units
                    ], 

                    kitchen_ref_product_categories, 
                    kitchen_ref_product_categories_filter: [
                        { key: "0", value: "kitchen.productCategories.all" },
                        ...kitchen_ref_product_categories
                    ], 

                    kitchen_ref_dish_categories,
                    kitchen_ref_dish_categories_filter: [
                        { key: "0", value: "kitchen.dishCategories.all" },
                        ...kitchen_ref_dish_categories
                    ],
                }
                state.kitchenOptions = tt;
                state.isRefsLoading = false;
            })
            .addCase(fetchRefs.rejected, (state) => {
                state.isRefsLoading = false;
            })
    },
});

export const { 
    setProductFilter, 
    dropProductFilter,
    updateProductListVersion, 
    setSelectedProductItemsFromChosen, 
    setSelectedProductItems, 
    toggleSelectedProductItems, 
    dropSelectedProductItems,
    dropChosenDishProducts,

    //dish
    updateDishListVersion,
    setDishFilter, 
    dropDishFilter,
    toggleSelectedDishItems,
    setChosenDishProducts, 
    updateChosenDishProductsFromSelected, 
    setChosenDishProductCount, 
    updateChosenDishesFromSelected,
    dropSelectedDishItems,
    setSelectedDishesFromChosen,

    //queue
    setChosenDishesFromQueue,
    updateChosenDishesFromNewOrder,
    pushDishToQueueEnd,
    dropChosenDishes
} = kitchenSlice.actions;
export default kitchenSlice.reducer;

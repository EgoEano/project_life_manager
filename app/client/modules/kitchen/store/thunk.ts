import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductItem, FormProductFilter, FormProductItem, FormDishFilter, FormDishItem, DishItem, ProductUnit, ProductCategory, DishCategory, KitchenRefs, KitchenRefElement, DishQueueFilter, DishQueue, DishQueueEntity } from '../types';
import DatabaseLocal from '../../../core/services/storage/dbAdapter';
import getAppConfig from '../../../core/services/utils/appConfigHandler';
import { KitchenState } from './slice';
import { RootState } from '../../stores';
import { RefItemForm } from '../../../core/types/types';

//#region Refs
export const fetchRefs = createAsyncThunk(
    'kitchen/fetchRefs',
    async (_, {}): Promise<KitchenRefs> => {
        const config = getAppConfig().modules.kitchen;
        const [kitchen_ref_units, kitchen_ref_product_categories, kitchen_ref_dish_categories] = await Promise.all([
            DatabaseLocal.getAll<FormProductFilter, ProductUnit>(config.KITCHEN_REF_UNITS, {}),
            DatabaseLocal.getAll<FormProductFilter, ProductCategory>(config.KITCHEN_REF_PRODUCT_CATEGORIES, {}),
            DatabaseLocal.getAll<FormProductFilter, DishCategory>(config.KITCHEN_REF_DISH_CATEGORIES, {})
        ]);
        return { kitchen_ref_units, kitchen_ref_product_categories, kitchen_ref_dish_categories };
    }
);

export const actionRefEntity = createAsyncThunk(
    'kitchen/actionRefEntity',
    async ({ 
        data, name 
    }: { 
        data: RefItemForm; 
        name: Extract<keyof KitchenRefElement, string>; 
    }, {}): Promise<boolean> => {
        const { id, mode, ...values } = data;

        if (mode === "create") {
            await DatabaseLocal.insert<KitchenRefElement>(name, values as KitchenRefElement);
            return true;
        } else if (mode === "edit") {
            const res = await DatabaseLocal.update<KitchenRefElement>(name, id, values as KitchenRefElement);
            return res > 0;
        } else if (mode === "delete") {
            await DatabaseLocal.delete(name, id);
            return true;
        } else throw new Error("unknown_action");
    }
);

//#endregion

//#region Products
export const fetchProducts = createAsyncThunk(
    'kitchen/fetchProducts',
    async (chosenIds: number[] | null, { getState }) => {
        const state = getState() as { kitchen: KitchenState };
        const filter = state.kitchen.productFilter;

        const prepFilter = {
            ...(filter.category != 0 && { category: filter.category }),
        };
        const tableName = getAppConfig().modules.kitchen.KITCHEN_PRODUCTS_TABLE_NAME;

        return await DatabaseLocal.getAll<FormProductFilter, ProductItem>(
            tableName, prepFilter, chosenIds
        );
    }
);
export const saveProduct = createAsyncThunk(
    'kitchen/saveProduct',
    async ({ 
        values, mode 
    }: { 
        values: FormProductItem; mode: "create" | "edit" 
    }, { dispatch }
) => {
        if (
            values.unit === null 
            || values.category === null
        ) return;

        const tableName = getAppConfig().modules.kitchen.KITCHEN_PRODUCTS_TABLE_NAME;

        if (mode === "create") {
            const newItem: ProductItem = {
                ...values,
                id: Date.now(),
                unit: values.unit,
                category: values.category,
            };

            await DatabaseLocal.insert<ProductItem>(
                tableName, newItem
            );

        } else if (mode === "edit") {
            const { id: editedID, ...fields } = values;
            if (editedID === null) return;

            const updatedItem: Omit<ProductItem, "id"> = {
                ...fields,
                image: values.image,
                unit: values.unit,
                category: values.category,
            };

            await DatabaseLocal.update<Omit<ProductItem, "id">>(
                tableName, editedID, updatedItem
            );

        } else throw new Error("saveClothing: unknown mode")
    }
);
export const deleteProduct = createAsyncThunk(
    'kitchen/deleteProduct',
    async (id: number) => {
        const tableName = getAppConfig().modules.kitchen.KITCHEN_PRODUCTS_TABLE_NAME;
        await DatabaseLocal.delete(tableName, id);
    }
);
//#endregion

//#region Dishes
export const fetchDishes = createAsyncThunk(
    'kitchen/fetchDishes',
    async (chosenIds: number[] | null, { getState }) => {
        const state = getState() as { kitchen: KitchenState };
        const filter = state.kitchen.dishFilter;

        const prepFilter = {
            ...(filter.category != 0 && { category: filter.category }),
        };
        const tableName = getAppConfig().modules.kitchen.KITCHEN_DISHES_TABLE_NAME;

        return await DatabaseLocal.getAll<FormDishFilter, DishItem>(
            tableName, prepFilter, chosenIds
        );
    }
);
export const saveDish = createAsyncThunk(
    'kitchen/saveDish',
    async ({ 
        values, mode 
    }: { 
        values: FormDishItem; mode: "create" | "edit" 
    }, { getState }
) => {
        const tableName = getAppConfig().modules.kitchen.KITCHEN_DISHES_TABLE_NAME;

        const rootState = getState() as RootState;
        const chosenProducts = rootState.kitchen.chosenDishProducts;
        const products = Object.values(chosenProducts).filter(Boolean);
        
        if (mode === "create") {
            const newItem: DishItem = {
                ...values,
                id: Date.now(),
                products
            };
    
            await DatabaseLocal.insert<DishItem>(
                tableName, newItem
            );

        } else if (mode === "edit") {
            const {
                id: editedID, ...fields} = values;
            if (
                editedID === null
            ) return;
    
            const newItem: Omit<DishItem, "id"> = {
                ...fields,
                products,
            };

            await DatabaseLocal.update<Omit<DishItem, "id">>(
                tableName, editedID, newItem
            );
        } else throw new Error("saveDish: unknown mode")
    }
);
export const deleteDish = createAsyncThunk(
    'kitchen/deleteDish',
    async (id: number) => {
        const tableName = getAppConfig().modules.kitchen.KITCHEN_DISHES_TABLE_NAME;
        await DatabaseLocal.delete(tableName, id);
    }
);
//#endregion

//#region Dishes Queue
export const fetchDishesQueue = createAsyncThunk(
    'kitchen/fetchDishesQueue',
    async (_, { }) => {
        const tableName = getAppConfig().modules.kitchen.KITCHEN_DISHES_QUEUE_TABLE_NAME;
        const queueName = getAppConfig().modules.kitchen.KITCHEN_DISHES_QUEUE_MAIN_NAME;

        const prepFilter: DishQueueFilter = {
            name: queueName
        };

        const rows = await DatabaseLocal.getAll<DishQueueFilter, DishQueue>(
            tableName, prepFilter
        );
        return rows.find(r => r.name === queueName);
    }
);
export const saveDishesQueue = createAsyncThunk(
    'wardrobe/saveDishesQueue',
    async (_, { getState }
) => {
        const tableName = getAppConfig().modules.kitchen.KITCHEN_DISHES_QUEUE_TABLE_NAME;

        const rootState = getState() as RootState;
        const chosen = rootState.kitchen.chosenDishes;
        const meta = rootState.kitchen.dishesCurrentQueueData;

        if (!meta?.id || !meta.name) return;
        
        const ids = Object
            .values(chosen)
            .filter((item) => Boolean(item && item.isActive))
            .sort((a, b) => a.orderIdx - b.orderIdx)
            .map((item) => Number(item.id));

        const updatedItem: DishQueueEntity = {
            name: meta.name,
            ids,
        };
        await DatabaseLocal.update<Omit<DishQueueEntity, "id">>(
            tableName, meta?.id, updatedItem
        );
    }
);
//#endregion

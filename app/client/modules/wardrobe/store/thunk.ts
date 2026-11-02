import { createAsyncThunk } from '@reduxjs/toolkit';
import { ClothingItem, FormClothingFilter, FormClothingItem, FormOutfitFilter, FormOutfitItem, OutfitItem, OutfitQueue, OutfitQueueEntity, OutfitQueueFilter, Season, Slot, WardrobeRefElement, WardrobeRefs } from '../types';
import DatabaseLocal from '../../../core/services/storage/dbAdapter';
import getAppConfig from '../../../core/services/utils/appConfigHandler';
import { WardrobeState } from './slice';
import { RootState } from '../../stores';
import { RefItemForm } from '../../../core/types/types';


//#region Refs
export const fetchRefs = createAsyncThunk(
    'wardrobe/fetchRefs',
    async (_, {}): Promise<WardrobeRefs> => {
        const config = getAppConfig().modules.wardrobe;
        const [wardrobe_ref_seasons, wardrobe_ref_slots] = await Promise.all([
            DatabaseLocal.getAll<FormClothingFilter, Season>(config.WARDROBE_REF_SEASONS, {}),
            DatabaseLocal.getAll<FormClothingFilter, Slot>(config.WARDROBE_REF_SLOTS, {}),
        ]);
        return { wardrobe_ref_seasons, wardrobe_ref_slots };
    }
);

export const actionRefEntity = createAsyncThunk(
    'wardrobe/actionRefEntity',
    async ({ 
        data, name 
    }: { 
        data: RefItemForm; 
        name: Extract<keyof WardrobeRefElement, string>; 
    }, {}): Promise<boolean> => {
        const { id, mode, ...values } = data;

        if (mode === "create") {
            await DatabaseLocal.insert<WardrobeRefElement>(name, values as WardrobeRefElement);
            return true;
        } else if (mode === "edit") {
            const res = await DatabaseLocal.update<WardrobeRefElement>(name, id, values as WardrobeRefElement);
            return res > 0;
        } else if (mode === "delete") {
            await DatabaseLocal.delete(name, id);
            return true;
        } else throw new Error("unknown_action");
    }
);

//#endregion


//#region Clothings
export const fetchClothings = createAsyncThunk(
    'wardrobe/fetchClothings',
    async (chosenIds: number[] | null, { getState }) => {
        const state = getState() as { wardrobe: WardrobeState };
        const filter = state.wardrobe.clothingFilter;

        const prepFilter = {
            ...(filter.season != 0 && { season: filter.season }),
            // ...(filter.state != 0 && { state: filter.state }),
            ...(filter.slot != 0 && { slot: filter.slot }),
        };
        const tableName = getAppConfig().modules.wardrobe.WARDROBE_CLOTHING_TABLE_NAME;

        return await DatabaseLocal.getAll<FormClothingFilter, ClothingItem>(
            tableName, prepFilter, chosenIds
        );
    }
);
export const saveClothing = createAsyncThunk(
    'wardrobe/saveClothing',
    async ({ 
        values, mode 
    }: { 
        values: FormClothingItem; mode: "create" | "edit" 
    }, { dispatch }
) => {
        if (
            values.season === null 
            // || values.state === null 
            || values.slot === null
        ) return;

        const tableName = getAppConfig().modules.wardrobe.WARDROBE_CLOTHING_TABLE_NAME;

        if (mode === "create") {
            const newItem: ClothingItem = {
                ...values,
                id: Date.now(),
                season: values.season,
                // state: values.state,
                slot: values.slot,
            };
            await DatabaseLocal.insert<ClothingItem>(
                tableName, newItem
            );

        } else if (mode === "edit") {
            const { id: editedID, ...fields } = values;
            if (editedID === null) return;

            const updatedItem: Omit<ClothingItem, "id"> = {
                ...fields,
                season: values.season,
                // state: values.state,
                slot: values.slot,
            };
            await DatabaseLocal.update<Omit<ClothingItem, "id">>(
                tableName, editedID, updatedItem
            );

        } else throw new Error("saveClothing: unknown mode")
    }
);
export const deleteClothing = createAsyncThunk(
    'wardrobe/deleteClothing',
    async (id: number) => {
        const tableName = getAppConfig().modules.wardrobe.WARDROBE_CLOTHING_TABLE_NAME;
        await DatabaseLocal.delete(tableName, id);
    }
);
//#endregion

//#region Outfits
export const fetchOutfits = createAsyncThunk(
    'wardrobe/fetchOutfits',
    async (chosenIds: number[] | null, { getState }) => {
        const state = getState() as { wardrobe: WardrobeState };
        const filter = state.wardrobe.outfitFilter;

        const prepFilter = {
            ...(filter.season != 0 && { season: filter.season }),
        };
        const tableName = getAppConfig().modules.wardrobe.WARDROBE_OUTFITS_TABLE_NAME;

        return await DatabaseLocal.getAll<FormOutfitFilter, OutfitItem>(
            tableName, prepFilter, chosenIds
        );
    }
);
export const saveOutfit = createAsyncThunk(
    'wardrobe/saveOutfit',
    async ({ 
        values, mode 
    }: { 
        values: FormOutfitItem; mode: "create" | "edit" 
    }, { getState }
) => {
        if (values.season === null) return;

        const tableName = getAppConfig().modules.wardrobe.WARDROBE_OUTFITS_TABLE_NAME;

        const rootState = getState() as RootState;
        const chosen = rootState.wardrobe.chosenOutfitClothings;
        const clothingIds = Object
            .entries(chosen)
            .filter(([k, v]) => Boolean(v))
            .map(([k,v]) => Number(k));
        
        if (mode === "create") {
            const newItem: OutfitItem = {
                ...values,
                id: Date.now(),
                season: values.season,
                clothingIds
            };
    
            await DatabaseLocal.insert<OutfitItem>(
                tableName, newItem
            );

        } else if (mode === "edit") {
            const {id: editedID, ...fields} = values;
            if (
                editedID === null
                || fields.season === null
            ) return;
    
            const newItem: Omit<OutfitItem, "id"> = {
                ...fields,
                season: fields.season,
                clothingIds
            };

            await DatabaseLocal.update<Omit<OutfitItem, "id">>(
                tableName, editedID, newItem
            );
        } else throw new Error("saveOutfit: unknown mode")
    }
);
export const deleteOutfit = createAsyncThunk(
    'wardrobe/deleteOutfit',
    async (id: number) => {
        const tableName = getAppConfig().modules.wardrobe.WARDROBE_OUTFITS_TABLE_NAME;
        await DatabaseLocal.delete(tableName, id);
    }
);
//#endregion

//#region Outfits Queue
export const fetchOutfitsQueue = createAsyncThunk(
    'wardrobe/fetchOutfitsQueue',
    async (_, { }) => {
        const tableName = getAppConfig().modules.wardrobe.WARDROBE_OUTFITS_QUEUE_TABLE_NAME;
        const queueName = getAppConfig().modules.wardrobe.WARDROBE_OUTFITS_QUEUE_MAIN_NAME;

        const prepFilter: OutfitQueueFilter = {
            name: queueName
        };

        const rows = await DatabaseLocal.getAll<OutfitQueueFilter, OutfitQueue>(
            tableName, prepFilter
        );
        return rows.find(r => r.name === queueName);
    }
);
export const saveOutfitsQueue = createAsyncThunk(
    'wardrobe/saveOutfitsQueue',
    async (_, { getState }
) => {
        const tableName = getAppConfig().modules.wardrobe.WARDROBE_OUTFITS_QUEUE_TABLE_NAME;

        const rootState = getState() as RootState;
        const chosen = rootState.wardrobe.chosenOutfits;
        const meta = rootState.wardrobe.outfitsCurrentQueueData;

        if (!meta?.id || !meta.name) return;
        
        const ids = Object
            .values(chosen)
            .filter((item) => Boolean(item && item.isActive))
            .sort((a, b) => a.orderIdx - b.orderIdx)
            .map((item) => Number(item.id));

        const updatedItem: OutfitQueueEntity = {
            name: meta.name,
            ids,
        };
        await DatabaseLocal.update<Omit<OutfitQueueEntity, "id">>(
            tableName, meta?.id, updatedItem
        );
    }
);
//#endregion

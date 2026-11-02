import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChosenClothingItems, ChosenOutfitItems, ClothingItem, FormClothingFilter, FormClothingItem, FormOutfitFilter, FormOutfitItem, OutfitItem, OutfitQueue, OutfitQueueData, Season, SelectedClothingItems, SelectedOutfitItems, Slot, WardrobeOptions, WardrobeRefs } from '../types';
import { fetchClothings, fetchOutfits, fetchOutfitsQueue, fetchRefs } from './thunk'
import { createOptions } from '../../../core/services/utils/parsers';

export interface WardrobeState {
    // clothings
    clothings: ClothingItem[];
    clothingListVersion: number;
    clothingFilter: FormClothingFilter;
    isClothingLoading: boolean;
    // outfits
    outfits: OutfitItem[];
    outfitListVersion: number;
    outfitFilter: FormOutfitFilter;
    isOutfitLoading: boolean;
    selectedOutfits: SelectedOutfitItems; // for selecting in list
    chosenOutfits: ChosenOutfitItems; // as chosen entities
    selectedOutfitClothings: SelectedClothingItems; // for selecting in list
    chosenOutfitClothings: ChosenClothingItems; // as chosen entities
    // queue
    outfitsCurrentQueueData: OutfitQueueData | null;
    outfitsQueue: OutfitItem["id"][];
    isOutfitsQueueLoading: boolean;
    // refs
    wardrobeRefs: WardrobeRefs;
    wardrobeOptions: WardrobeOptions;
    isRefsLoading: boolean;
    
}

export const defaultClothingItem: FormClothingItem = {
    id: null,
    title: "",
    description: "",
    // mainColor: "#000000",
    // accentColor: "#FFFFFF",
    season: null,
    // state: null,
    slot: null,
    image: null,
    imageMimeType: null,
};
const defaultClothingFilter: FormClothingFilter = {
    season: 0,
    // state: 0,
    slot: 0,
};
export const defaultOutfitsFilter: FormOutfitFilter = {
    season: 0,
};
export const defaultOutfitsItem: FormOutfitItem = {
    id: null,
    title: "",
    description: "",
    // mainColor: "#000000",
    // accentColor: "#FFFFFF",
    season: null,
    image: null,
    imageMimeType: null,
    clothingIds: [],
};
const initialState: WardrobeState = {
    // clothings
    clothings: [],
    clothingListVersion: 1,
    clothingFilter: defaultClothingFilter,
    isClothingLoading: false,
    // outfits
    outfits: [],
    outfitListVersion: 1,
    outfitFilter: defaultOutfitsFilter,
    isOutfitLoading: false,
    selectedOutfits: {},
    chosenOutfits: {},
    selectedOutfitClothings: {},
    chosenOutfitClothings: {},
    // queue
    outfitsQueue: [],
    outfitsCurrentQueueData: null,
    isOutfitsQueueLoading: false,
    // refs
    wardrobeRefs: { 
        wardrobe_ref_seasons: [], wardrobe_ref_slots: [] 
    },
    wardrobeOptions: { 
        wardrobe_ref_seasons: [], 
        wardrobe_ref_seasons_filter: [], 
        wardrobe_ref_slots: [], 
        wardrobe_ref_slots_filter: [], 
    },
    isRefsLoading: false,
    
};


const wardrobeSlice = createSlice({
    name: 'wardrobe',
    initialState,
    reducers: {
        // clothing
        updateClothingListVersion(state) {
            state.clothingListVersion += 1;
        },
        setClothingFilter(state, action: PayloadAction<FormClothingFilter>) {
            state.clothingFilter = action.payload;
        },
        dropClothingFilter(state) {
            state.clothingFilter = defaultClothingFilter;
        },
        toggleSelectedClothingItems(state, action: PayloadAction<number>) {
            const id = action.payload;
            state.selectedOutfitClothings[id] = !state.selectedOutfitClothings[id];
        },
        setSelectedClothingItems(state, action: PayloadAction<SelectedClothingItems>) {
            state.selectedOutfitClothings = action.payload;
        },
        dropSelectedClothingItems(state) {
            state.selectedOutfitClothings = {};
        },
        setSelectedClothingItemsFromChosen(state) {
            state.selectedOutfitClothings = {};
            Object.keys(state.chosenOutfitClothings).forEach((id) => {
                state.selectedOutfitClothings[Number(id)] = true;
            });
        },
        dropChosenOutfitClothings(state) {
            state.chosenOutfitClothings = {};
        },

        // outfit
        updateOutfitListVersion(state) {
            state.outfitListVersion += 1;
        },
        setOutfitFilter(state, action: PayloadAction<FormOutfitFilter>) {
            state.outfitFilter = action.payload;
        },
        dropOutfitFilter(state) {
            state.outfitFilter = defaultOutfitsFilter;
        },
        toggleSelectedOutfitItems(state, action: PayloadAction<number>) {
            const id = action.payload;
            state.selectedOutfits[id] = !state.selectedOutfits[id];
        },
        setSelectedOutfitItems(state, action: PayloadAction<SelectedOutfitItems>) {
            state.selectedOutfits = action.payload;
        },
        dropSelectedOutfitItems(state) {
            state.selectedOutfits = {};
        },
        setSelectedOutfitsFromChosen(state) {
            state.selectedOutfits = {};
            Object.entries(state.chosenOutfits).forEach(([id, item]) => {
                if (item && item.isActive) {
                    state.selectedOutfits[Number(id)] = true;
                }
            });
        },
        setChosenOutfitClothings(state, action: PayloadAction<FormOutfitItem["id"]>) {
            state.chosenOutfitClothings = {};
            state.selectedOutfitClothings = {};

            const id = action.payload;
            if (!id) return;
                
            const nw = state.outfits.find(d => d.id === id);
            if (!nw) return;

            nw.clothingIds.forEach((nid) => {
                const has = (state.clothings?.length > 0) ? state.clothings.some(p => p.id === nid) : true;
                if (has) state.chosenOutfitClothings[nid] = true;
            });
        },
        dropChosenOutfits(state) {
            state.chosenOutfits = {};
        },

        // queue
        setChosenOutfitsFromQueue(state) {
            state.chosenOutfits = {};
            state.selectedOutfits = {};

            const nw = state.outfitsQueue;
            if (!nw) return;

            nw.forEach((id, orderIdx) => {
                const has = (state.outfits?.length > 0) ? state.outfits.some(p => p.id === id) : true;
                if (has) state.chosenOutfits[id] = { id, orderIdx, isActive: true };
            });
        },
        updateChosenOutfitClothingsFromSelected(state) {
            state.chosenOutfitClothings = {};

            Object.entries(state.selectedOutfitClothings).forEach(([stringId, isSelected]) => {
                if (isSelected) {
                    state.chosenOutfitClothings[Number(stringId)] = true;
                }
            });
        },
        updateChosenOutfitsFromSelected(state) {
            const previousChosen = { ...state.chosenOutfits };
            state.chosenOutfits = {};

            const sortedSelectedIds = Object.keys(state.selectedOutfits)
                .filter(id => state.selectedOutfits[Number(id)])
                .map(Number)
                .sort((a, b) => {
                    const idxA = previousChosen[a]?.orderIdx ?? 0;
                    const idxB = previousChosen[b]?.orderIdx ?? 0;
                    return idxA - idxB;
                });

            sortedSelectedIds.forEach((id, orderIdx) => {
                state.chosenOutfits[id] = { id, orderIdx, isActive: true };
            });
        },
        updateChosenOutfitsFromNewOrder(state, action: PayloadAction<OutfitItem[]>) {
            const previousChosen = state.chosenOutfits;
            state.chosenOutfits = {};

            action.payload.forEach(({ id }, orderIdx) => {
                const wasActive = previousChosen[id]?.isActive ?? true;
                state.chosenOutfits[id] = { id, orderIdx, isActive: wasActive };
            });
        },
        pushOutfitToQueueEnd(state, action: PayloadAction<OutfitItem>) {
            const { id } = action.payload;
            if (!id) return;
        
            const currentItems = Object.values(state.chosenOutfits);
            const maxOrderIdx = currentItems.reduce((max, item) => {
                if (item && typeof item.orderIdx === 'number') {
                    return Math.max(max, item.orderIdx);
                }
                return max;
            }, -1);
            const nextOrderIdx = maxOrderIdx + 1;
            const wasActive = state.chosenOutfits[id]?.isActive ?? true;
        
            state.chosenOutfits[id] = {
                id,
                orderIdx: nextOrderIdx,
                isActive: wasActive
            };
        },

    },
    extraReducers: (builder) => {
        builder
            // fetchClothings
            .addCase(fetchClothings.pending, (state) => {
                state.isClothingLoading = true;
            })
            .addCase(fetchClothings.fulfilled, (state, action) => {
                state.clothings = action.payload || [];
                state.isClothingLoading = false;
            })
            .addCase(fetchClothings.rejected, (state) => {
                state.isClothingLoading = false;
            })
            // fetchOutfits
            .addCase(fetchOutfits.pending, (state) => {
                state.selectedOutfitClothings = {};
                state.chosenOutfitClothings = {};
                state.isOutfitLoading = true;
            })
            .addCase(fetchOutfits.fulfilled, (state, action) => {
                state.outfits = action.payload || [];
                state.isOutfitLoading = false;
            })
            .addCase(fetchOutfits.rejected, (state) => {
                state.isOutfitLoading = false;
            })
            // fetchOutfitsQueue
            .addCase(fetchOutfitsQueue.pending, (state) => {
                state.outfitsCurrentQueueData = null;
                state.selectedOutfits = {};
                state.chosenOutfits = {};
                state.isOutfitsQueueLoading = true;
            })
            .addCase(fetchOutfitsQueue.fulfilled, (state, action) => {
                const payload = action.payload;
                if (payload) {
                    const { ids, ...meta } = payload;
                    state.outfitsCurrentQueueData = meta ?? null;
                    state.outfitsQueue = ids ?? [];
                }
                state.isOutfitsQueueLoading = false;
                state.outfitListVersion += 1;
            })
            .addCase(fetchOutfitsQueue.rejected, (state) => {
                state.isOutfitsQueueLoading = false;
            })
            // fetchRefs
            .addCase(fetchRefs.pending, (state) => {
                state.wardrobeRefs = initialState.wardrobeRefs;
                state.wardrobeOptions = initialState.wardrobeOptions;
                state.isRefsLoading = true;
            })
            .addCase(fetchRefs.fulfilled, (state, action) => {
                state.wardrobeRefs = action.payload;

                const wardrobe_ref_seasons = createOptions<Season>({ source: action.payload.wardrobe_ref_seasons, key: "id", value: "label" });
                const wardrobe_ref_slots = createOptions<Slot>({ source: action.payload.wardrobe_ref_slots, key: "id", value: "label" });

                state.wardrobeOptions = { 
                    wardrobe_ref_seasons, 
                    wardrobe_ref_seasons_filter: [
                        { key: "0", value: "wardrobe.seasons.all" },
                        ...wardrobe_ref_seasons
                    ], 

                    wardrobe_ref_slots, 
                    wardrobe_ref_slots_filter: [
                        { key: "0", value: "wardrobe.slots.all" },
                        ...wardrobe_ref_slots
                    ], 
                }
                state.isRefsLoading = false;
            })
            .addCase(fetchRefs.rejected, (state) => {
                state.isRefsLoading = false;
            })

    },
});

export const { 
    updateClothingListVersion, 
    updateOutfitListVersion,
    setClothingFilter, dropClothingFilter,
    setOutfitFilter, dropOutfitFilter,
    toggleSelectedClothingItems,
    toggleSelectedOutfitItems,
    setSelectedClothingItems,
    dropSelectedClothingItems,
    dropSelectedOutfitItems,
    setSelectedClothingItemsFromChosen,
    setSelectedOutfitsFromChosen,
    setChosenOutfitClothings,
    setChosenOutfitsFromQueue,
    updateChosenOutfitClothingsFromSelected,
    updateChosenOutfitsFromSelected,
    updateChosenOutfitsFromNewOrder,
    pushOutfitToQueueEnd,
    dropChosenOutfitClothings,
    dropChosenOutfits
} = wardrobeSlice.actions;
export default wardrobeSlice.reducer;

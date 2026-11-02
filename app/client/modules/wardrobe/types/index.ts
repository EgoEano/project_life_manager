import { RefItem, Option } from "../../../core/types/types";


export interface Season extends RefItem {};
// export interface State extends RefItem {}
export interface Slot extends RefItem {}


export interface FormClothingFilter {
    season: Season["id"];
    // state: State["id"];
    slot: Slot["id"];
}
export type FormClothingFilterKeys = keyof FormClothingFilter;

export interface FormClothingItem {
    id: number | null;
    title: string;
    description: string;
    // mainColor: string;
    // accentColor: string;

    season: Season["id"] | null;
    // state: State["id"] | null;
    slot: Slot["id"] | null;

    image: Uint8Array | null;
    imageMimeType: string | null;
}

export interface ClothingItem extends FormClothingItem {
    id: number;
    season: Season["id"];
    // state: State["id"];
    slot: Slot["id"];
}
export type SelectedClothingItems = Record<ClothingItem["id"], boolean>;
export type ChosenClothingItems = Record<ClothingItem["id"], boolean>;

export interface FormOutfitFilter {
    season: Season["id"];
}
export type FormOutfitFilterKeys = keyof FormOutfitFilter;

export interface FormOutfitItem {
    id: number | null;
    title: string;
    description: string;
    // mainColor: string;
    // accentColor: string;

    season: Season["id"] | null;

    image: Uint8Array | null;
    imageMimeType: string | null;

    clothingIds: number[];
}

export interface OutfitItem extends FormOutfitItem {
    id: number;
    season: Season["id"];
}
export type SelectedOutfitItems = Record<OutfitItem["id"], boolean>;
export interface ChosenOutfitItem {
    isActive: boolean;
    id: OutfitItem["id"];
    orderIdx: number;
};
export type ChosenOutfitItems = Record<OutfitItem["id"], ChosenOutfitItem>;


// queue
export interface OutfitQueueEntity {
    name: string;
    ids: number[];
}
export interface OutfitQueue extends OutfitQueueEntity {
    id: number;
}
export type OutfitQueueData = Pick<OutfitQueue, "id" | "name">

export interface OutfitQueueFilter {
    name: OutfitQueue["name"];
}

// refs
export interface WardrobeRefs {
    wardrobe_ref_seasons: Season[];
    // wardrobe_ref_states: State[];
    wardrobe_ref_slots: Slot[];
}
export interface WardrobeOptions {
    wardrobe_ref_seasons: Option[];
    wardrobe_ref_seasons_filter: Option[];
    // wardrobe_ref_states: Option[];
    // wardrobe_ref_states_filter: Option[];
    wardrobe_ref_slots: Option[];
    wardrobe_ref_slots_filter: Option[];
}
export type WardrobeRefElement = Season | Slot;

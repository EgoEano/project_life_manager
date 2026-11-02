import getAppConfig from "../../../core/services/utils/appConfigHandler";
import { CollectionDatabaseSchema, DatabaseSchema } from "../../../core/types/types";
import { OutfitQueue, Season, Slot } from "../types";


// Season
export const REF_SEASONS = [
    { id: 1, label: "wardrobe.seasons.winter" },
    { id: 2, label: "wardrobe.seasons.summer" },
    { id: 3, label: "wardrobe.seasons.middleseason" },
] as const satisfies Season[];

// State
// export const REF_STATES = [
//     { id: 1, label: "wardrobe.states.ruined" },
//     { id: 2, label: "wardrobe.states.wornout" },
//     { id: 3, label: "wardrobe.states.shabby" },
//     { id: 4, label: "wardrobe.states.good" },
//     { id: 5, label: "wardrobe.states.excellent" },
// ] as const satisfies State[];

// Slot
export const REF_SLOTS = [
    { id: 1, label: "wardrobe.slots.head" },
    { id: 2, label: "wardrobe.slots.mask" },
    { id: 3, label: "wardrobe.slots.neck" },
    { id: 4, label: "wardrobe.slots.glasses" },
    { id: 5, label: "wardrobe.slots.torsoBottom" },
    { id: 6, label: "wardrobe.slots.torsoMid" },
    { id: 7, label: "wardrobe.slots.torsoTop" },
    { id: 8, label: "wardrobe.slots.shoulders" },
    { id: 9, label: "wardrobe.slots.hands" },
    { id: 10, label: "wardrobe.slots.gloves" },
    { id: 11, label: "wardrobe.slots.ring" },
    { id: 12, label: "wardrobe.slots.underware" },
    { id: 13, label: "wardrobe.slots.legBottom" },
    { id: 14, label: "wardrobe.slots.legTop" },
    { id: 15, label: "wardrobe.slots.socks" },
    { id: 16, label: "wardrobe.slots.shoes" },
] as const satisfies Slot[];

export const WardrobeRefNames = [
    getAppConfig().modules.wardrobe.WARDROBE_REF_SEASONS,
    getAppConfig().modules.wardrobe.WARDROBE_REF_SLOTS,
];

export const schema: DatabaseSchema = {
    [getAppConfig().modules.wardrobe.WARDROBE_CLOTHING_TABLE_NAME]: {
        primaryKey: "++id",
        indexes: ["title"],
        columns: {
            id: "INTEGER",
            title: "TEXT",
            description: "TEXT",
            season: "INTEGER",
            slot: "INTEGER",
            image: "BLOB",
            imageMimeType: "TEXT"
        }
    },
    [getAppConfig().modules.wardrobe.WARDROBE_OUTFITS_TABLE_NAME]: {
        primaryKey: "++id",
        indexes: ["title"],
        columns: {
            id: "INTEGER",
            title: "TEXT",
            description: "TEXT",
            season: "INTEGER",
            image: "BLOB",
            imageMimeType: "TEXT",
            clothingIds: "TEXT"
        }
    },
    [getAppConfig().modules.wardrobe.WARDROBE_OUTFITS_QUEUE_TABLE_NAME]: {
        primaryKey: "++id",
        indexes: ["name"],
        columns: {
            id: "INTEGER",
            name: "TEXT",
            ids: "TEXT"
        }
    },
    ...Object.fromEntries(WardrobeRefNames.map((k) => [
        k, { 
            primaryKey: "++id", 
            indexes: ["label"],
            columns: {
                id: "INTEGER",
                label: "TEXT"
            }
        } as CollectionDatabaseSchema
    ]))

};


export const seed = {
    [getAppConfig().modules.wardrobe.WARDROBE_OUTFITS_QUEUE_TABLE_NAME]: [
        { 
            id: 1, ids: [],
            name: getAppConfig().modules.wardrobe.WARDROBE_OUTFITS_QUEUE_MAIN_NAME
        }
    ] as OutfitQueue[],
    [getAppConfig().modules.wardrobe.WARDROBE_REF_SEASONS]: REF_SEASONS as Season[],
    [getAppConfig().modules.wardrobe.WARDROBE_REF_SLOTS]: REF_SLOTS as Slot[],
}
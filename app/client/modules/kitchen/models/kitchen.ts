import getAppConfig from "../../../core/services/utils/appConfigHandler";
import { CollectionDatabaseSchema, DatabaseSchema } from "../../../core/types/types";
import { DishCategory, DishQueue, ProductCategory, ProductUnit } from "../types";


// Units
export const REF_UNITS = [
    { id: 1, label: "kitchen.units.milligram", labelShort: "kitchen.units.milligram_short" },
    { id: 2, label: "kitchen.units.gram", labelShort: "kitchen.units.gram_short" },
    { id: 3, label: "kitchen.units.kilogram", labelShort: "kitchen.units.kilogram_short" },
    { id: 4, label: "kitchen.units.milliliter", labelShort: "kitchen.units.milliliter_short" },
    { id: 5, label: "kitchen.units.liter", labelShort: "kitchen.units.liter_short" },
    { id: 6, label: "kitchen.units.piece", labelShort: "kitchen.units.piece_short" },
    { id: 7, label: "kitchen.units.slice", labelShort: "kitchen.units.slice_short" },
    { id: 8, label: "kitchen.units.pack", labelShort: "kitchen.units.pack_short" },
    { id: 9, label: "kitchen.units.can", labelShort: "kitchen.units.can_short" },
    { id: 10, label: "kitchen.units.bottle", labelShort: "kitchen.units.bottle_short" },
    { id: 11, label: "kitchen.units.bundle", labelShort: "kitchen.units.bundle_short" },
] as const satisfies ProductUnit[];

// ProductCategories
export const REF_PRODUCT_CATEGORIES = [
    { id: 1, label: "kitchen.productCategories.vegetables" },
    { id: 2, label: "kitchen.productCategories.fruits" },
    { id: 3, label: "kitchen.productCategories.berries" },
    { id: 4, label: "kitchen.productCategories.greens" },
    { id: 5, label: "kitchen.productCategories.mushrooms" },
    { id: 6, label: "kitchen.productCategories.nuts_and_seeds" },
    { id: 7, label: "kitchen.productCategories.meat" },
    { id: 8, label: "kitchen.productCategories.sausages" },
    { id: 9, label: "kitchen.productCategories.offal" },
    { id: 10, label: "kitchen.productCategories.fish" },
    { id: 11, label: "kitchen.productCategories.seafood" },
    { id: 12, label: "kitchen.productCategories.eggs" },
    { id: 13, label: "kitchen.productCategories.dairy" },
    { id: 14, label: "kitchen.productCategories.milk" },
    { id: 15, label: "kitchen.productCategories.cheese" },
    { id: 16, label: "kitchen.productCategories.cottage_cheese" },
    { id: 17, label: "kitchen.productCategories.yogurt_and_kefir" },
    { id: 18, label: "kitchen.productCategories.butter" },
    { id: 19, label: "kitchen.productCategories.cream" },
    { id: 20, label: "kitchen.productCategories.grains_and_legumes" },
    { id: 21, label: "kitchen.productCategories.cereals" },
    { id: 22, label: "kitchen.productCategories.pasta" },
    { id: 23, label: "kitchen.productCategories.bread_and_pastries" },
    { id: 24, label: "kitchen.productCategories.legumes" },
    { id: 25, label: "kitchen.productCategories.oils_and_fats" },
    { id: 26, label: "kitchen.productCategories.vegetable_oils" },
    { id: 27, label: "kitchen.productCategories.animal_fats" },
    { id: 28, label: "kitchen.productCategories.sweets_and_desserts" },
    { id: 29, label: "kitchen.productCategories.chocolate_and_candies" },
    { id: 30, label: "kitchen.productCategories.pastries_and_cakes" },
    { id: 31, label: "kitchen.productCategories.honey" },
    { id: 32, label: "kitchen.productCategories.jams_and_preserves" },
    { id: 33, label: "kitchen.productCategories.canned_and_pickled" },
    { id: 34, label: "kitchen.productCategories.vegetable_canned" },
    { id: 35, label: "kitchen.productCategories.fruit_canned" },
    { id: 36, label: "kitchen.productCategories.fish_canned" },
    { id: 37, label: "kitchen.productCategories.meat_canned" },
    { id: 38, label: "kitchen.productCategories.pickles_and_marinades" },
    { id: 39, label: "kitchen.productCategories.sauces_and_seasonings" },
    { id: 40, label: "kitchen.productCategories.sauces" },
    { id: 41, label: "kitchen.productCategories.spices" },
    { id: 42, label: "kitchen.productCategories.salt" },
    { id: 43, label: "kitchen.productCategories.sugar" },
    { id: 44, label: "kitchen.productCategories.beverages" },
    { id: 45, label: "kitchen.productCategories.water" },
    { id: 46, label: "kitchen.productCategories.tea" },
    { id: 47, label: "kitchen.productCategories.coffee" },
    { id: 48, label: "kitchen.productCategories.juices" },
    { id: 49, label: "kitchen.productCategories.soft_drinks" },
    { id: 50, label: "kitchen.productCategories.alcoholic_beverages" },
    { id: 51, label: "kitchen.productCategories.special_nutrition" },
    { id: 52, label: "kitchen.productCategories.dietary_products" },
    { id: 53, label: "kitchen.productCategories.sports_nutrition" },
] as const satisfies ProductCategory[];

// DishCategories
export const REF_DISH_CATEGORIES = [
    { id: 1, label: "kitchen.dishCategories.breakfast" },
    { id: 2, label: "kitchen.dishCategories.lunch" },
    { id: 3, label: "kitchen.dishCategories.dinner" },
    { id: 4, label: "kitchen.dishCategories.snack" },
    { id: 5, label: "kitchen.dishCategories.dessert" },
    { id: 6, label: "kitchen.dishCategories.salad" },
    { id: 7, label: "kitchen.dishCategories.soup" },
    { id: 8, label: "kitchen.dishCategories.main_course" },
    { id: 9, label: "kitchen.dishCategories.side_dish" },
    { id: 10, label: "kitchen.dishCategories.appetizer" },
    { id: 11, label: "kitchen.dishCategories.beverage" },
    { id: 12, label: "kitchen.dishCategories.sauce" },
    { id: 13, label: "kitchen.dishCategories.bakery" },
    { id: 14, label: "kitchen.dishCategories.vegetarian" },
    { id: 15, label: "kitchen.dishCategories.keto" },
    { id: 16, label: "kitchen.dishCategories.high_protein" },
    { id: 17, label: "kitchen.dishCategories.low_calorie" },
] as const satisfies DishCategory[];


export const KitchenRefNames = [
    getAppConfig().modules.kitchen.KITCHEN_REF_UNITS,
    getAppConfig().modules.kitchen.KITCHEN_REF_PRODUCT_CATEGORIES,
    getAppConfig().modules.kitchen.KITCHEN_REF_DISH_CATEGORIES,
];

const defaultRefColumns = {
    id: "INTEGER",
    label: "TEXT"
};
export const schema: DatabaseSchema = {
    [getAppConfig().modules.kitchen.KITCHEN_PRODUCTS_TABLE_NAME]: {
        primaryKey: "++id",
        indexes: ["title"],
        columns: {
            id: "INTEGER",
            title: "TEXT",
            description: "TEXT",
            unit: "INTEGER",
            category: "INTEGER",
            image: "BLOB",
            imageMimeType: "TEXT"
        }
    },
    [getAppConfig().modules.kitchen.KITCHEN_DISHES_TABLE_NAME]: {
        primaryKey: "++id",
        indexes: ["title"],
        columns: {
            id: "INTEGER",
            title: "TEXT",
            description: "TEXT",
            category: "INTEGER",
            image: "BLOB",
            imageMimeType: "TEXT",
            products: 'TEXT'
        }
    },
    [getAppConfig().modules.kitchen.KITCHEN_DISHES_QUEUE_TABLE_NAME]: {
        primaryKey: "++id",
        indexes: ["name"],
        columns: {
            id: "INTEGER",
            name: "TEXT",
            ids: "TEXT"
        }
    },

    // refs
    [getAppConfig().modules.kitchen.KITCHEN_REF_PRODUCT_CATEGORIES]: {
        primaryKey: "++id",
        indexes: ["label"],
        columns: { ...defaultRefColumns }
    } as CollectionDatabaseSchema,
    [getAppConfig().modules.kitchen.KITCHEN_REF_DISH_CATEGORIES]: {
        primaryKey: "++id",
        indexes: ["label"],
        columns: { ...defaultRefColumns }
    } as CollectionDatabaseSchema,
    [getAppConfig().modules.kitchen.KITCHEN_REF_UNITS]: {
        primaryKey: "++id",
        indexes: ["label"],
        columns: {
            ...defaultRefColumns,
            labelShort: "TEXT"
        }
    } as CollectionDatabaseSchema
};

export const seed = {
    [getAppConfig().modules.kitchen.KITCHEN_DISHES_QUEUE_TABLE_NAME]: [
        { 
            id: 1, ids: [],
            name: getAppConfig().modules.kitchen.KITCHEN_DISHES_QUEUE_MAIN_NAME
        }
    ] as DishQueue[],
    [getAppConfig().modules.kitchen.KITCHEN_REF_UNITS]: REF_UNITS as ProductUnit[],
    [getAppConfig().modules.kitchen.KITCHEN_REF_PRODUCT_CATEGORIES]: REF_PRODUCT_CATEGORIES as ProductCategory[],
    [getAppConfig().modules.kitchen.KITCHEN_REF_DISH_CATEGORIES]: REF_DISH_CATEGORIES as DishCategory[],
}
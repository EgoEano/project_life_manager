import { RefItem, Option } from "../../../core/types/types";


export interface ProductUnit extends RefItem {
    labelShort: string;
}
export interface ProductCategory extends RefItem {}
export interface DishCategory extends RefItem {}


export interface FormProductFilter {
    category: ProductCategory["id"];
}
export type FormProductFilterKeys = keyof FormProductFilter;

export interface FormProductItem {
    id: number | null;
    title: string;
    description: string;

    unit: ProductUnit["id"] | null;
    category: ProductCategory["id"] | null;

    image: Uint8Array | null;
    imageMimeType: string | null;
}

export interface ProductItem extends FormProductItem {
    id: number;
    unit: ProductUnit["id"];
    category: ProductCategory["id"];
}
export type SelectedDishProducts = Record<ProductItem["id"], boolean>;
export type ChosenDishProducts = Record<ProductItem["id"], DishItemProduct>;


export interface FormDishFilter {
    category: DishCategory["id"];
}
export type FormDishFilterKeys = keyof FormDishFilter;

export interface DishItemProduct {
    id: ProductItem["id"];
    count: number;
};
export interface FormDishItem {
    id: number | null;
    title: string;
    description: string;

    category: DishCategory["id"] | null;

    image: Uint8Array | null;
    imageMimeType: string | null;

    products: DishItemProduct[];
}

export interface DishItem extends FormDishItem {
    id: number;
}
export type SelectedDishItems = Record<DishItem["id"], boolean>;
export interface ChosenDishItem {
    isActive: boolean;
    id: DishItem["id"];
    orderIdx: number;
};
export type ChosenDishItems = Record<DishItem["id"], ChosenDishItem>;


// queue
export interface DishQueueEntity {
    name: string;
    ids: number[];
}
export interface DishQueue extends DishQueueEntity {
    id: number;
}
export type DishQueueData = Pick<DishQueue, "id" | "name">

export interface DishQueueFilter {
    name: DishQueue["name"];
}


// refs
export interface KitchenRefs {
    kitchen_ref_units: ProductUnit[];
    kitchen_ref_product_categories: ProductCategory[];
    kitchen_ref_dish_categories: DishCategory[];
}
export interface KitchenOptions {
    kitchen_ref_units: Option[];
    kitchen_ref_units_short: Option[];
    kitchen_ref_units_filter: Option[];
    kitchen_ref_product_categories: Option[];
    kitchen_ref_product_categories_filter: Option[];
    kitchen_ref_dish_categories: Option[];
    kitchen_ref_dish_categories_filter: Option[];
}
export type KitchenRefElement = ProductUnit | ProductCategory | DishCategory;

import { DishItem } from ".";

export interface DishListProps {
    onPress: (outfit: DishItem) => void;
    onDragEnd: (newData: DishItem[]) => void;
    isViewMode?: boolean;
    isSelectionMode?: boolean;
}

export interface DishListTileProps {
    item: DishItem;
    onPress: (item: DishItem) => void;
    drag: () => void;
    isActive: boolean;
    isSelected?: boolean;
    isMiniView?: boolean;
}
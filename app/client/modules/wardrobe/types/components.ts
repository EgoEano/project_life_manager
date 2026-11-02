import { OutfitItem } from ".";

export interface OutfitListProps {
    onPress: (outfit: OutfitItem) => void;
    onDragEnd: (newData: OutfitItem[]) => void;
    isViewMode?: boolean;
    isSelectionMode?: boolean;
}

export interface OutfitListTileProps {
    item: OutfitItem;
    onPress: (item: OutfitItem) => void;
    drag: () => void;
    isActive: boolean;
    isSelected?: boolean;
    isMiniView?: boolean;
}
import { 
    View,
    Image,
    Pressable,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { styles } from "../../theme/styles";
import DragList from 'react-native-draglist';
import { arrayBufferToBase64 } from "../../../../core/utils/helpers";
import { Button, Text } from '../../../../core/ui/components/interfaceComponents';
import { useMemo } from "react";
import { useLanguage } from "../../../../core/services/providers/languageProviderService";
import { useStyleAdapter } from "../../../../core/services/providers/styleProvider";
import { DishListProps, DishListTileProps } from '../../types/components'
import { DishItem } from "../../types";
import { pushDishToQueueEnd } from "../../store/slice";
import { saveDishesQueue } from "../../store/thunk";

export function DishList({
    onPress,
    onDragEnd,
    isViewMode = false,
    isSelectionMode = false,
}: DishListProps) {
    const style = useStyleAdapter(styles);

    const dishes = useAppSelector((state) => state.kitchen.dishes);
    const chosen = useAppSelector((state) => state.kitchen.chosenDishes);
    const selected = useAppSelector((state) => state.kitchen.selectedDishes);
   
    const sorted = useMemo(() => {
        if (!isViewMode) return dishes;

        return [...dishes].sort((a, b) => {
            const orderA = chosen[a.id]?.orderIdx ?? 0;
            const orderB = chosen[b.id]?.orderIdx ?? 0;
            return orderA - orderB;
        });
    }, [dishes, chosen, isViewMode]);

    async function handleReordered(fromIndex: number, toIndex: number) {
        const copy = [...sorted];
        const [removed] = copy.splice(fromIndex, 1);
        copy.splice(toIndex, 0, removed);
        
        onDragEnd(copy); 
    }

    return (
        <View style={style.listViewport}>
            <DragList<DishItem>
                data={sorted}
                key={dishes.length}
                keyExtractor={(item, idx) => item?.id?.toString() ?? idx.toString()}
                containerStyle={style.listViewport}
                style={style.listViewport}
                contentContainerStyle={style.list}
                showsVerticalScrollIndicator={false}
                onReordered={handleReordered}
                renderItem={({ 
                    item, onDragStart, isActive 
                }) => {

                    const isSelected = isSelectionMode && (selected?.[item.id] ?? false);

                    return (
                        <DishListTile 
                            item={item}
                            onPress={onPress}
                            isSelected={isSelected}
                            isMiniView={isViewMode}
                            drag={onDragStart}
                            isActive={isActive}
                        />
                    );
                }}
            />
        </View>
    );

}

export function DishListTile({
    item,
    onPress,
    drag,
    isActive,
    isSelected = false,
    isMiniView = false,
}: DishListTileProps) {
    const {t} = useLanguage();
    const style = useStyleAdapter(styles);
    const dispatch = useAppDispatch();

    async function onBtnSelect() {
        dispatch(pushDishToQueueEnd(item)); 
        await dispatch(saveDishesQueue());
    }

    return (
        <Pressable
            key={item.id}
            disabled={isActive}
            onPress={() => onPress(item)}
            onLongPress={drag}  
            delayLongPress={200}

            style={{
                ...style.card,
                ...(isMiniView ? style.cardModMini : {}),
                ...(isSelected ? style.cardSelectedMod : {}),
                ...(isActive ? style.cardModDragged : {})
            }}
        >

            {(item.image && item.imageMimeType) &&
            <View style={isMiniView ? style.cardImageContainerMini : style.cardImageContainer}>
                <Image
                    source={{ 
                        uri: `data:${item.imageMimeType};base64,${arrayBufferToBase64(item.image)}` 
                    }}
                    style={{
                        ...(isMiniView ? style.cardImageMini : style.cardImage), 
                        ...(isSelected ? style.cardImageTransparency : {})
                    }}
                />
            </View>}

            <View style={isMiniView ? style.cardContentMini : style.cardContent}>

                <View style={isMiniView ? style.cardHeaderMini : style.cardHeader}>
                    <Text 
                        style={isMiniView ? style.cardTitleMini : style.cardTitle}
                        numberOfLines={1} 
                        ellipsizeMode="tail"
                    >
                        {isMiniView ? `${item.title.slice(0,10)}${item.title.length > 10 ? "..." : ""}` : item.title}
                    </Text>
                </View>

                {isMiniView && <Button 
                    title={`✔️`}
                    onPress={onBtnSelect}
                    style={{
                        button: style.btnMiniViewAction
                    }}
                />}
            </View>
        </Pressable>
    );
}


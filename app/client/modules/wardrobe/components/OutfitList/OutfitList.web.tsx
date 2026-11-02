import { 
    View,
    Image,
    Pressable,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { styles } from "../../theme/styles";
import { OutfitItem } from "../../types";
import DragList from 'react-native-draglist';
import { arrayBufferToBase64 } from "../../../../core/utils/helpers";
import { Button, Text } from '../../../../core/ui/components/interfaceComponents';
import { OutfitListProps, OutfitListTileProps } from "../../types/components";
import { useMemo } from "react";
import { pushOutfitToQueueEnd } from "../../store/slice";
import { saveOutfitsQueue } from "../../store/thunk";
import { useLanguage } from "../../../../core/services/providers/languageProviderService";
import { useStyleAdapter } from "../../../../core/services/providers/styleProvider";



export function OutfitList({
    onPress,
    onDragEnd,
    isViewMode = false,
    isSelectionMode = false,
}: OutfitListProps) {
    const style = useStyleAdapter(styles);

    const outfits = useAppSelector((state) => state.wardrobe.outfits);
    const chosen = useAppSelector((state) => state.wardrobe.chosenOutfits);
    const selected = useAppSelector((state) => state.wardrobe.selectedOutfits);

    const sortedOutfits = useMemo(() => {
        if (!isViewMode) return outfits;

        return [...outfits].sort((a, b) => {
            const orderA = chosen[a.id]?.orderIdx ?? 0;
            const orderB = chosen[b.id]?.orderIdx ?? 0;
            return orderA - orderB;
        });
    }, [outfits, chosen, isViewMode]);

    async function handleReordered(fromIndex: number, toIndex: number) {
        const copy = [...sortedOutfits];
        const [removed] = copy.splice(fromIndex, 1);
        copy.splice(toIndex, 0, removed);
        
        onDragEnd(copy); 
    }

    return (
        <View style={style.listViewport}>
            <DragList<OutfitItem>
                data={sortedOutfits}
                key={outfits.length}
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
                        <OutfitListTile 
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

function OutfitListTile({
    item,
    onPress,
    drag,
    isActive,
    isSelected = false,
    isMiniView = false,
}: OutfitListTileProps) {
    const {t} = useLanguage();
    const style = useStyleAdapter(styles);
    const dispatch = useAppDispatch();

    async function onBtnSelect() {
        dispatch(pushOutfitToQueueEnd(item)); 
        await dispatch(saveOutfitsQueue());
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

                {!isMiniView && <Text style={style.cardDescription}>
                    {item.description}
                </Text>}

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

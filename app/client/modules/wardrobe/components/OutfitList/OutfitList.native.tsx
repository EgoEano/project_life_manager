import { 
    TouchableOpacity, 
    View,
    Image,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { styles } from "../../theme/styles";
import { OutfitItem } from "../../types";
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { arrayBufferToBase64 } from "../../../../core/utils/helpers";
import { Button, Text } from '../../../../core/ui/components/interfaceComponents';
import { OutfitListProps, OutfitListTileProps } from "../../types/components";
import { useMemo } from "react";
import { useLanguage } from "../../../../core/services/providers/languageProviderService";
import { pushOutfitToQueueEnd } from "../../store/slice";
import { saveOutfitsQueue } from "../../store/thunk";
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
    
    return (
        <DraggableFlatList<OutfitItem>
            data={sortedOutfits}
            keyExtractor={(item, idx) => item?.id?.toString() ?? idx.toString()}
            contentContainerStyle={style.list}
            showsVerticalScrollIndicator={false}
            onDragEnd={({ data }) => onDragEnd(data)}
            renderItem={({ item, drag, isActive }) => {

                const isSelected = isSelectionMode && (selected?.[item.id] ?? false);

                return (
                    <OutfitListTile 
                        item={item}
                        onPress={onPress}
                        isSelected={isSelected}
                        isMiniView={isViewMode}
                        drag={drag}
                        isActive={isActive}
                    />
                );
            }}
        />
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
        <ScaleDecorator>
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                disabled={isActive}
                onPress={() => onPress(item)}
                onLongPress={drag}
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
            </TouchableOpacity>
        </ScaleDecorator>
    );
}

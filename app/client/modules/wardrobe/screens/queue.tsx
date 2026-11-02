import { useEffect } from 'react';
import { Button } from '../../../core/ui/components/interfaceComponents';
import {
    View,
} from 'react-native';
import { useNotification } from '../../../core/services/providers/notificationProvider';
import { OutfitItem } from '../types';
import { Layout, PlaceholderScreen } from '../../../core/ui/components/navigationComponents';
import { useDbReady } from '../../../core/services/hooks/useDbReady';
import { styles } from '../theme/styles';
import { setChosenOutfitsFromQueue, updateChosenOutfitsFromNewOrder } from '../store/slice';
import { useAppDispatch } from '../store/hooks';
import { fetchOutfitsQueue, fetchRefs, saveOutfitsQueue } from '../store/thunk';
import { useLanguage } from '../../../core/services/providers/languageProviderService';
import { OutfitSelector, OutfitsScreen } from './outfits';
import { useStyleAdapter } from '../../../core/services/providers/styleProvider';



function QueueScreen() {
    const dispatch = useAppDispatch();
    const style = useStyleAdapter(styles);
    const { pushModalTop } = useNotification();


    async function refreshData() {
        await dispatch(fetchOutfitsQueue()).unwrap();
        dispatch(setChosenOutfitsFromQueue());
    };
    async function save() {
        refreshData();
    }
    function openItemSelector() {
        pushModalTop(() => (
            <OutfitSelector
                onSave={save}
            />
        ), {
            style: {
                card: style.squareModalCard,
                content: style.squareModalContent
            },
            modal: {
                isOverlay: false,
                hasCross: false,
                isClosable: false,
            }
        });
    };
    async function handleDragEnd(newData: OutfitItem[]) {
        dispatch(updateChosenOutfitsFromNewOrder(newData)); 
        await dispatch(saveOutfitsQueue());
    };


    useEffect(() => {
        refreshData();
        dispatch(fetchRefs());
    }, []);


    return (
        <View style={style.root}>
            {/* LIST */}
            <OutfitsScreen
                onDragEnd={handleDragEnd}
                isViewMode={true}
            />

            {/* FAB */}
            <Button 
                title="☰" 
                variant={"negative"}
                onPress={openItemSelector} 
                style={{
                    button: style.fab,
                    text: style.fabText
                }}
            />
        </View>
    );
}

export function Queue() {
    const {t} = useLanguage();
    const isDbReady = useDbReady();

    if (!isDbReady) return <PlaceholderScreen name={`${t("initializing")}...`}/>

    return (
        <Layout>
            <QueueScreen/>
        </Layout>
    );
}
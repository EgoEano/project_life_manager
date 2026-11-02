import { useEffect } from 'react';
import { Button } from '../../../core/ui/components/interfaceComponents';
import {
    View,
} from 'react-native';
import { useNotification } from '../../../core/services/providers/notificationProvider';
import { DishItem } from '../types';
import { Layout, PlaceholderScreen } from '../../../core/ui/components/navigationComponents';
import { useDbReady } from '../../../core/services/hooks/useDbReady';
import { styles } from '../theme/styles';
import { setChosenDishesFromQueue, updateChosenDishesFromNewOrder } from '../store/slice';
import { useAppDispatch } from '../store/hooks';
import { fetchDishesQueue, fetchRefs, saveDishesQueue } from '../store/thunk';
import { useLanguage } from '../../../core/services/providers/languageProviderService';
import { DishSelector, DishesScreen } from './dishes';
import { useStyleAdapter } from '../../../core/services/providers/styleProvider';



function QueueScreen() {
    const dispatch = useAppDispatch();
    const style = useStyleAdapter(styles);
    const { pushModalTop } = useNotification();


    async function refreshData() {
        await dispatch(fetchDishesQueue()).unwrap();
        dispatch(setChosenDishesFromQueue());
    };
    async function save() {
        refreshData();
    }
    function openItemSelector() {
        pushModalTop(() => (
            <DishSelector
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
    async function handleDragEnd(newData: DishItem[]) {
        dispatch(updateChosenDishesFromNewOrder(newData)); 
        await dispatch(saveDishesQueue());
    };


    useEffect(() => {
        refreshData();
        dispatch(fetchRefs());
    }, []);


    return (
        <View style={style.root}>
            {/* LIST */}
            <DishesScreen
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
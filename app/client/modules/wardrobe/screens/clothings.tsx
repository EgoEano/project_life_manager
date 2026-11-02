import React, { useCallback, useEffect, useState } from 'react';
import { Formik, FormikErrors } from 'formik';
import { Text, Input, Button, Select, ModalImage } from '../../../core/ui/components/interfaceComponents';
import {
    TouchableOpacity,
    Image,
    FlatList,
    View,
} from 'react-native';
import { useNotification } from '../../../core/services/providers/notificationProvider';
import { FormClothingFilter, FormClothingItem, Season, Slot, ClothingItem, SelectedClothingItems, FormClothingFilterKeys } from '../types';
import type { Option } from '../../../core/types/types';
import { Layout, PlaceholderScreen } from '../../../core/ui/components/navigationComponents';
import { useDbReady } from '../../../core/services/hooks/useDbReady';
import { styles } from '../theme/styles';
import { useAppDispatch, useAppSelector } from '../store/hooks'; 
import { defaultClothingItem, dropClothingFilter, dropSelectedClothingItems, setClothingFilter, setSelectedClothingItemsFromChosen, toggleSelectedClothingItems, updateChosenOutfitClothingsFromSelected, updateClothingListVersion } from '../store/slice';
import { deleteClothing, fetchClothings, fetchRefs, saveClothing } from '../store/thunk';
import { useLanguage } from '../../../core/services/providers/languageProviderService';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../../../core/utils/helpers';
import { pickImage } from '../../../core/utils/images';
import { useStyleAdapter } from '../../../core/services/providers/styleProvider';



export function ClothingScreen({
    isSelectionMode = false,
    isViewMode = false,
}: {
    isSelectionMode?: boolean;
    isViewMode?: boolean;
}) {
    const dispatch = useAppDispatch();
    const { pushModalTop, removeModal } = useNotification();
    const style = useStyleAdapter(styles);

    
    const filter = useAppSelector((state) => state.wardrobe.clothingFilter);
    const chosen = useAppSelector((state) => state.wardrobe.chosenOutfitClothings);
    const refreshTrigger = useAppSelector((state) => state.wardrobe.clothingListVersion);

    const chosenIds = React.useMemo(() => {
        return isViewMode ? Object.keys(chosen).map(Number) : null;
    }, [isViewMode, chosen]);


    function refreshData() {
        dispatch(fetchClothings(chosenIds));
    };
    function selectClothing(item?: ClothingItem) {
        if (isSelectionMode) {
            if (!item) return;
            dispatch(toggleSelectedClothingItems(item.id))
        } else {
            actionClothing(item)
        }
    }
    function actionClothing(item?: ClothingItem) {
        const formItem: FormClothingItem = item ?? defaultClothingItem;
        
        pushModalTop(() => (
            <ClothingCard
                mode={!item ? "create" : "edit"}
                form={formItem}
                onSubmit={handleSaveClothing}
                onCancel={handleCloseClothing}
                actionDelete={handleDeleteClothing}
            />
        ), {
            style: { 
                card: style.squareModalCard,
                content: style.squareModalContent
            },
            modal: {
                hasCross: false,
                isClosable: false,
                isScrollable: true,
            }
        });
    };
    async function handleSaveClothing(values: FormClothingItem, mode: "create" | "edit") {
        await dispatch(saveClothing({ values, mode }));
        refreshData();
        removeModal();
    };
    async function handleCloseClothing() {
        refreshData();
        removeModal();
    };
    async function handleDeleteClothing(id: number) {
        await dispatch(deleteClothing(id));
        refreshData();
        removeModal();
    };


    useEffect(() => {
        refreshData();
    }, [filter, chosenIds, refreshTrigger, dispatch]);
    useEffect(() => {
        dispatch(fetchRefs());
    }, []);


    return (
        <View style={style.root}>
            {/* FILTER */}
            {!isViewMode && <Filter />}

            {/* LIST */}
            <ClothingsList
                onPress={selectClothing}
                isViewMode={isViewMode}
                isSelectionMode={isSelectionMode}
            />

            {/* FAB */}
            {!isSelectionMode && !isViewMode && <Button 
                title="+" 
                variant={"negative"}
                onPress={() => actionClothing()} 
                style={{
                    button: style.fab,
                    text: style.fabText
                }}
            />}
        </View>
    );
}

export function Filter() {
    const {t} = useLanguage();
    const style = useStyleAdapter(styles);
    const dispatch = useAppDispatch();

    const state = useAppSelector((state) => state.wardrobe.clothingFilter);
    const wardrobeOptions = useAppSelector((state) => state.wardrobe.wardrobeOptions);


    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    function updateValue(key: FormClothingFilterKeys, val: FormClothingFilter[FormClothingFilterKeys]) {
        dispatch(setClothingFilter({
            ...state,
            [key]: val
        }));
    }


    return (
        <View style={style.filterRoot}>
            <Button
                title={t("filter")}
                onPress={() => setIsOpen(t => !t)}
                onLongPress={() => dispatch(dropClothingFilter())}
            />
            {isOpen && 
            <View>
                <Select<Option>
                    value={String(state.season)}
                    options={wardrobeOptions.wardrobe_ref_seasons_filter}
                    keyExtractor={(o) => o.key}
                    valueExtractor={(o) => o.value}
                    onChange={(val) => updateValue('season', Number(val) as Season["id"])}
                    name="season"
                    placeholder={`${t("wardrobe.season")}...`}
                />

                {/* <Select<Option>
                    value={String(state.state)}
                    options={StateFilterOptions}
                    keyExtractor={(o) => o.key}
                    valueExtractor={(o) => o.value}
                    onChange={(val) => updateValue('state', Number(val) as State["id"])}
                    name="state"
                    placeholder={`${t("wardrobe.state")}...`}
                /> */}

                <Select<Option>
                    value={String(state.slot)}
                    options={wardrobeOptions.wardrobe_ref_slots_filter}
                    keyExtractor={(o) => o.key}
                    valueExtractor={(o) => o.value}
                    onChange={(val) => updateValue('slot', Number(val) as Slot["id"])}
                    name="slot"
                    placeholder={`${t("wardrobe.slot")}...`}
                />

            </View>
            }
        </View>
    );
}

export function ClothingsList({
    onPress,
    isViewMode = false,
    isSelectionMode = false,
}: {
    onPress: (item: ClothingItem) => void;
    isViewMode?: boolean;
    isSelectionMode?: boolean;
}) {
    const style = useStyleAdapter(styles);

    const clothings = useAppSelector((state) => state.wardrobe.clothings);
    const selectedClothings = useAppSelector((state) => state.wardrobe.selectedOutfitClothings);
    
    return (
        <FlatList<ClothingItem>
            data={clothings}
            keyExtractor={(item, idx) => item?.id?.toString() ?? idx.toString()}
            contentContainerStyle={style.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
                if (!item) return null; 

                const isSelected = isSelectionMode && (selectedClothings?.[item.id] ?? false);

                return (<ClothingListTile 
                    item={item}
                    onPress={onPress}
                    isSelected={isSelected}
                    isMiniView={isViewMode}
                />);
            }}
        />
    );
}

export function ClothingListTile({
    item,
    onPress,
    isSelected = false,
    isMiniView = false,
}: {
    item: ClothingItem;
    onPress: (item: ClothingItem) => void;
    isSelected?: boolean;
    isMiniView?: boolean;
}) {
    const style = useStyleAdapter(styles);

    return (
        <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            style={{
                ...style.card,
                ...(isMiniView ? style.cardModMini : {}),
                ...(isSelected ? style.cardSelectedMod : {}),
            }}
            onPress={() => onPress(item)}
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
                {/* {isSelected && <View style={styles.cardImageSelectedMark}>
                    <Text style={styles.cardImageSelectedMarkText}>{"✓"}</Text>
                </View>} */}
            </View>}

            <View style={isMiniView ? style.cardContentMini : style.cardContent}>

                <View style={style.cardHeader}>
                    <Text 
                        style={style.cardTitle}
                        numberOfLines={1} 
                        ellipsizeMode="tail"
                    >
                        {isMiniView ? `${item.title.slice(0,10)}${item.title.length > 10 ? "..." : ""}` : item.title}
                    </Text>
                </View>

                {!isMiniView && <Text style={style.cardDescription}>
                    {item.description}
                </Text>}

                {/* {!isMiniView && <View style={styles.colorsRow}>
                    <View
                        style={{
                        ...styles.colorDot,
                        backgroundColor: item.mainColor
                        }}
                    />

                    <View
                        style={{
                        ...styles.colorDot,
                            backgroundColor: item.accentColor,
                            borderWidth: 1,
                        }}
                    />
                </View>} */}

            </View>
        </TouchableOpacity>
    );
}

export function ClothingCard({
    mode,
    form,
    onSubmit,
    onCancel,
    actionDelete
} : {
    mode: "create" | "edit";
    form: FormClothingItem;
    onSubmit: (values: FormClothingItem, mode: "create" | "edit") => void;
    onCancel: () => void;
    actionDelete: (id: number) => void;
}) {
    const { t } = useLanguage();
    const style = useStyleAdapter(styles);
    const { pushModalTop } = useNotification();

    const [hasDeletionAttempt, setHasDeletionAttempt] = useState<boolean>(false);

    const wardrobeOptions = useAppSelector((state) => state.wardrobe.wardrobeOptions);


    const formValidation = useCallback((values: FormClothingItem) => {
        const errors: Partial<Record<keyof ClothingItem, string>> = {};
        
        if (!values.title) errors.title = t('wardrobe.form.errors.titleRequired');
        if (!values.season) errors.season = t('wardrobe.form.errors.season');
        if (!values.slot) errors.slot = t('wardrobe.form.errors.slot');
        
        return errors;
    }, [t]);
    const formSubmit = (values: FormClothingItem) => {
        onSubmit(values, mode);
    };
    const onDeleting = (id: number) => {
        if (!hasDeletionAttempt) {
            setHasDeletionAttempt(true);
            return;
        } else {
            actionDelete(id);
        }
    };
    const openImage = (
        image: Uint8Array,
        type: string
    ) => {
        pushModalTop(() => (
            <ModalImage
                image={image}
                type={type}
            />
        ), {
            style: {
                card: {
                    width: '100%',
                    paddingVertical: 0,
                    paddingHorizontal: 0,
                    borderWidth: 0,
                },
                content: style.squareModalContent
            }
        });
    };
    const setImageBytes = async (
        setter: (field: keyof FormClothingItem, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<ClothingItem>>
    ) => {
        const img = await pickImage();
    
        if (!img?.base64 || !img?.mimeType) return null;
        
        await setter('image', base64ToArrayBuffer(img.base64));
        await setter('imageMimeType', img.mimeType);
    };

    return (
        <Formik<FormClothingItem>
                key={"clothings"}
                initialValues={form}
                validate={formValidation}
                onSubmit={formSubmit}
                enableReinitialize={true}
            >
                {({
                    values,
                    errors,
                    touched,
                    setFieldValue,
                    handleBlur,
                    handleSubmit,
                }) => (
                    <View style={style.formContainer}>
                        <Button 
                            variant={(errors.image && touched.image) ? 'error' : 'negative'}
                            onPress={() => {
                                (values.image && values.imageMimeType)
                                    ? openImage(values.image, values.imageMimeType)
                                    : setImageBytes(setFieldValue)
                            }}
                            onLongPress={() => setImageBytes(setFieldValue)}
                            style={{
                                button: (values.image && values.imageMimeType) ? style.transparentButton : {},
                            }}
                        >
                            {(values.image && values.imageMimeType) ?
                                <Image
                                    source={{ 
                                        uri: `data:${values.imageMimeType};base64,${arrayBufferToBase64(values.image)}` 
                                    }}
                                    style={style.cardImage}
                                /> :
                                <Text>{t("select_an_image")}</Text>
                            }
                        </Button>

                        <Input
                            value={values.title}
                            name="title"
                            error={!!errors.title  && touched.title}
                            onChange={(val) => setFieldValue('title', String(val))}
                            onBlur={handleBlur('title')}
                            placeholder={t("title")}
                        />

                        <Input
                            value={values.description}
                            name="description"
                            error={!!errors.description && touched.description}
                            onChange={(val) => setFieldValue('description', String(val))}
                            onBlur={handleBlur('description')}
                            multiline={true}
                            placeholder={t('description')}
                            style={{
                                container: [style.multiline]
                            }}
                        />

                        <Select<Option>
                            value={values.season}
                            options={wardrobeOptions.wardrobe_ref_seasons}
                            keyExtractor={(o) => o.key}
                            valueExtractor={(o) => o.value}
                            onChange={(val) => setFieldValue('season', Number(val))}
                            name="season"
                            placeholder={`${t("wardrobe.season")}...`}
                            error={!!errors.season && touched.season}
                        />

                        {/* <Select<Option>
                            value={values.state}
                            options={StateOptions}
                            keyExtractor={(o) => o.key}
                            valueExtractor={(o) => o.value}
                            onChange={(val) => setFieldValue('state', Number(val))}
                            name="state"
                            placeholder={`${t("wardrobe.state")}...`}
                            error={!!errors.state && touched.state}
                        /> */}

                        <Select<Option>
                            value={values.slot}
                            options={wardrobeOptions.wardrobe_ref_slots}
                            keyExtractor={(o) => o.key}
                            valueExtractor={(o) => o.value}
                            onChange={(val, name) => setFieldValue('slot', Number(val))}
                            name="slot"
                            placeholder={`${t("wardrobe.slot")}...`}
                            error={!!errors.slot && touched.slot}
                        />

                        <View style={style.modalActions}>
                            {/* <Input
                                value={values.mainColor}
                                name="mainColor"
                                error={!!errors.mainColor && touched.mainColor}
                                onChange={(val) => setFieldValue('mainColor', String(val))}
                                onBlur={handleBlur('mainColor')}
                                placeholder={t("wardrobe.placeholder.mainColor")}
                                style={{
                                    container: [styles.inputHalf]
                                }}
                            /> */}

                            {/* <Input
                                value={values.accentColor}
                                name="accentColor"
                                error={!!errors.accentColor && touched.accentColor}
                                onChange={(val) => setFieldValue('accentColor', String(val))}
                                onBlur={handleBlur('accentColor')}
                                placeholder={t("wardrobe.placeholder.accentColor")}
                                style={{
                                    container: [styles.inputHalf]
                                }}
                            /> */}
                        </View>


                        <View style={style.modalActions}>
                            <Button 
                                title={t("cancel").toUpperCase()} 
                                variant={"negative"}
                                onPress={() => onCancel()} 
                                style={{
                                    button: style.formButton,
                                    text: style.formButtonText
                                }}
                            />
                            <Button 
                                title={t("save").toUpperCase()} 
                                onPress={() => handleSubmit()} 
                                style={{
                                    button: style.formButton,
                                    text: style.formButtonText
                                }}
                            />
                        </View>
                        {values.id && <View style={style.modalActions}>
                            <Button 
                                title={t(hasDeletionAttempt ? "yes_im_sure" : "delete").toUpperCase()} 
                                variant={"negative"}
                                onPress={() => values.id && onDeleting(values.id)} 
                                style={{
                                    button: style.deleteButton,
                                    text: style.deleteText
                                }}
                            />
                        </View>}

                    </View>
                )}
        </Formik>
    );
}

export function ClothingSelector({}) {
    const {t} = useLanguage();
    const style = useStyleAdapter(styles);
    const dispatch = useAppDispatch();
    const { removeModal } = useNotification();

    function apply() {
        dispatch(updateChosenOutfitClothingsFromSelected());
        removeModal();
    }
    function cancel() {
        dispatch(updateClothingListVersion());
        dispatch(dropSelectedClothingItems());
        dispatch(dropClothingFilter());
        removeModal();
    }

    useEffect(() => {
        dispatch(setSelectedClothingItemsFromChosen());
    }, []);

    return (
        <View style={style.selectorRoot}>
            <View style={style.scrollArea}>
            <ClothingScreen
                isSelectionMode={true}
            />
            </View>
            <View style={style.selectorButtonContainer}>
                <Button 
                    variant={"negative"}
                    title={t("cancel").toUpperCase()} 
                    onPress={cancel} 
                    style={{
                        button: style.formButton,
                        text: style.formButtonText
                    }}
                />
                <Button 
                    title={t("select").toUpperCase()} 
                    onPress={apply} 
                    style={{
                        button: style.formButton,
                    }}
                />
            </View>
        </View>
    );

}

export function Clothing() {
    const { t } = useLanguage();
    const isDbReady = useDbReady();

    if (!isDbReady) return <PlaceholderScreen name={`${t("initializing")}...`}/>
    
    return (
        <Layout>
            <ClothingScreen/>
        </Layout>
    );
}
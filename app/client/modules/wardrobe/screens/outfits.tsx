import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Formik, FormikErrors } from 'formik';
import { Text, Input, Button, Select, ModalImage } from '../../../core/ui/components/interfaceComponents';
import {
    StyleSheet,
    Image,
    View,
    Platform,
    Dimensions,
} from 'react-native';
import { useNotification } from '../../../core/services/providers/notificationProvider';
import { FormOutfitItem, Season, OutfitItem, FormOutfitFilter, FormOutfitFilterKeys } from '../types';
import { Layout, PlaceholderScreen } from '../../../core/ui/components/navigationComponents';
import { useDbReady } from '../../../core/services/hooks/useDbReady';
import { ClothingScreen, ClothingSelector } from './clothings';
import { styles } from '../theme/styles';
import Svg, { Filter, FeTurbulence } from 'react-native-svg';
import { defaultOutfitsItem, dropChosenOutfitClothings, dropOutfitFilter, dropSelectedClothingItems, dropSelectedOutfitItems, setChosenOutfitClothings, setOutfitFilter, setSelectedClothingItemsFromChosen, setSelectedOutfitsFromChosen, toggleSelectedOutfitItems, updateChosenOutfitsFromSelected, updateOutfitListVersion } from '../store/slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteOutfit, fetchOutfits, fetchRefs, saveOutfit, saveOutfitsQueue } from '../store/thunk';
import { useLanguage } from '../../../core/services/providers/languageProviderService';
import type { Option } from '../../../core/types/types';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../../../core/utils/helpers';
import { pickImage } from '../../../core/utils/images';
import { OutfitList } from '../components/OutfitList';
import { useStyleAdapter } from '../../../core/services/providers/styleProvider';



export function OutfitsScreen({
    onDragEnd,
    isSelectionMode = false,
    isViewMode = false,
}: {
    onDragEnd?: (newData: OutfitItem[]) => void;
    isSelectionMode?: boolean;
    isViewMode?: boolean;
}) {
    const dispatch = useAppDispatch();
    const style = useStyleAdapter(styles);
    const { pushModalTop, removeModal } = useNotification();

    const filter = useAppSelector((state) => state.wardrobe.outfitFilter);
    const chosen = useAppSelector((state) => state.wardrobe.chosenOutfits);
    const refreshTrigger = useAppSelector((state) => state.wardrobe.outfitListVersion);


    const chosenIds = React.useMemo(() => {
        return isViewMode ? Object.keys(chosen).map(Number) : null;
    }, [isViewMode, chosen]);


    function refreshData() {
        dispatch(fetchOutfits(chosenIds));
    };
    function select(item?: OutfitItem) {
        if (isSelectionMode) {
            if (!item) return;
            dispatch(toggleSelectedOutfitItems(item.id))
        } else {
            actionOutfit(item)
        }
    }
    function actionOutfit(item?: OutfitItem) {
        const formItem: FormOutfitItem = item ?? defaultOutfitsItem;
        
        pushModalTop(() => (
            <OutfitCard
                mode={!item ? "create" : "edit"}
                form={formItem}
                onSubmit={handleSaveOutfit}
                onCancel={handleCancelOutfit}
                actionDelete={handleDeleteOutfit}
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
    async function handleSaveOutfit(values: FormOutfitItem, mode: "create" | "edit") {
        await dispatch(saveOutfit({ values, mode }));
        refreshData();
        removeModal();
    };
    async function handleCancelOutfit() {
        dispatch(dropChosenOutfitClothings());
        dispatch(dropSelectedClothingItems());
        removeModal();
    };
    async function handleDeleteOutfit(id: number) {
        await dispatch(deleteOutfit(id));
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
            {!isViewMode && <OutfitFilter />}

            {/* LIST */}
            <OutfitList
                onPress={select}
                isSelectionMode={isSelectionMode}
                isViewMode={isViewMode}
                onDragEnd={(p) => onDragEnd?.(p)}
            />

            {/* FAB */}
            {!isSelectionMode && <Button 
                title="+" 
                variant={"negative"}
                onPress={() => actionOutfit()} 
                style={{
                    button: style.fab,
                    text: style.fabText
                }}
            />}
        </View>
    );
}

export function OutfitFilter() {
    const {t} = useLanguage();
    const style = useStyleAdapter(styles);
    const dispatch = useAppDispatch();

    const state = useAppSelector((state) => state.wardrobe.outfitFilter);
    const wardrobeOptions = useAppSelector((state) => state.wardrobe.wardrobeOptions);
    
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    function updateValue(key: FormOutfitFilterKeys, val: FormOutfitFilter[FormOutfitFilterKeys]) {
        dispatch(setOutfitFilter({
            ...state,
            [key]: val
        }));
    }
    
    return (
        <View style={style.filterRoot}>
            <Button
                title={t("filter")}
                onPress={() => setIsOpen(t => !t)}
                onLongPress={() => dispatch(dropOutfitFilter())}
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
                    placeholder={`${t("wardrobe.seasons.all")}...`}
                />

            </View>
            }
        </View>
    );
}

export function OutfitCard({
    mode,
    form,
    onSubmit,
    onCancel,
    actionDelete
} : {
    mode: "create" | "edit";
    form: FormOutfitItem;
    onSubmit: (values: FormOutfitItem, mode: "create" | "edit") => void;
    onCancel: () => void;
    actionDelete: (id: number) => void;
}) {
    const { t } = useLanguage();
    const style = useStyleAdapter(styles);
    const dispatch = useAppDispatch();
    const { pushModalTop } = useNotification();

    const [hasDeletionAttempt, setHasDeletionAttempt] = useState<boolean>(false);
    const [isEditingActive, setIsEditingActive] = useState<boolean>(false);
    const chosen = useAppSelector((state) => state.wardrobe.chosenOutfitClothings);
    const wardrobeOptions = useAppSelector((state) => state.wardrobe.wardrobeOptions);


    const formValidation = useCallback((values: FormOutfitItem) => {
        const errors: Partial<Record<keyof OutfitItem, string>> = {};
        
        if (!values.title) errors.title = t('wardrobe.form.errors.titleRequired');
        if (!values.season) errors.season = t('wardrobe.form.errors.season');
        
        return errors;
    }, [t]);
    const formSubmit = (values: FormOutfitItem) => {
        if (!isEditingActive) {
            setIsEditingActive(true);
            return;
        }
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
                }
            }
        });
    };
    const openItemSelector = () => {
        pushModalTop(() => (
            <ClothingSelector />
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
    const setImageBytes = async (
        setter: (field: keyof FormOutfitItem, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<OutfitItem>>
    ) => {
        const img = await pickImage();
    
        if (!img?.base64 || !img?.mimeType) return null;
        
        await setter('image', base64ToArrayBuffer(img.base64));
        await setter('imageMimeType', img.mimeType);
    };

    const chosenCount = useMemo(() => {
        return Object.keys(chosen).length;
    }, [chosen]);


    useEffect(() => {
        const id = form.id;
        if (id) {
            dispatch(setChosenOutfitClothings(id));
            dispatch(setSelectedClothingItemsFromChosen());
        }
    }, [form]);
    useEffect(() => {
        if (mode === "create") setIsEditingActive(true);
    }, []);

    
    return (
        <Formik<FormOutfitItem>
                key={"outfits"}
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
                                    : isEditingActive && setImageBytes(setFieldValue)
                            }}
                            onLongPress={() => isEditingActive && setImageBytes(setFieldValue)}
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
                            readOnly={!isEditingActive}
                            onChange={(val) => setFieldValue('title', String(val))}
                            onBlur={handleBlur('title')}
                            placeholder={t("title")}
                        />

                        <Input
                            value={values.description}
                            name="description"
                            error={!!errors.description && touched.description}
                            readOnly={!isEditingActive}
                            onChange={(val) => setFieldValue('description', String(val))}
                            onBlur={handleBlur('description')}
                            multiline={true}
                            placeholder={t('description')}
                            style={{
                                container: style.multiline
                            }}
                        />

                        <Select<Option>
                            value={values.season}
                            options={wardrobeOptions.wardrobe_ref_seasons}
                            disabled={!isEditingActive}
                            keyExtractor={(o) => o.key}
                            valueExtractor={(o) => o.value}
                            onChange={(val) => setFieldValue('season', Number(val))}
                            name="season"
                            placeholder={`${t("wardrobe.season")}...`}
                            error={!!errors.season && touched.season}
                        />

                        {isEditingActive && <Button 
                            title={t("manage_items")}
                            variant={"negative"}
                            onPress={openItemSelector} 
                            style={{
                                button: style.formButton,
                                text: style.formButtonText
                            }}
                        />}

                        {chosenCount > 0 && <View style={style.tileViewWrapper}>
                            <ClothingScreen
                                isViewMode={true}
                            />
                        </View>}

                        <View style={style.modalActions}>
                            {/* <Input
                                value={values.mainColor}
                                name="mainColor"
                                error={!!errors.mainColor && touched.mainColor}
                                onChange={(val) => setFieldValue('mainColor', String(val))}
                                onBlur={handleBlur('mainColor')}
                                placeholder="Main color (#000000)"
                                style={{
                                    container: styles.inputHalf
                                }}
                            /> */}

                            {/* <Input
                                value={values.accentColor}
                                name="accentColor"
                                error={!!errors.accentColor && touched.accentColor}
                                onChange={(val) => setFieldValue('accentColor', String(val))}
                                onBlur={handleBlur('accentColor')}
                                placeholder="Accent color (#ffffff)"
                                style={{
                                    container: styles.inputHalf
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
                                title={t(isEditingActive ? "save" : "edit_short").toUpperCase()}
                                onPress={() => handleSubmit()} 
                                style={{
                                    button: style.formButton,
                                    text: style.formButtonText
                                }}
                            />
                        </View>
                        {isEditingActive && values.id && <View style={style.modalActions}>
                            <Button 
                                title={t(hasDeletionAttempt ? "yes_im_sure" : "delete").toUpperCase()} 
                                variant={"negative"}
                                onPress={() => onDeleting(values.id!)} 
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

export function OutfitSelector({
    onSave
}: {
    onSave: () => void;
}) {
    const {t} = useLanguage();
    const style = useStyleAdapter(styles);
    const dispatch = useAppDispatch();
    const { removeModal } = useNotification();

    async function apply() {
        dispatch(updateChosenOutfitsFromSelected());
        await dispatch(saveOutfitsQueue());
        onSave();
        removeModal();
    }
    function cancel() {
        dispatch(dropSelectedOutfitItems());
        dispatch(updateOutfitListVersion());
        dispatch(dropOutfitFilter());
        removeModal();
    }

    useEffect(() => {
        dispatch(setSelectedOutfitsFromChosen());
    }, []);

    return (
        <View style={style.selectorRoot}>
            <View style={style.scrollArea}>
            <OutfitsScreen
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

export function Outfits() {
    const {t} = useLanguage();
    const isDbReady = useDbReady();

    if (!isDbReady) return <PlaceholderScreen name={`${t("initializing")}...`}/>

    return (
        <Layout>
            <OutfitsScreen/>
        </Layout>
    );
}


//#region Test area
function TESTOutfitListTile({children}: { children: ReactNode }) {

    const grag = ntvStyle(
        'radial-gradient(circle at center, #1c1d26 0%, #0f1014 60%, #040507 100%'
    );
    return (
        <View style={[tstStyles.container, grag]}>
            <View 
                style={[
                    StyleSheet.absoluteFill,
                    { opacity: 0.3 },
                    
                ]}
                pointerEvents='none'
            >
                <Svg
                    height={height}
                    width={width}
                >
                    <Filter id={"noise"}>
                        <FeTurbulence
                            type="fractalNoise"
                            baseFrequency={"0.75"}
                            numOctaves={3}
                            stitchTiles="stitch"
                        />
                    </Filter>
                </Svg>
                {children}
            </View>

        </View>
    )
}

const {width, height} = Dimensions.get("window");
const ntvStyle = (gs: string) => Platform.select({
    web: { backgroundImage: gs},
    default: { experimental_backgroundImage: gs }
})

const tstStyles = StyleSheet.create({
    container: {
        backgroundColor: '#0f1014',
    },
    smokeGlow: {
        ...StyleSheet.absoluteFill,
        borderRadius: 12,
        transform: [{ scale: 1.2 }]
    },
    cardBody: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(21,23,28,0.9',
        borderWidth: 1,
        borderColor: 'rgba(212,143,56,0.25)',
        borderRadius: 4,
        padding: 16,

        shadowColor: '#d48f38',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
})
//#endregion
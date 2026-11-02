import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Formik, FormikErrors } from 'formik';
import { Text, Input, Button, Select, MultilineInput, ModalImage } from '../../../core/ui/components/interfaceComponents';
import {
    Image,
    View,
} from 'react-native';
import { useNotification } from '../../../core/services/providers/notificationProvider';
import { FormDishItem, DishItem, FormDishFilter, FormDishFilterKeys, DishCategory } from '../types';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../../../core/utils/helpers';
import { pickImage } from '../../../core/utils/images';

import type { Option } from '../../../core/types/types';
import { Layout, PlaceholderScreen } from '../../../core/ui/components/navigationComponents';
import { useDbReady } from '../../../core/services/hooks/useDbReady';
import { ProductScreen, ProductSelector } from './products';
import { styles } from '../theme/styles';
import { defaultDishesItem, dropChosenDishProducts, dropDishFilter, dropSelectedDishItems, dropSelectedProductItems, setChosenDishProducts, setDishFilter, setSelectedDishesFromChosen, setSelectedProductItemsFromChosen, toggleSelectedDishItems, updateChosenDishesFromSelected, updateDishListVersion } from '../store/slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteDish, fetchDishes, fetchRefs, saveDish, saveDishesQueue } from '../store/thunk';
import { useLanguage } from '../../../core/services/providers/languageProviderService';
import { useStyleAdapter } from '../../../core/services/providers/styleProvider';
import { DishList } from '../components/DishList/DishList.web';



export function DishesScreen({
    onDragEnd,
    isSelectionMode = false,
    isViewMode = false,
}: {
    onDragEnd?: (newData: DishItem[]) => void;
    isSelectionMode?: boolean;
    isViewMode?: boolean;
}) {
    const dispatch = useAppDispatch();
    const style = useStyleAdapter(styles);
    const { pushModalTop, removeModal } = useNotification();

    const filter = useAppSelector((state) => state.kitchen.dishFilter);
    const chosen = useAppSelector((state) => state.kitchen.chosenDishes);
    const refreshTrigger = useAppSelector((state) => state.kitchen.dishListVersion);

    const chosenIds = React.useMemo(() => {
        return isViewMode ? Object.keys(chosen).map(Number) : null;
    }, [isViewMode, chosen]);

    function refreshData() {
        dispatch(fetchDishes(chosenIds));
    };
    function select(item?: DishItem) {
        if (isSelectionMode) {
            if (!item) return;
            dispatch(toggleSelectedDishItems(item.id))
        } else {
            actionDish(item)
        }
    }    
    function actionDish(item?: DishItem) {
        const formItem: FormDishItem = item ?? defaultDishesItem;
        
        pushModalTop(() => (
            <DishCard
                mode={!item ? "create" : "edit"}
                form={formItem}
                onSubmit={handleSaveDish}
                onCancel={handleCancelDish}
                actionDelete={handleDeleteDish}
            />
        ), {
            style: { 
                card: style.squareModalCard,
                content: style.squareModalWrap,
            },
            modal: {
                hasCross: false,
                isClosable: false,
                isScrollable: true,
            }
        });
    };
    async function handleSaveDish(values: FormDishItem, mode: "create" | "edit") {
        await dispatch(saveDish({ values, mode }));
        refreshData();
        removeModal();
    };
    async function handleCancelDish() {
        dispatch(dropChosenDishProducts());
        dispatch(dropSelectedProductItems());
        removeModal();
    };
    async function handleDeleteDish(id: number) {
        await dispatch(deleteDish(id));
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
            {!isViewMode && <DishFilter />}

            {/* LIST */}
            <DishList
                onPress={select}
                isSelectionMode={isSelectionMode}
                isViewMode={isViewMode}
                onDragEnd={(p) => onDragEnd?.(p)}
            />

            {/* FAB */}
            {!isSelectionMode && <Button 
                title="+" 
                variant={"negative"}
                onPress={() => actionDish()} 
                style={{
                    button: style.fab,
                    text: style.fabText
                }}
            />}
        </View>
    );
}

export function DishFilter() {
    const dispatch = useAppDispatch();
    const {t} = useLanguage();
    const style = useStyleAdapter(styles);

    const state = useAppSelector((state) => state.kitchen.dishFilter);
    const kitchenOptions = useAppSelector((state) => state.kitchen.kitchenOptions);
    
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    function updateValue(key: FormDishFilterKeys, val: FormDishFilter[FormDishFilterKeys]) {
        dispatch(setDishFilter({
            ...state,
            [key]: val
        }));
    }
    

    return (
        <View style={style.filterRoot}>
            <Button
                title={t("filter")}
                onPress={() => setIsOpen(t => !t)}
                onLongPress={() => dispatch(dropDishFilter())}
            />
            {isOpen && 
            <View>
                <Select<Option>
                    value={String(state.category)}
                    options={kitchenOptions.kitchen_ref_dish_categories_filter}
                    keyExtractor={(o) => o.key}
                    valueExtractor={(o) => o.value}
                    onChange={(val) => updateValue('category', Number(val) as DishCategory["id"])}
                    name="category"
                    placeholder={`${t("category")}...`}
                />
            </View>
            }
        </View>
    );
}

export function DishCard({
    mode,
    form,
    onSubmit,
    onCancel,
    actionDelete
} : {
    mode: "create" | "edit";
    form: FormDishItem;
    onSubmit: (values: FormDishItem, mode: "create" | "edit") => void;
    onCancel: () => void;
    actionDelete: (id: number) => void;
}) {
    const { t } = useLanguage();
    const style = useStyleAdapter(styles);
    const dispatch = useAppDispatch();
    const { pushModalTop } = useNotification();

    const [hasDeletionAttempt, setHasDeletionAttempt] = useState<boolean>(false);
    const [isEditingActive, setIsEditingActive] = useState<boolean>(false);
    const chosenProducts = useAppSelector((state) => state.kitchen.chosenDishProducts);
    const kitchenOptions = useAppSelector((state) => state.kitchen.kitchenOptions);


    const formValidation = useCallback((values: FormDishItem) => {
        const errors: Partial<Record<keyof DishItem, string>> = {};
        
        if (!values.title) errors.title = t('kitchen.dishes.form.errors.titleRequired');
        if (!values.category) errors.category = t('kitchen.dishes.form.errors.categoryRequired');
        
        return errors;
    }, [t]);
    const formSubmit = (values: FormDishItem) => {
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
                },
                content: style.squareModalWrap,
            }
        });
    };
    const openItemSelector = () => {
        pushModalTop(() => (
            <ProductSelector />
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
        setter: (field: keyof FormDishItem, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<DishItem>>
    ) => {
        const img = await pickImage();
    
        if (!img?.base64 || !img?.mimeType) return null;
        
        await setter('image', base64ToArrayBuffer(img.base64));
        await setter('imageMimeType', img.mimeType);
    };


    const chosenProductsCount = useMemo(() => {
        return Object.keys(chosenProducts).length;
    }, [chosenProducts]);


    useEffect(() => {
        const id = form.id;
        if (id) {
            dispatch(setChosenDishProducts(id));
            dispatch(setSelectedProductItemsFromChosen());
        }
    }, [form]);
    useEffect(() => {
        if (mode === "create") setIsEditingActive(true);
    }, []);

    
    return (
        <Formik<FormDishItem>
                key={"dishes"}
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

                        <MultilineInput
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
                            initialHeight={110}
                            expandedHeight={500}
                        />

                        <Select<Option>
                            value={values.category}
                            options={kitchenOptions.kitchen_ref_dish_categories}
                            disabled={!isEditingActive}
                            keyExtractor={(o) => o.key}
                            valueExtractor={(o) => o.value}
                            onChange={(val) => setFieldValue('category', Number(val))}
                            name="unit"
                            placeholder={`${t("category")}...`}
                            error={!!errors.category && touched.category}
                        />


                        {isEditingActive && <Button 
                            title={t("kitchen.productList")} 
                            variant={"negative"}
                            onPress={openItemSelector} 
                            style={{
                                button: style.formButton,
                                text: style.formButtonText
                            }}
                        />}

                        {chosenProductsCount > 0 && <View style={style.tileViewWrapper}>
                            <ProductScreen
                                isViewMode={true}
                            />
                        </View>}

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

export function DishSelector({
    onSave
}: {
    onSave: () => void;
}) {
    const {t} = useLanguage();
    const style = useStyleAdapter(styles);
    const dispatch = useAppDispatch();
    const { removeModal } = useNotification();

    async function apply() {
        dispatch(updateChosenDishesFromSelected());
        await dispatch(saveDishesQueue());
        onSave();
        removeModal();
    }
    function cancel() {
        dispatch(dropSelectedDishItems());
        dispatch(updateDishListVersion());
        dispatch(dropDishFilter());
        removeModal();
    }

    useEffect(() => {
        dispatch(setSelectedDishesFromChosen());
    }, []);

    return (
        <View style={style.selectorRoot}>
            <View style={style.scrollArea}>
            <DishesScreen
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

export function Dishes() {
    const {t} = useLanguage();
    const isDbReady = useDbReady();

    if (!isDbReady) return <PlaceholderScreen name={`${t("initializing")}...`}/>

    return (
        <Layout>
            <DishesScreen/>
        </Layout>
    );
}
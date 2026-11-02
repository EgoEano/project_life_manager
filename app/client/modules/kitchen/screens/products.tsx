import React, { useCallback, useEffect, useState } from 'react';
import { Formik, FormikErrors } from 'formik';
import { Text, Input, Button, Select, ModalImage } from '../../../core/ui/components/interfaceComponents';
import {
    TouchableOpacity,
    Image,
    FlatList,
    View,
    Pressable,
} from 'react-native';
import { useNotification } from '../../../core/services/providers/notificationProvider';
import { FormProductFilter, FormProductItem, ProductCategory, ProductItem, FormProductFilterKeys, DishItemProduct, KitchenRefs } from '../types';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../../../core/utils/helpers';
import { pickImage } from '../../../core/utils/images';
import type { Option } from '../../../core/types/types';
import { Layout, PlaceholderScreen } from '../../../core/ui/components/navigationComponents';
import { useDbReady } from '../../../core/services/hooks/useDbReady';
import { styles } from '../theme/styles';
import { useAppDispatch, useAppSelector } from '../store/hooks'; 
import { defaultProductItem, dropProductFilter, dropSelectedProductItems, setChosenDishProductCount, setProductFilter, setSelectedProductItemsFromChosen, toggleSelectedProductItems, updateChosenDishProductsFromSelected, updateProductListVersion } from '../store/slice';
import { deleteProduct, fetchProducts, fetchRefs, saveProduct } from '../store/thunk';
import { useLanguage } from '../../../core/services/providers/languageProviderService';
import { useStyleAdapter } from '../../../core/services/providers/styleProvider';


export function ProductScreen({
    isSelectionMode = false,
    isViewMode = false,
}: {
    isSelectionMode?: boolean;
    isViewMode?: boolean;
}) {
    const dispatch = useAppDispatch();
    const style = useStyleAdapter(styles);
    const { pushModalTop, removeModal } = useNotification();

    
    const filter = useAppSelector((state) => state.kitchen.productFilter);
    const chosen = useAppSelector((state) => state.kitchen.chosenDishProducts);
    const refreshTrigger = useAppSelector((state) => state.kitchen.productListVersion);


    const chosenIds = React.useMemo(() => {
        return isViewMode ? Object.keys(chosen).map(Number) : null;
    }, [isViewMode, chosen]);


    function refreshData() {
        dispatch(fetchProducts(chosenIds));
    };
    function selectProduct(item?: ProductItem) {
        if (isSelectionMode) {
            if (!item) return;
            dispatch(toggleSelectedProductItems(item.id))
        } else {
            actionProduct(item)
        }
    }
    function actionProduct(item?: ProductItem) {
        const formItem: FormProductItem = item ?? defaultProductItem;
        
        pushModalTop(() => (
            <ProductCard
                mode={!item ? "create" : "edit"}
                form={formItem}
                onSubmit={handleSaveProduct}
                onCancel={handleCloseProduct}
                actionDelete={handleDeleteProduct}
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
    async function handleSaveProduct(values: FormProductItem, mode: "create" | "edit") {
        await dispatch(saveProduct({ values, mode }));
        refreshData();
        removeModal();
    };
    async function handleCloseProduct() {
        refreshData();
        removeModal();
    };
    async function handleDeleteProduct(id: number) {
        await dispatch(deleteProduct(id));
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
            <ProductsList
                onPress={selectProduct}
                isViewMode={isViewMode}
                isSelectionMode={isSelectionMode}
            />

            {/* FAB */}
            {!isSelectionMode && !isViewMode && <Button 
                title="+" 
                variant={"negative"}
                onPress={() => actionProduct()} 
                style={{
                    button: style.fab,
                    text: style.fabText
                }}
            />}
        </View>
    );
}

export function Filter() {
    const dispatch = useAppDispatch();
    const {t} = useLanguage();
    const style = useStyleAdapter(styles);

    const state = useAppSelector((state) => state.kitchen.productFilter);
    const kitchenOptions = useAppSelector((state) => state.kitchen.kitchenOptions);

    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    function updateValue(key: FormProductFilterKeys, val: FormProductFilter[FormProductFilterKeys]) {
        dispatch(setProductFilter({
            ...state,
            [key]: val
        }));
    }

    return (
        <View style={style.filterRoot}>
            <Button
                title={t("filter")}
                onPress={() => setIsOpen(t => !t)}
                onLongPress={() => dispatch(dropProductFilter())}
            />
            {isOpen && 
            <View>
                <Select<Option>
                    value={String(state.category)}
                    options={kitchenOptions.kitchen_ref_product_categories_filter}
                    keyExtractor={(o) => o.key}
                    valueExtractor={(o) => o.value}
                    onChange={(val) => updateValue('category', Number(val) as ProductCategory["id"])}
                    name="category"
                    placeholder={`${t("category")}...`}
                />

            </View>
            }
        </View>
    );
}

export function ProductsList({
    onPress,
    isViewMode = false,
    isSelectionMode = false,
}: {
    onPress: (item: ProductItem) => void;
    isViewMode?: boolean;
    isSelectionMode?: boolean;
}) {
    const style = useStyleAdapter(styles);
    const kitchenRefs = useAppSelector((state) => state.kitchen.kitchenRefs);
    const products = useAppSelector((state) => state.kitchen.products);
    const selectedProducts = useAppSelector((state) => state.kitchen.selectedDishProducts);

    return (
        <FlatList<ProductItem>
            data={products}
            keyExtractor={(item, idx) => item?.id?.toString() ?? idx.toString()}
            contentContainerStyle={style.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
                if (!item) return null; 

                const isSelected = isSelectionMode && (selectedProducts?.[item.id] ?? false);

                return (<ProductListTile 
                    item={item}
                    onPress={onPress}
                    refs={kitchenRefs}
                    isSelected={isSelected}
                    isMiniView={isViewMode}
                />);
            }}
        />
    );
}

export function ProductListTile({
    item,
    onPress,
    refs,
    isSelected,
    isMiniView = false,
}: {
    item: ProductItem;
    onPress: (item: ProductItem) => void;
    refs: KitchenRefs;
    isSelected?: boolean;
    isMiniView?: boolean;
}) {
    const {t} = useLanguage();
    const style = useStyleAdapter(styles);
    const dispatch = useAppDispatch();
     
    const chosenProducts = useAppSelector((state) => state.kitchen.chosenDishProducts);


    function changeCount(p: DishItemProduct) {
        dispatch(setChosenDishProductCount(p));
    }

    const chosenProduct = chosenProducts[item.id];

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
            <View style={isMiniView ? style.cardContainerMini : style.cardContainer}>
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

                <View style={style.cardHeader}>
                    <Text 
                        style={style.cardTitle}
                        numberOfLines={1} 
                        ellipsizeMode="tail"
                    >
                        {isMiniView ? `${item.title.slice(0,5)}${item.title.length > 5 ? "..." : ""}` : item.title}
                    </Text>
                </View>

                {!isMiniView && <Text style={style.cardDescription}>
                    {item.description}
                </Text>}

                {!isMiniView && <Text style={style.cardDetails}>
                    {`${
                        t(refs.kitchen_ref_product_categories.find(c => c.id === item.category)?.label ?? "!#category")
                        } | ${t(refs.kitchen_ref_units.find(u => u.id === item.unit)?.label ?? "!#unit")}`}
                </Text>}
            </View>

            {isMiniView && chosenProduct && <View style={style.inputContentMini}>
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <Input
                        value={String(chosenProduct.count)}
                        name="title"
                        onChange={(val) => changeCount({id: chosenProduct.id, count: Number(val)})}
                        placeholder={t("title")}
                        style={{
                            container: style.inputMini
                        }}
                    />
                </Pressable>
                <Text style={style.inputContentMiniText}>{t(refs.kitchen_ref_units.find(u => u.id === item.unit)?.labelShort ?? "!#unit")}</Text>
            </View>}
        </TouchableOpacity>
    );
}

export function ProductCard({
    mode,
    form,
    onSubmit,
    onCancel,
    actionDelete
} : {
    mode: "create" | "edit";
    form: FormProductItem;
    onSubmit: (values: FormProductItem, mode: "create" | "edit") => void;
    onCancel: () => void;
    actionDelete: (id: number) => void;
}) {
    const { t } = useLanguage();
    const style = useStyleAdapter(styles);
    const { pushModalTop } = useNotification();

    const kitchenOptions = useAppSelector((state) => state.kitchen.kitchenOptions);


    const [hasDeletionAttempt, setHasDeletionAttempt] = useState<boolean>(false);

    const formValidation = useCallback((values: FormProductItem) => {
        const errors: Partial<Record<keyof ProductItem, string>> = {};
        
        if (!values.title) errors.title = t('kitchen.dishes.form.errors.titleRequired');
        if (!values.unit) errors.unit = t('kitchen.dishes.form.errors.unitRequired');
        if (!values.category) errors.category = t('kitchen.dishes.form.errors.categoryRequired');
        
        return errors;
    }, [t]);
    const formSubmit = (values: FormProductItem) => {
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
    const setImageBytes = async (
        setter: (field: keyof FormProductItem, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<ProductItem>>
    ) => {
        const img = await pickImage();
    
        if (!img?.base64 || !img?.mimeType) return null;
        
        await setter('image', base64ToArrayBuffer(img.base64));
        await setter('imageMimeType', img.mimeType);
    };

    return (
        <Formik<FormProductItem>
                key={"products"}
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
                            value={values.unit}
                            options={kitchenOptions.kitchen_ref_units}
                            keyExtractor={(o) => o.key}
                            valueExtractor={(o) => o.value}
                            onChange={(val) => setFieldValue('unit', Number(val))}
                            name="unit"
                            placeholder={`${t("unit")}...`}
                            error={!!errors.unit && touched.unit}
                        />

                        <Select<Option>
                            value={values.category}
                            options={kitchenOptions.kitchen_ref_product_categories}
                            keyExtractor={(o) => o.key}
                            valueExtractor={(o) => o.value}
                            onChange={(val, name) => setFieldValue('category', Number(val))}
                            name="category"
                            placeholder={`${t("category")}...`}
                            error={!!errors.category && touched.category}
                        />

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

export function ProductSelector({}) {
    const {t} = useLanguage();
    const style = useStyleAdapter(styles);
    const dispatch = useAppDispatch();
    const { removeModal } = useNotification();
    

    function apply() {
        dispatch(updateChosenDishProductsFromSelected());
        removeModal();
    }
    function cancel() {
        dispatch(updateProductListVersion());
        dispatch(dropSelectedProductItems());
        dispatch(dropProductFilter());
        removeModal();
    }


    useEffect(() => {
        dispatch(setSelectedProductItemsFromChosen());
    }, []);


    return (
        <View style={style.selectorRoot}>
            <View style={style.scrollArea}>
            <ProductScreen
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
                    title={t("save").toUpperCase()} 
                    onPress={apply} 
                    style={{
                        button: style.formButton,
                    }}
                />
            </View>
        </View>
    );

}

export function Products() {
    const {t} = useLanguage();
    const isDbReady = useDbReady();

    if (!isDbReady) return <PlaceholderScreen name={`${t("initializing")}...`}/>
    
    return (
        <Layout>
            <ProductScreen/>
        </Layout>
    );
}
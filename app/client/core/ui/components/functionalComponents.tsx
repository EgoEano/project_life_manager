import { useCallback, useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    ViewStyle,
    StyleProp,
    FlatList,
    ScrollView,
} from 'react-native';
import { RefItem, RefItemForm } from '../../types/types';
import { useLanguage } from '../../services/providers/languageProviderService';
import { Formik } from 'formik';
import { Card, Select, Input, Button, Text } from './interfaceComponents';
import { Theme } from '../../types/theme';
import { useStyleAdapter } from '../../services/providers/styleProvider';
import { useNotification } from '../../services/providers/notificationProvider';

//#region Grid
export type GridColumnWeights = readonly number[];

export type GridRenderHeaderProps<T> = {
    data: readonly T[];
    weights: number[]
};
export type GridRenderHeader<T> = (props: GridRenderHeaderProps<T>) => React.ReactElement | null;
export type GridRenderFooterProps<T> = {
    data: readonly T[];
    weights: number[]
};
export type GridRenderFooter<T> = (props: GridRenderHeaderProps<T>) => React.ReactElement | null;
export type GridRenderRowProps<T> = {
    data: readonly T[];
    item: T,
    index: number,
    weights: number[],
};
export type GridRenderRow<T> = (
    props: GridRenderRowProps<T>
) => React.ReactElement | null;

export interface GridProps<T> {
    data: readonly T[];
    columnWeights: GridColumnWeights;

    height?: number;

    renderHeader?: GridRenderHeader<T>;
    renderRow: GridRenderRow<T>;
    renderFooter?: GridRenderFooter<T>;

    style?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;

    isLoading?: boolean;
    emptyText?: string;
    getRowKey?: (row: T, index: number) => React.Key;
}

const style_inner_Grid = StyleSheet.create({
    root: {
        width: '100%',
        minWidth: 600,
        flex: 1,
        flexDirection: 'column',
    },
    header: {
        width: '100%',
    },
    body: {
        width: '100%',
        flex: 1,
    },
    footer: {
        width: '100%',
    },
    cap: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

function normalizeWeights(weights: readonly number[]): number[] {
    const normalized = weights.map((w) =>
        Number.isFinite(w) && w > 0 ? w : 0,
    );

    if (normalized.every((w) => w === 0)) {
        return weights.map(() => 1);
    }

    return normalized;
}

export function Grid<T>({
    data,
    columnWeights: columnWeights,
    height,

    renderHeader,
    renderRow,
    renderFooter,

    style,
    contentStyle,

    isLoading = false,
    emptyText = 'No data',
    getRowKey
}: GridProps<T>) {
    const columnWeightsMemo = useMemo(
        () => normalizeWeights(columnWeights),
        [columnWeights],
    );

    return (
        <ScrollView
            horizontal={true}
            bounces={true}
            contentContainerStyle={[
                style_inner_Grid.root,
                height != null && { height, maxHeight: height },
                style,
            ]}
        >
            {/* HEADER */}
            {renderHeader && (
                <View style={style_inner_Grid.header}>
                    {renderHeader({data, weights: columnWeightsMemo})}
                </View>
            )}

            {/* BODY */}
            {isLoading && (
                <View style={style_inner_Grid.cap}>
                    <Text>Loading…</Text>
                </View>
            )}
            {!isLoading && <FlatList
                style={style_inner_Grid.body}
                contentContainerStyle={contentStyle}
                data={data}
                keyExtractor={(item, index) =>
                    getRowKey?.(item, index)?.toString() ??
                    index.toString()
                }
                renderItem={({ item, index }) =>
                    renderRow({data, item, index, weights: columnWeightsMemo})
                }
                ListEmptyComponent={
                    <View style={style_inner_Grid.cap}>
                        <Text>{emptyText}</Text>
                    </View>
                }
            />}

            {/* FOOTER */}
            {renderFooter && (
                <View style={style_inner_Grid.footer}>
                    {renderFooter({data, weights: columnWeightsMemo})}
                </View>
            )}
        </ScrollView>
    );
}
//#endregion

//#region RefHandler
export const stylesRefHandler = (theme: Theme) => StyleSheet.create({
    mngrRoot: {
        flex: 1,
        gap: theme.tokens.sizes.spacing.md,
    },
    wrp10: { gap: theme.tokens.sizes.spacing.sm },
    flex1: { flex: 1 },
    inputArea: {
        flexDirection: "row",
        gap: theme.tokens.sizes.spacing.md,
        flexWrap: "wrap",
    },
    inputAreaRows: {
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    inputAreaRowsInput: {
        width: "100%",
    },
    marginText: {
        marginLeft: theme.tokens.sizes.spacing.md,
    },
    btnArea: {
        flexDirection: "row",
        gap: theme.tokens.sizes.spacing.xs,
    },
});
export function RefManager<T extends object>({
    module,
    refs,
    onSubmit
}: {
    module: string;
    refs: { [K in keyof T]: RefItem[] };
    onSubmit: (opt: RefItemForm, name: string) => void;
}) {
    const style = useStyleAdapter(stylesRefHandler);

    const dataArray = Object.entries(refs) as [string, RefItem[]][];;
    const renderItem = ({ item }: { item: [string, RefItem[]] }) => {
        const [k, v] = item;
        
        return (
            <RefHandler
                title={k}
                module={module}
                key={k}
                items={v}
                onSubmit={(opt) => onSubmit(opt, k)}
            />
        );
    };


    return (
        <View style={style.mngrRoot}>
            <FlatList
                data={dataArray}
                renderItem={renderItem}
                keyExtractor={([k]) => k} 
                contentContainerStyle={[
                    { flexGrow: 1 },
                    style.wrp10
                ]}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

export function RefHandler({
    title,
    module,
    items,
    onSubmit
}: {
    title: string,
    module: string;
    items: RefItem[];
    onSubmit: (opt: RefItemForm) => void;
}) {
    const {t} = useLanguage();
    const { pushDialog } = useNotification();
    const style = useStyleAdapter(stylesRefHandler);

    const dynamicFields = useMemo(() => {
        const fieldsSet = new Set<string>();
        
        items.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== 'id' && key !== 'label') {
                    fieldsSet.add(key);
                }
            });
        });

        return ['label', ...Array.from(fieldsSet).sort()];
    }, [items]);
    const emptyItem = useMemo(() => {
        const obj: Record<string, string> = {};
        dynamicFields.forEach(field => {
            obj[field] = "";
        });
        return obj;
    }, [dynamicFields]);

    const form: RefItemForm = {
        mode: "create",
        id: 0,
        label: "",
        ...emptyItem,
    };

    const formValidation = useCallback((values: RefItemForm) => {
        const errors: Partial<Record<keyof RefItemForm, string>> = {};
        
        dynamicFields.forEach(field => {
            if (!values[field] && values[field] !== 0) {
                errors[field] = t('ref.form.errors.value');
            }
        });
        
        return errors;
    }, [dynamicFields, t]);

    const formSubmit = (values: RefItemForm, { resetForm }: { resetForm: () => void }) => {
        const castedValues = { ...values };
        
        dynamicFields.forEach(field => {
            const originalItemWithField = items.find(item => field in item);
            if (originalItemWithField) {
                const originalType = typeof originalItemWithField[field];
                if (originalType === 'number' && typeof castedValues[field] === 'string') {
                    const parsed = Number(castedValues[field]);
                    castedValues[field] = isNaN(parsed) ? castedValues[field] : parsed;
                }
            }
        });

        if (castedValues.mode === "delete") {
            pushDialog({
                message: t("notification.confirm"),
                actions: [
                    {
                        text: t("delete"),
                        isResolve: true,
                        action: () => {
                            onSubmit(castedValues);
                            resetForm();
                        }
                    },
                    {
                        text: t("cancel"),
                        isResolve: false
                    },
                ]
            });
        } else {
            onSubmit(castedValues);
            resetForm();
        }
    };

    return (
        <Card style={style.wrp10}>
            <Text>{t(`${module}.refs.${title}`)}</Text>
            <Formik<RefItemForm>
                key={title}
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
                    setValues,
                    handleBlur,
                    handleSubmit,
                }) => (
                    <View style={style.wrp10}>
                        <Select<RefItem | { id: number; label: string }>
                            value={String(values.id)}
                            options={[{ id: 0, label: t("create") }, ...items]}
                            keyExtractor={(o) => String(o.id)}
                            valueExtractor={(o) => o.label}
                            onChange={(val) => {
                                const selectedId = Number(val);
                                const isNew = selectedId === 0;
                                const foundItem = items.find(o => o.id === selectedId);

                                if (isNew) {
                                    setValues({
                                        mode: "create",
                                        id: 0,
                                        label: "",
                                        ...emptyItem,
                                    } as RefItemForm);
                                } else if (foundItem) {
                                    setValues({
                                        mode: "edit",
                                        ...emptyItem,
                                        ...foundItem,
                                    } as RefItemForm);
                                }
                            }}
                            name="id"
                            style={{ trigger: style.flex1}}
                        />
                        <View style={style.inputArea}>
                            {dynamicFields.map((fieldName) => {
                                const isError = !!errors[fieldName] && touched[fieldName];

                                return (
                                    <View key={fieldName} style={style.inputAreaRows}>
                                        <Text variant={"label"} style={style.marginText}>{t(`ref.${fieldName}`)}</Text>
                                        <Input
                                            value={String(values[fieldName] ?? '')}
                                            name={fieldName}
                                            error={isError}
                                            onChange={(val) => setFieldValue(fieldName, val)}
                                            onBlur={handleBlur(fieldName)}
                                            placeholder={t(fieldName)}
                                            style={{ container: style.inputAreaRowsInput }}
                                        />
                                    </View>
                                );
                            })}
                            <View style={style.btnArea}>
                                <Button 
                                    title={t(values.mode === "create" ? "add" : "alter")}
                                    onPress={() => handleSubmit()} 
                                />
                                <Button 
                                    title={t("delete")}
                                    disabled={values.mode === "create"}
                                    variant={values.mode === "edit" ? "error" : "primary"}
                                    onPress={() => {
                                        setFieldValue('mode', "delete");
                                        handleSubmit();
                                    }} 
                                />
                            </View>
                        </View>
                    </View>
                )}
            </Formik>
        </Card>
    );
}
//#endregion
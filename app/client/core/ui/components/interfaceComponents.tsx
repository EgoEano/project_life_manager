import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Pressable as RNPressable,
    Text as RNText,
    StyleSheet,
    View as RNView,
    TextInput as RNTextInput,
    Platform,
    FlatList,
    ScrollView,
    Animated,
    Pressable,
    Image
} from 'react-native';

import type { Dispatch, SetStateAction } from 'react';
import type {
    ViewStyle,
    TextStyle,
    GestureResponderEvent,
    StyleProp,
    TextProps as RNTextProps,
} from 'react-native';

import { useStyleAdapter, useStyleContext } from '../../services/providers/styleProvider';
import { useNotification } from '../../services/providers/notificationProvider';
import { useLanguage } from '../../services/providers/languageProviderService';
import { arrayBufferToBase64 } from '../../utils/helpers';
import { Theme } from '../../types/theme';

//#region Atoms
//#region Button
type Props_ButtonStyleGroup = {
    button?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
    pressed?: StyleProp<ViewStyle>;
    disabled?: StyleProp<ViewStyle>;
};
type Props_Button = {
    title?: string;
    onPress?: (event: GestureResponderEvent) => void;
    onLongPress?: (event: GestureResponderEvent) => void;
    disabled?: boolean;
    android_ripple?: {
        color?: string;
        borderless?: boolean;
        radius?: number;
        foreground?: boolean;
    };
    variant?: 'primary' | 'negative' | 'secondary' | 'success' | 'error' | 'disabled';
    style?: Props_ButtonStyleGroup;
    textStyle?: StyleProp<TextStyle>;
    children?: React.ReactNode;
};
const style_inner_Button = StyleSheet.create({
    button: {
        backgroundColor: '#1e90ff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
    },
    pressed: {
        opacity: 0.6,
        transform: [{ scale: 0.97 }],
    },
    disabled: {
        opacity: 0.4,
    },
    text: {
        color: 'white',
        fontSize: 16,
    },
});
export function Button({
    title,
    onPress,
    onLongPress,
    disabled = false,
    android_ripple,
    style = {},
    variant = 'primary',
    children,
}: Props_Button) {
    const { theme } = useStyleContext();

    return (
        <RNPressable
            onPress={onPress}
            onLongPress={onLongPress}
            disabled={disabled}
            android_ripple={android_ripple}
            // usual style array separate styles to conflict classes and inlines
            style={({ pressed }) => StyleSheet.flatten<ViewStyle>([
                style_inner_Button.button,
                pressed && style_inner_Button.pressed,
                disabled && style_inner_Button.disabled,

                theme?.components.button[variant]?.container,
                disabled && theme?.components.button.disabled.container,

                style?.button,
                pressed && style?.pressed,
                disabled && style?.disabled,
            ])}
        >
            {children ?? (
                <RNText
                    style={[
                        style_inner_Button.text,
                        theme?.components.button[variant]?.text ?? {},
                        style?.text,
                    ]}
                >
                    {title || ' '}
                </RNText>
            )}
        </RNPressable>
    );
}

//#endregion

//#region Text
// type TextStyleGroup = {
//     title?: StyleProp<TextStyle>;
//     body?: StyleProp<TextStyle>;
//     label?: StyleProp<TextStyle>;
// };
type TextProps = RNTextProps & {
    variant?: 'title' | 'subtitle' | 'body' | 'label';
    colorVariant?: 'main' | 'primary' | 'secondary' | 'success' | 'error';
    style?: StyleProp<TextStyle>;
};

export function Text({
    variant = 'body',
    colorVariant = 'main',
    style,
    children,
    ...props
}: TextProps) {
    const { theme } = useStyleContext();

    const baseStyle = theme?.components?.text?.[variant] ?? {};
    const color =
        theme?.semantics.colors.text[colorVariant] ??
        theme?.semantics.colors.text.main;

    return (
        <RNText style={[baseStyle, color && { color }, style]} {...props}>
            {children}
        </RNText>
    );
}

//#endregion

//#region Input:string
{
    /* <Input value={"value"} onChange={onChange} style={style}/> */
}
type Props_InputGroup = {
    container?: StyleProp<TextStyle>;
    placeholder?: StyleProp<TextStyle>;
    focused?: StyleProp<ViewStyle>;
    error?: StyleProp<ViewStyle>;
};

type InputProps = {
    type?: 'text' | 'number';
    secureEntry?: boolean;
    value: string;
    name?: string;
    placeholder?: string;
    onChange?: (val: string | number, name?: string) => void;
    onFocus?: (...args: unknown[]) => void;
    onBlur?: (...args: unknown[]) => void;
    error?: boolean;
    variant?:
        | 'main'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'error'
        | 'disabled';
    multiline?: boolean;
    readOnly?: boolean;
    style?: Props_InputGroup;
};
const style_inner_Input = StyleSheet.create({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
export function Input({
    type = 'text',
    secureEntry = false,
    value,
    name,
    placeholder = '',
    onChange,
    onFocus,
    onBlur,
    error = false,
    style = {},
    variant = 'main',
    multiline = false,
    readOnly = false,
    ...props
}: InputProps) {
    const { theme } = useStyleContext();
    const [focused, setFocused] = useState(false);

    const handleChange = (val: string) => {
        switch (type) {
            case 'text':
                onChange?.(val, name);
                break;
            case 'number':
                if (val === '') {
                    onChange?.('', name);
                    return;
                }
                if (!isNaN(Number(val))) onChange?.(Number(val), name);
                break;
        }
    };

    const handleBlur = (...args: unknown[]) => {
        setFocused(false);
        onBlur?.(...args);
    };

    const handleFocus = (...args: unknown[]) => {
        setFocused(true);
        onFocus?.(...args);
    };

    const base = theme?.components.input;
    const color =
        theme?.semantics.colors.text[variant] ??
        theme?.semantics.colors.text.main;

    return (
        <RNTextInput
            readOnly={readOnly}
            multiline={multiline}
            value={value}
            secureTextEntry={secureEntry}
            onChangeText={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={base?.placeholder.color}
            style={[
                style_inner_Input.container,
                base?.container,

                { color },

                style?.container,

                focused && base?.focusedBorder,
                focused && style?.focused,

                error && base?.errorBorder,
                error && style?.error,
            ]}
            {...props}
        />
    );
}

type MultilineInputProps = React.ComponentProps<typeof Input> & {
    initialHeight?: number;
    expandedHeight?: number;
};

export function MultilineInput({
    initialHeight = 110,
    expandedHeight = 220,
    style,
    onFocus,
    onBlur,
    readOnly,
    ...props
}: MultilineInputProps) {
    const animatedHeight = useRef(new Animated.Value(initialHeight)).current;
    
    const [isExpanded, setIsExpanded] = useState(false);

    function animateTo(toValue: number) {
        Animated.timing(animatedHeight, {
            toValue,
            duration: 220,
            useNativeDriver: false,
        }).start();
    }
    function handleFocus(...args: unknown[]) {
        if (readOnly) return;

        animateTo(expandedHeight);
        onFocus?.(...args);
    }
    function handleBlur(...args: unknown[]) {
        if (readOnly) return;

        animateTo(initialHeight);
        onBlur?.(...args);
    }
    function handlePressInReadOnly() {
        if (!readOnly) return;

        if (isExpanded) {
            animateTo(initialHeight);
            setIsExpanded(false);
        } else {
            animateTo(expandedHeight);
            setIsExpanded(true);
        }
    };

    useEffect(() => {
        if (readOnly) return;

        setIsExpanded(false);
        animateTo(initialHeight);
    }, [readOnly]);
    
    return (
        <Pressable 
            onPress={handlePressInReadOnly}
            pointerEvents={readOnly && Platform.OS !== 'web' ? 'box-only' : 'auto'}
        >
            <Animated.View style={{ minHeight: animatedHeight }}>
                <Input
                    {...props}
                    multiline={true}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    readOnly={readOnly}
                    style={{
                        ...style,
                        container: [
                            style?.container,
                            { flex: 1 } 
                        ]
                    }}
                />
            </Animated.View>
        </Pressable>
    );
}
//#endregion

//#region Checkbox
type CheckboxProps_Style = {
    container?: StyleProp<ViewStyle>;
    box?: StyleProp<ViewStyle>;
    checked?: StyleProp<ViewStyle>;
    label?: StyleProp<TextStyle>;
    error?: StyleProp<ViewStyle>;
};

type CheckboxProps = {
    value: boolean;
    name?: string;
    label?: string;

    onChange?: (val: boolean, name?: string) => void;

    error?: boolean;
    disabled?: boolean;

    variant?:
        | 'main'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'error'
        | 'disabled';

    style?: CheckboxProps_Style;
};
const style_inner_Checkbox = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center',
    },

    box: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderRadius: 4,
        borderColor: '#999',
        alignItems: 'center',
        justifyContent: 'center',
    },

    checked: {
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
    },

    innerDot: {
        width: 10,
        height: 10,
        backgroundColor: '#fff',
        borderRadius: 2,
    },

    label: {
        marginLeft: 8,
        // fontSize: 14,
    },
});
export function Checkbox({
    value,
    name,
    label,
    onChange,
    error = false,
    disabled = false,
    variant = 'main',
    style = {},
}: CheckboxProps) {
    const { theme } = useStyleContext();

    // const base = theme?.components.checkbox;

    const color =
        theme?.semantics.colors.text[variant] ??
        theme?.semantics.colors.text.main;

    const handlePress = () => {
        if (disabled) return;
        onChange?.(!value, name);
    };

    return (
        <RNPressable
            onPress={handlePress}
            style={[
                style_inner_Checkbox.container,
                // base?.container,
                style?.container,
                disabled && { opacity: 0.5 },
            ]}
        >
            <RNView
                style={[
                    // base?.box,
                    style_inner_Checkbox.box,

                    value && [
                        // base?.checked,
                        style_inner_Checkbox.checked,
                        { borderColor: color, backgroundColor: color },
                    ],

                    error && [
                        // base?.errorBorder, 
                        style?.error
                    ],

                    style?.box,
                ]}
            >
                {value && <RNView style={style_inner_Checkbox.innerDot}>{""}</RNView>}
            </RNView>

            {!!label && (
                <Text
                    style={[
                        // base?.label,
                        style_inner_Checkbox.label,
                        { color },
                        style?.label,
                    ]}
                >
                    {label}
                </Text>
            )}
        </RNPressable>
    );
}
//#endregion

//#region Select
type SelectProps_Style = {
    container?: StyleProp<ViewStyle>;
    trigger?: StyleProp<ViewStyle>;
    list?: StyleProp<ViewStyle>;
    item?: StyleProp<ViewStyle>;
    label?: StyleProp<TextStyle>;
    placeholder?: StyleProp<TextStyle>;
    error?: StyleProp<ViewStyle>;
};
type SelectProps<T> = {
    value: string | number | null | undefined;
    options: T[];

    keyExtractor: (item: T) => string;
    valueExtractor: (item: T) => string | number;
    onChange?: (val: string | number, name?: string | null) => void;

    name?: string;

    placeholder?: string;

    disabled?: boolean;
    error?: boolean;

    variant?: 'main' | 'primary' | 'secondary' | 'success' | 'error' | 'disabled';

    style?: SelectProps_Style;
};
type SelectOverlayProps<T> = {
    options: T[];
    value: string | number | null | undefined;
    onSelect: (val: string | number) => void;
    keyExtractor: (item: T) => string;
    valueExtractor: (item: T) => string | number;
    onClose: () => void;
};
const style_inner_Select = StyleSheet.create({
    trigger: {
    },
    triggerText: {
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        padding: 20,
    },

    listContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        maxHeight: 300,
        overflow: 'hidden',
    },

    item: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    selectedItem: {
        backgroundColor: '#f3f4f6',
    },

    itemText: {
        fontSize: 14,
    },
});
export function Select<T=any>({
    value,
    options,
    keyExtractor,
    valueExtractor,
    onChange,
    name,
    placeholder = 'Select...',
    disabled,
    style
}: SelectProps<T>) {
    const {t} = useLanguage();
    const { pushModalTop, removeModal, pushNotify } = useNotification();

    const selected = options.find(o => String(keyExtractor(o)) === String(value));
    
    const open = () => {
        if (disabled) return;

        if (!options || options.length == 0) {
            return pushNotify({
                type: 'info',
                message: 'List is empty!'
            })
        }

        pushModalTop(() => (
            <SelectOverlay<T>
                options={options}
                value={String(value)}
                keyExtractor={keyExtractor}
                valueExtractor={valueExtractor}
                onSelect={(val) => {
                    onChange?.(val, name ?? null);
                    removeModal();
                }}
                onClose={removeModal}
            />
        ), { modal: { isOverlay: true } });
    };

    return (
        <Button
            title={t(selected ? (String(valueExtractor(selected)) || placeholder) : placeholder)}
            onPress={open}
            variant='negative'
            style={{
                button: {
                    ...style_inner_Select.trigger,
                    ...(style?.trigger ?? {})
                }
            }}
        />
    );
}

const style_inner_SelectOverlay = StyleSheet.create({
    trigger: {
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },

    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        padding: 20,
    },

    box: {
        backgroundColor: '#fff',
        borderRadius: 20,
        maxHeight: 300,
        overflow: 'hidden',
    },

    list: {
        flexGrow: 0, 
        overflow: 'hidden',
    },

    item: {
        padding: 12,
    },

    active: {
    },

    text: {
        fontSize: 14,
    },
});
const selectBaseConfig = {
    onEndReachedThreshold: 0.5,
    initialNumToRender: 20,
    maxToRenderPerBatch: 20,
    windowSize: 11,

};
function SelectOverlay<T=any>({
    options,
    value,
    onSelect,
    keyExtractor,
    valueExtractor,
    onClose,
}: SelectOverlayProps<T>) {
    const {t} = useLanguage();

    return (
        <RNView style={style_inner_SelectOverlay.box}>
            <FlatList
                data={options}
                keyExtractor={keyExtractor}
                style={style_inner_SelectOverlay.list}
                contentContainerStyle={{ flexGrow: 0 }} 
                renderItem={({ item }) => {
                    const active = String(keyExtractor(item)) === String(value);

                    return (
                        <Button
                            variant={active ? "primary" : "negative"}
                            title={`${t(String(valueExtractor(item)))}`}
                            onPress={() => onSelect(keyExtractor(item))}
                            style={{
                                button: {
                                    ...style_inner_SelectOverlay.item,
                                    ...(active && style_inner_SelectOverlay.active),
                                }
                            }}
                        />
                    );
                }}
                onEndReachedThreshold={selectBaseConfig.onEndReachedThreshold}
                initialNumToRender={selectBaseConfig.initialNumToRender}
                maxToRenderPerBatch={selectBaseConfig.maxToRenderPerBatch}
                windowSize={selectBaseConfig.windowSize}
            />
        </RNView>
    );
}
//#endregion

//#endregion


//#region Moleculas

//#region Modal
{
    /* 
    <Modal
        isShow={isShow} 
        setIsShow={setIsShow}
        closable={closable}
    >
        content
    </Modal> 
*/
}
type ModalProps = {
    isShow: boolean;
    setIsShow: Dispatch<SetStateAction<boolean>>;
    closable?: boolean;
    style?: ModalProps_Style;
    children: React.ReactNode;
};
type ModalProps_Style = {
    wrapper: StyleProp<ViewStyle>;
    content: StyleProp<ViewStyle>;
}
const style_inner_Modal = StyleSheet.create({
    main: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: '#000000cf',
        elevation: 10,
        zIndex: 999,
    },
    content: {
        maxHeight: '100%',
        maxWidth: '100%',
    },
});
export function Modal({
    isShow,
    setIsShow,
    closable = true,
    children,
    style,
}: ModalProps) {
    const { theme } = useStyleContext();

    const handleOverlayPress = () => {
        if (closable) setIsShow(false);
    };

    if (!isShow) return null;

    return (
        <RNPressable
            onPress={handleOverlayPress}
            style={[
                style_inner_Modal.main,
                theme?.components.modal?.overlay,
                style?.wrapper,
            ]}
        >
            <RNPressable
                accessible={false}
                style={[
                    style_inner_Modal.content,
                    style?.content,
                ]} 
            >
                {children}
            </RNPressable>
        </RNPressable>
    );
}
//#endregion

//#region ModalCard
{
    /* 
    <ModalCard 
        isShow={isShow} 
        setIsShow={setIsShow}
    >
        children
    </ModalCard> 
*/
}
type ModalCardProps = {
    isShow: boolean;
    setIsShow: Dispatch<SetStateAction<boolean>>;
    isHasCross?: boolean;
    isScrollable?: boolean;
    showsVerticalScrollIndicator?: boolean;
    closable?: boolean;
    children: React.ReactNode;
    style?: ModalCard_StyleGroupProps;
};
export type ModalCard_StyleGroupProps = {
    modal?: ViewStyle;
    wrapper?: ViewStyle;
    card?: ViewStyle;
    content?: ViewStyle;
};
const style_inner_ModalCard = StyleSheet.create({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '100%',
        maxHeight: '100%',
        flexShrink: 1,
    },
    closeHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 10,
        marginBottom: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
    },
    card: {
        display: 'flex',
        flexShrink: 1,

        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
});
export function ModalCard({
    isShow,
    setIsShow,
    isHasCross = true,
    isScrollable = false,
    showsVerticalScrollIndicator = true,
    closable = true,
    children,
    style,
}: ModalCardProps) {
    const { theme } = useStyleContext();

    return (
        <Modal
            isShow={isShow}
            setIsShow={setIsShow}
            closable={closable}
            style={{
                wrapper: style?.modal,
                content: style?.content,  
            }}
        >
            <RNView style={[
                style_inner_ModalCard.wrapper, 
                style?.wrapper,
            ]}>
                {isHasCross && (
                    <RNView style={style_inner_ModalCard.closeHeader}>
                        <Pressable
                            onPress={() => setIsShow(false)}
                            hitSlop={12}
                        >
                            <Text style={style_inner_ModalCard.closeButtonText}>⛌</Text>
                        </Pressable>
                    </RNView>
                )}
                <Card
                    isScrollable={isScrollable}
                    isAllowHorizontalScroll={false}
                    showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                    style={[
                        style_inner_ModalCard.card,
                        theme?.components.card.container,
                        style?.card,
                    ]}
                >
                    {children}
                </Card>
            </RNView>
        </Modal>
    );
}
//#endregion

//#region Card
type CardProps = {
    isScrollable?: boolean;
    isAllowHorizontalScroll?: boolean;
    showsVerticalScrollIndicator?: boolean;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    children: React.ReactNode;
};
const style_inner_Card = StyleSheet.create({
    card: {
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    defaultPadding: {
        padding: 16,
    },
});
export function Card({
    isScrollable = false,
    isAllowHorizontalScroll = false,
    showsVerticalScrollIndicator = true,
    style = {},
    contentContainerStyle = {},
    children,
    ...props
}: CardProps) {
    const { theme } = useStyleContext();
    const cardTheme = theme?.components.card;

    const containerStyle = [
        style_inner_Card.card,
        !isScrollable && style_inner_Card.defaultPadding,
        cardTheme && cardTheme.container,
        style,
    ];

    return (isScrollable ?
        <RNView style={containerStyle} {...props}>
            <FlatList
                data={[1]}
                renderItem={() => <>{children}</>}
                keyExtractor={() => "card-content"}
                horizontal={isAllowHorizontalScroll}
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                showsHorizontalScrollIndicator={isAllowHorizontalScroll}
                bounces={true}
                contentContainerStyle={[
                    style_inner_Card.defaultPadding, 
                    contentContainerStyle,
                    { flexGrow: 1 }
                ]}
            />
        </RNView>
        :
        <RNView style={containerStyle} {...props}>
            {children}
        </RNView>
    );
}
//#endregion

//#region ModalImage
const style_ModalImage = (theme: Theme) => StyleSheet.create({
    modalCardImage: {
        width: '100%',
        height: '100%',
        backgroundColor: "#F1F1F1",
    },
    modalCardImageWrapper: {
        width: '100%',
        height: '100%',
        minHeight: 600,
    },
})
export function ModalImage({
    image,
    type,
}: {
    image: Uint8Array;
    type: string;
}) {
    const style = useStyleAdapter(style_ModalImage);
    
    const imageUrl = useMemo(() => {
        if (!image) return null;
        try {
            const base64String = arrayBufferToBase64(image);
            return `data:${type};base64,${base64String}`;
        } catch (error) {
            console.error("Ошибка конвертации ArrayBuffer в Base64:", error);
            return null;
        }
    }, [image, type]);


    if (!imageUrl) {
        return null;
    }

    return (
        <RNView style={style.modalCardImageWrapper}>
            <Image
                source={{ uri: imageUrl }}
                style={style.modalCardImage}
                resizeMode="contain"
            />
        </RNView>
    );
};
//#endregion

//#endregion

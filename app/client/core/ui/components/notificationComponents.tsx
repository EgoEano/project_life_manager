import { Text, Button, ModalCard, Modal } from './interfaceComponents';
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useStyleAdapter, useStyleContext } from '../../services/providers/styleProvider';

import type { NotifyItem, DialogItem, ModalItemExtras } from '../../types/notification';
import { notifStyles } from '../styles/styles';

export function NotifyView({
    queue,
    timeout,
    handleClose,
}: {
    queue: NotifyItem[];
    timeout: number;
    handleClose: (id: string) => void;
}) {
    const styles = useStyleAdapter(notifStyles);

    return (
        <View style={styles.notifyWrapper}>
            {queue.map((item) => (
                <NotifyCard
                    key={item.id}
                    item={item}
                    timeout={item?.timeout ?? timeout}
                    handleClose={handleClose}
                />
            ))}
        </View>
    );
}

export function NotifyCard({
    item,
    timeout,
    handleClose,
}: {
    item: NotifyItem;
    timeout: number;
    handleClose: (id: string) => void;
}) {
    const { id, message, header } = item;
    const styles = useStyleAdapter(notifStyles);

    useEffect(() => {
        const tm = setTimeout(() => {
            handleClose(id);
        }, timeout * 1000);

        return () => clearTimeout(tm);
    }, [id, timeout, handleClose]);

    return (
        <Pressable 
            style={styles.notifyCard}
            onLongPress={() => handleClose(id)}
        >
            {header && <Text
                numberOfLines={1}
                ellipsizeMode="tail" 
                style={styles.notifyHeaderText}
            >{header}</Text>}
            <Text
                numberOfLines={2}
                ellipsizeMode="tail" 
                style={styles.notifyMessageText}
            >{message}</Text>
        </Pressable>
    );
}

export function DialogView({
    item,
    handleClose,
}: {
    item: DialogItem;
    handleClose: () => void;
    confirmText?: string;
    cancelText?: string;
}) {
    const { header, message, actions, resolve } = item;
    const styles = useStyleAdapter(notifStyles);

    const handleAction = async (resolveValue: boolean, action?: () => void) => {
        handleClose();
        action?.();
        resolve(resolveValue);
    };

    if (!item) return null;

    return (
        <ModalCard
            isShow={true}
            setIsShow={() => null}
            isHasCross={false}
            closable={false}
            style={{
                wrapper: styles.confirmModal,
                card: styles.confirmCard,
            }}
        >
            <ScrollView style={styles.confirmTextArea}>
                {header && <Text variant={'subtitle'}>{header}</Text>}
                <Text>{message}</Text>
            </ScrollView>
            <View style={styles.confirmButtonArea}>
                {actions.map((action, index) => (
                    <Button
                        key={index}
                        title={action.text}
                        style={{
                            button: styles.confirmButton,
                        }}
                        onPress={() =>
                            handleAction(action.isResolve, action.action)
                        }
                    />
                ))}
            </View>
        </ModalCard>
    );
}

// export function OverlayHost({
//     children,
//     onClose,
//     isClosable = true,
// }: {
//     children: React.ReactNode;
//     onClose: () => void;
//     isClosable?: boolean;
// }) {
//     return (
//         <Modal 
//             isShow={true}
//             setIsShow={onClose}
//             closable={isClosable}
//         >
//             {children}
//         </Modal>
//     );
// }

export function ModalHost({
    children,
    onClose,
    isClosable = true,
    extras,
}: {
    children: React.ReactNode;
    onClose: () => void;
    isClosable?: boolean;
    extras?: ModalItemExtras
}) {
    return (
        extras?.modal?.isOverlay ?
        <Modal 
            isShow={true}
            setIsShow={onClose}
            closable={extras?.modal?.isClosable ?? isClosable}
            style={{
                wrapper: extras?.style?.wrapper ?? {},
                content: extras?.style?.content ?? {}
            }}
        >
            {children}
        </Modal>
        :
        <ModalCard
            isShow={true}
            setIsShow={onClose}
            closable={extras?.modal?.isClosable ?? isClosable}
            isHasCross={extras?.modal?.hasCross ?? true}
            isScrollable={extras?.modal?.isScrollable}
            showsVerticalScrollIndicator={false}
            style={{
                wrapper: extras?.style?.wrapper ?? {},
                content: extras?.style?.content ?? {},
                modal: extras?.style?.modal ?? {},
                card: extras?.style?.card ?? {},
            }}
        >
            {children}
        </ModalCard>
    );
}
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    DialogView,
    ModalHost,
    NotifyView,
} from '../../ui/components/notificationComponents';

import type {
    NotificationProviderContextType,
    NotificationProviderProps,
    NotifyItem,
    DialogItem,
    ModalItem,
    ModalItemExtras,
} from '../../types/notification';

const NotifyContext = createContext<NotificationProviderContextType | null>(
    null,
);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
}) => {
    const MAX_STACK_SIZE: number = 3;
    const NOTIFY_TIMEOUT_SECONDS = 7;

    const notifyQueue = useRef<NotifyItem[]>([]);
    const dialogQueue = useRef<DialogItem[]>([]);
    const modalQueue = useRef<ModalItem[]>([]);

    const [notify, setNotify] = useState<NotifyItem[]>([]);
    const [dialog, setDialog] = useState<DialogItem | null>(null);
    const [modals, setModals] = useState<ModalItem[]>([]);

    // Notify
    const pushNotify = (item: Omit<NotifyItem, 'id'>) => {
        const fullItem: NotifyItem = {
            ...item,
            id: String(Math.random() * 1000),
        };

        if (notify.length >= MAX_STACK_SIZE) {
            notifyQueue.current.push(fullItem);
        } else {
            setNotify((q) => [...q, fullItem]);
        }
    };
    const removeNotify = (id: string) => {
        setNotify((q) => q.filter((n) => n.id !== id));
    };

    // Dialog
    const pushDialog = (
        item: Omit<DialogItem, 'resolve'>,
    ): Promise<boolean> => {
        return new Promise((resolve) => {
            const fullItem: DialogItem = {
                ...item,
                resolve,
            };
            if (dialog) {
                dialogQueue.current.push(fullItem);
            } else {
                setDialog(fullItem);
            }
        });
    };
    const pushDialogTop = (
        item: Omit<DialogItem, 'resolve'>,
    ): Promise<boolean> => {
        return new Promise((resolve) => {
            const fullItem: DialogItem = {
                ...item,
                resolve,
            };
            if (dialog) {
                dialogQueue.current.unshift(fullItem);
            } else {
                setDialog(fullItem);
            }
        });
    };
    const removeDialog = () => setDialog(null);

    // Modal
    const pushModal = (render: () => React.ReactNode, extras?: ModalItemExtras) => {
        const item: ModalItem = {
            id: String(Math.random()),
            render,
            extras,
        };
    
        if (modals.length > 0) {
            modalQueue.current.push(item);
        } else {
            setModals([item]);
        }
    };
    const pushModalTop = (render: () => React.ReactNode, extras?: ModalItemExtras) => {
        const item: ModalItem = {
            id: String(Math.random()),
            render,
            extras,
        };

        setModals(prev => [...prev, item]);
    };
    const removeModal = (id?: string) =>  {
        if (id)
            setModals(prev => prev.filter(m => m.id !== id));
        else
            setModals(prev => prev.slice(0, -1));
    };

    //Effects
    useEffect(() => {
        if (
            notify.length < MAX_STACK_SIZE &&
            notifyQueue.current.length > 0
        ) {
            const nextNotify = notifyQueue.current.shift();
            if (nextNotify) {
                setNotify((q) => [...q, nextNotify]);
            }
        }
    }, [notify]);

    useEffect(() => {
        if (!dialog && dialogQueue.current.length > 0) {
            const nextDialog = dialogQueue.current.shift();
            if (nextDialog) {
                setDialog(nextDialog);
            }
        }
    }, [dialog]);

    useEffect(() => {
        if (modals.length == 0 && modalQueue.current.length > 0) {
            const next = modalQueue.current.shift();
            if (next) {
                setModals([next]);
            }
        }
    }, [modals]);

    const value = {
        pushNotify,
        removeNotify,
        pushDialog,
        pushDialogTop,
        removeDialog,
        pushModal,
        pushModalTop,
        removeModal
    };

    return (
        <NotifyContext.Provider value={value}>
            {children}
            {modals.length > 0 && modals.map((modal, index) => (
                <ModalHost
                    key={modal.id}
                    extras={modal.extras}
                    onClose={removeModal}
                >
                    {modal.render()}
                </ModalHost>
            ))}
            {dialog && (
                <DialogView item={dialog} handleClose={removeDialog} />
            )}
            {notify.length > 0 && (
                <NotifyView
                    queue={notify}
                    timeout={NOTIFY_TIMEOUT_SECONDS}
                    handleClose={removeNotify}
                />
            )}
        </NotifyContext.Provider>
    );
};

export const useNotification = (): NotificationProviderContextType => {
    const context = useContext(NotifyContext);
    if (!context) {
        throw new Error(
            'useNotification must be used within a NotificationProvider',
        );
    }
    return context;
};

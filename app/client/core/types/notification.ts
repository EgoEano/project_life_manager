import type { ReactNode } from 'react';
import { ModalCard_StyleGroupProps } from '../ui/components/interfaceComponents';

export type NotifyItemTypes = 'success' | 'error' | 'info';
export interface NotifyItem {
    id: string;
    type: NotifyItemTypes;
    message: string;
    header?: string;
    timeout?: number;
};

export interface DialogAction {
    text: string;
    isResolve: boolean;
    action?: () => void;
};

export interface DialogItem {
    message: string;
    header?: string;
    actions: DialogAction[];
    resolve: (value: boolean) => void;
};

// export interface OverlayItem {
//     id: string;
//     render: () => React.ReactNode;
// };

export interface ModalItem {
    id: string;
    render: () => React.ReactNode;
    extras?: ModalItemExtras;
};

export interface ModalItemExtras {
    style?: ModalCard_StyleGroupProps;
    modal?: {
        isClosable?: boolean;
        hasCross?: boolean;
        isOverlay?: boolean;
        isScrollable?: boolean;
    }
};


export interface NotificationProviderContextType {
    pushNotify: (item: Omit<NotifyItem, 'id'>) => void;
    removeNotify: (id: string) => void;
    pushDialog: (item: Omit<DialogItem, 'resolve'>) => Promise<boolean>;
    pushDialogTop: (item: Omit<DialogItem, 'resolve'>) => Promise<boolean>;
    removeDialog: () => void;
    pushModal: (render: () => React.ReactNode, extras?: ModalItemExtras) => void;
    pushModalTop: (render: () => React.ReactNode, extras?: ModalItemExtras) => void;
    removeModal: () => void;
};

export interface NotificationProviderProps {
    children: ReactNode;
};

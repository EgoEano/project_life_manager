import React, { createContext, useContext, useRef } from 'react';

// Creating exemplair
/*
export const {
    EventProvider: NotificationProvider,
    useEventContext: useNotifications,
} = createEventProvider();
*/
// Wrap
/*
<NotificationProvider>
    <Component />
</NotificationProvider>
*/
// Call
/*
const notifications = useNotifications();
notifications.emit({
    type: 'success',
    message: 'Item saved!',
});
*/
// Subscribe
/*
const notifications = useNotifications();
useEffect(() => {
    const unsub = notifications.subscribe((payload) => {
        showToast(payload.message); // или setPopup(payload)
    });
    return unsub;
}, []);
*/

type Listener<T> = (payload: T) => void;
type EventBus<T> = {
    subscribe: (cb: Listener<T>) => () => void;
    emit: (payload: T) => void;
};

export function createEventProvider<T>() {
    const Context = createContext<EventBus<T> | null>(null);

    const useEventContext = () => {
        const ctx = useContext(Context);
        if (!ctx)
            throw new Error(
                'useEventContext must be used inside EventProvider',
            );
        return ctx;
    };

    const createEventBus = (): EventBus<T> => {
        let listeners: Listener<T>[] = [];

        return {
            subscribe: (cb: Listener<T>) => {
                listeners.push(cb);
                return () => {
                    listeners = listeners.filter((fn) => fn !== cb);
                };
            },
            emit: (payload) => {
                listeners.forEach((fn) => fn(payload));
            },
        };
    };

    const EventProvider = ({ children }: { children: React.ReactNode }) => {
        const eventBusRef = useRef(createEventBus());

        return (
            <Context.Provider value={eventBusRef.current}>
                {children}
            </Context.Provider>
        );
    };

    return {
        EventProvider,
        useEventContext,
    };
}

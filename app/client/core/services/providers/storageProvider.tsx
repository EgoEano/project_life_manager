import React from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { RootState, AppDispatch } from '../../../modules/stores';

export const StorageProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return <Provider store={store}>{children}</Provider>;
};

// Typed hooks for accessing Redux store
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T,>(selector: (state: RootState) => T): T =>
    useSelector(selector);

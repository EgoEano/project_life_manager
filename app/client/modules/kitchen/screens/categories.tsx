import { useDbReady } from "../../../core/services/hooks/useDbReady";
import { useLanguage } from "../../../core/services/providers/languageProviderService";
import { Layout, PlaceholderScreen } from "../../../core/ui/components/navigationComponents";
import type { RefItemForm } from '../../../core/types/types';
import { RefManager } from "../../../core/ui/components/functionalComponents";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useEffect } from "react";
import { actionRefEntity, fetchRefs } from "../store/thunk";


export function CategoriesScreen() {
    const dispatch = useAppDispatch();

    const refs = useAppSelector((state) => state.kitchen.kitchenRefs);

    const formSubmit = async (data: RefItemForm, name: string) => {
        await dispatch(actionRefEntity({data, name}));
        await dispatch(fetchRefs());
    };

    useEffect(() => {
        dispatch(fetchRefs());
    }, []);

    return (
        <RefManager
            module="kitchen"
            refs={refs}
            onSubmit={formSubmit}
        />
    );
}



export function Categories() {
    const {t} = useLanguage();
    const isDbReady = useDbReady();

    if (!isDbReady) return <PlaceholderScreen name={`${t("initializing")}...`}/>
    
    return (
        <Layout>
            <CategoriesScreen/>
        </Layout>
    );
}
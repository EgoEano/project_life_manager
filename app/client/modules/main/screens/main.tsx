import { View } from 'react-native';
import { useNotification } from '../../../core/services/providers/notificationProvider';
import { Text, Button } from '../../../core/ui/components/interfaceComponents';
import { Layout } from '../../../core/ui/components/navigationComponents';
import { useLanguage } from '../../../core/services/providers/languageProviderService';
import { useEffect } from 'react';

function MainComponent() {

    return (
        <View
            style={{
                display: 'flex',
                flex: 1,
                justifyContent: 'center',
                alignContent: 'center',
            }}
        >
        </View>
    );
}

export function MainScreen() {
    const {t} = useLanguage();

    useEffect(() => {
    }, []);

    return (
        <Layout>
            <MainComponent/>
        </Layout>
    );
}
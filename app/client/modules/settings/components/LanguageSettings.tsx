import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from '../../../core/ui/components/interfaceComponents';
import { useLanguage } from '../../../core/services/providers/languageProviderService';
import {  useState } from 'react';
import { useStyleAdapter } from '../../../core/services/providers/styleProvider';
import { styles } from '../theme';


export function LanguageSettings() {
    const { t, setLanguage, getLanguages } = useLanguage();
    const style = useStyleAdapter(styles);

    const [langs, _setLangs] = useState<string[]>(getLanguages());

    return (
        <Card style={style.rootLng}>
            <Text>{t("settings.lang.select")}</Text>

            <View style={style.areaLng}>
                {langs.map((l) => (<Button 
                    key={l}
                    onPress={() => setLanguage(l)} 
                    title={t(`settings.lang.${l}`)}
                />))}
            </View>
        </Card>
    );
};

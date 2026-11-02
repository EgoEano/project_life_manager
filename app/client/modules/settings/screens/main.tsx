import { View } from 'react-native';
import { Layout } from '../../../core/ui/components/navigationComponents';
import { BackupSettings } from '../components/BackupSettings';
import { LanguageSettings } from '../components/LanguageSettings';
import { useStyleAdapter } from '../../../core/services/providers/styleProvider';
import { styles } from '../theme';
import { ThemeSettings } from '../components/ThemeSettings'


function SettingsComponent() {
    const style = useStyleAdapter(styles);

    return (
        <View
            style={style.root}
        >
            <LanguageSettings />
            <ThemeSettings />
            <BackupSettings />
        </View>
    );
}

export function SettingsScreen() {
    return (
        <Layout>
            <SettingsComponent/>
        </Layout>
    );
}
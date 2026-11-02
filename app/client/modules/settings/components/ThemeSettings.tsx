import { View, StyleSheet } from 'react-native';
import { Button, Card, Select, Text } from '../../../core/ui/components/interfaceComponents';
import { useLanguage } from '../../../core/services/providers/languageProviderService';
import { Option } from '../../../core/types/types'
import { useStyleAdapter, useStyleContext } from '../../../core/services/providers/styleProvider';
import { styles } from '../theme';
import { useMemo } from 'react';


export function ThemeSettings() {
    const { t } = useLanguage();
    const style = useStyleAdapter(styles);
    const { 
        currentTheme, themeMode, selectMode, selectTheme, getThemes 
    } = useStyleContext();

    const themeOptions = useMemo(() => getThemes().map<Option>(n => ({
        key: n, value: n
    })), [getThemes]);

    return (
        <Card style={style.rootLng}>
            <Text>{t("settings.theme.header")}</Text>
            <View>
                <View style={style.areaLng}>
                    <View style={style.areaThmBtm}>
                        <Button 
                            onPress={() => selectMode("dark")} 
                            variant={themeMode === "light" ? "primary" : "negative"}
                            title={t(`settings.theme.darkTheme`)}
                            style={{button: {
                                ...style.thmBtmR,
                                ...(themeMode === "dark" ? style.haloStyle : {}),
                            }}}
                        />
                        <Button
                            onPress={() => selectMode("light")}
                            variant={themeMode === "dark" ? "primary" : "negative"}
                            title={t(`settings.theme.lightTheme`)}
                            style={{button: {
                                ...style.thmBtmL,
                                ...(themeMode === "light" ? style.haloStyle : {}),
                            }}}
                        />
                    </View>
                    <Select<Option>
                        value={currentTheme}
                        options={themeOptions}
                        keyExtractor={(o) => o.key}
                        valueExtractor={(o) => o.value}
                        onChange={(val) => selectTheme(String(val))}
                        name="theme"
                        placeholder={`${t("settings.theme.emptySelect")}...`}
                        style={{ trigger: style.themeSelectorTrigger }}
                    />

                </View>
            </View>
        </Card>
    );
};

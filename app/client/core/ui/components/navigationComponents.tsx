import { ReactNode, useEffect, useRef } from 'react';
import {
    Animated, 
    Pressable,
    View,
    ViewStyle,
    useWindowDimensions
} from 'react-native';
import { Text, Button } from '../../../core/ui/components/interfaceComponents';
import { useStyleAdapter, useStyleContext } from '../../../core/services/providers/styleProvider';
import { useNotification } from '../../../core/services/providers/notificationProvider';
import { Navigator } from '../../../core/services/navigation/navigationService';
import { routeMap } from '../../../modules/routes';
import { RouteNodePath } from '../../types/types';
import { useLanguage } from '../../services/providers/languageProviderService';
import { Theme } from '../../types/theme';
import { navStyles } from '../styles/styles';
import { NavigationAdapterRoute } from '../../types/navigation';


export function Layout({ children }: { children: ReactNode }) {
    const { theme } = useStyleContext();
    const style = useStyleAdapter(navStyles);

    return (
        <View
            style={{
                ...style.rootLayout,
                backgroundColor: theme?.tokens.colors.background
            }}
        >
            <Header/>
            <View style={[style.layoutBody, style.layoutBodyContent]}>
                {children}
            </View>
        </View>
    );
}

export function SidebarMenu({ 
    theme, routeMap, onNaviPress, onClose 
}: {
    theme: Theme;
    routeMap: RouteNodePath;
    onNaviPress: () => void;
    onClose: () => void;
}) {
    const style = useStyleAdapter(navStyles);
    const { width: screenWidth } = useWindowDimensions();
    const menuWidth = Math.min(300, screenWidth - 40);

    const animX = useRef(new Animated.Value(-menuWidth)).current;

    function handleClose() {
        Animated.timing(animX, {
            toValue: -menuWidth,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    }
    function handleNaviPress() {
        handleClose();
        onNaviPress();
    }

    useEffect(() => {
        Animated.timing(animX, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={{
                ...style.sidebarModalCard,
                backgroundColor: theme?.tokens.colors.background,
                width: menuWidth,
                transform: [{ translateX: animX }],
            }}
        >
            <NavigationTree routeMap={routeMap} onPress={handleNaviPress} />
        </Animated.View>
    );
}

export function Header() {
    const { theme } = useStyleContext();
    const style = useStyleAdapter(navStyles);
    const { pushModalTop, removeModal } = useNotification();

    function onNaviPress() {
    }

    function openMenu() {
        pushModalTop(() => (
            <SidebarMenu 
                theme={theme}
                routeMap={routeMap}
                onNaviPress={onNaviPress}
                onClose={removeModal}
            />
        ), {
            style: {
                wrapper: style.sidebarWrapper,
                content: style.sidebarModal,
            },
            modal: {
                isClosable: true, 
                isOverlay: true
            }
        });
    }

    return (
        <View style={{ ...style.headerRoot, backgroundColor: theme?.tokens.colors.primary }}>
            <Button onPress={openMenu} style={{ button: style.headerBtn }}>
                <MenuLines />
            </Button>
        </View>
    );
}

export interface NavigationTreeProps {
    routeMap: RouteNodePath;
    onPress?: (route: NavigationAdapterRoute) => void;
};
export function NavigationTree({ routeMap, onPress }: NavigationTreeProps) {

    function onNaviPress(route: NavigationAdapterRoute) {
        Navigator.navigate(route);
        onPress?.(route);
    }
    return (
        <View>
            <NavigationTreeNode
                onPress={onNaviPress}
                node={routeMap} 
                level={0} 
            />
        </View>
    );
}

export interface NavigationTreeNodeProps {
    node: RouteNodePath;
    level: number;
    onPress?: (route: NavigationAdapterRoute) => void;
};
function NavigationTreeNode({
    node,
    level,
    onPress,
}: NavigationTreeNodeProps) {
    const { t } = useLanguage();
    const style = useStyleAdapter(navStyles);
    const { name: pathName } = Navigator.getCurrentRoute();
    const isShow = node.options?.navTreeShown ?? true;
    const isSelected = node.path === pathName || node.name === pathName;

    return (
        <View>
            <Pressable
                onPress={() => onPress?.({path: node.path, name: node.name})}
                style={{
                    ...style.navTreeNode,
                    paddingLeft: style.navTreeNode.paddingLeft * level,
                    ...(!isShow ? {display: "none"} : {}),
                    ...(isSelected ? style.navTreeNodeSelectedMod : {}),
                }}
            >
                <Text>{t(node.name ?? node.path)}</Text>
            </Pressable>

            {node.children?.map((child) => (
                <NavigationTreeNode
                    key={child.path}
                    node={child}
                    level={level + 1}
                    onPress={onPress}
                />
            ))}
        </View>
    );
}

export function MenuLines() {
    const {theme} = useStyleContext();
    const style = useStyleAdapter(navStyles);

    const colorStyle = {
        backgroundColor: theme?.tokens.colors.onPrimary,
    };

    return (
        <View style={style.menuLinesContainer}>
            <View style={[style.menuLinesLine, colorStyle]}></View>
            <View style={[style.menuLinesLine, colorStyle]}></View>
            <View style={[style.menuLinesLine, colorStyle]}></View>
        </View>
    )
}

export function PlaceholderScreen({
    name,
    style = {},
}: {
    name: string;
    style?: ViewStyle;
}) {
    const stl = useStyleAdapter(navStyles);

    return (
        <View
            style={{
                ...stl.placeholerViewRoot,
                ...style,
            }}
        >
            <Text>{name}</Text>
        </View>
    );
}
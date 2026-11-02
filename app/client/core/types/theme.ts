import type { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

//#region Tokens
export type ColorTokens = {
    background: string;
    surface: string;

    primary: string;
    primaryVariant: string;
    secondary: string;
    secondaryVariant: string;

    onSurface: string;
    onPrimary: string;
    onSecondary: string;
    onDisabled: string;

    disabled: string;
    success: string;
    warning: string;
    error: string;
    backdrop: string;
};

export type SizeTokens = {
    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };
    radius: {
        sm: number;
        md: number;
        lg: number;
    };
    borderWidth: {
        thin: number;
        thick: number;
    };
    backdrop: {
        opacity: number;
        blur: number;
    };
};

export type TypographyTokens = {
    fontFamily: string;

    fontSize: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };

    fontWeight: {
        regular: TextStyle['fontWeight'];
        medium: TextStyle['fontWeight'];
        bold: TextStyle['fontWeight'];
    };

    lineHeight: {
        tight: TextStyle['lineHeight'];
        normal: TextStyle['lineHeight'];
        relaxed: TextStyle['lineHeight'];
    };
};

export type StyleTokens = {
    colors: ColorTokens;
    sizes: SizeTokens;
    typography: TypographyTokens;
    elevation: {
        level0: number; // none
        level1: number; // card
        level2: number; // dropdown
        level3: number; // dialog
        level4: number; // modal
    };
};
//#endregion

//#region Semantics
export type ColorSemantics = {
    text: {
        main: string;
        primary: string;
        secondary: string;
        disabled: string;
        success: string;
        error: string;
    };
    surfaces: {
        base: string;
        elevated: string;
        sunken: string;
    };
    states: {
        focus: string;
        pressed: string;
        hovered: string;
    };
    borders: {
        default: string;
        focused: string;
        disabled: string;
        error: string;
    };
    buttons: {
        primary: {
            bg: string;
            text: string;
            border: string;
        };
        secondary: {
            bg: string;
            text: string;
            border: string;
        };
        success: {
            bg: string;
            text: string;
            border: string;
        };
        error: {
            bg: string;
            text: string;
            border: string;
        };
        disabled: {
            bg: string;
            text: string;
            border: string;
        };
    };
    overlays: {
        backdropColor: string;
        backdropOpacity: number;
        blur: number;
    };
};

export type SizeSemantics = {
    padding: {
        buttonSm: number;
        buttonMd: number;
        card: number;
    };
    radius: {
        button: number;
        input: number;
        card: number;
    };
};

export type TypographySemantics = {
    title: {
        fontSize: number;
        fontWeight: TextStyle['fontWeight'];
        lineHeight: number;
    };
    subtitle: {
        fontSize: number;
        fontWeight: TextStyle['fontWeight'];
        lineHeight: number;
    };
    body: {
        fontSize: number;
        fontWeight: TextStyle['fontWeight'];
        lineHeight: number;
    };
    label: {
        fontSize: number;
        fontWeight: TextStyle['fontWeight'];
        lineHeight: number;
    };
};

export type StyleSemantics = {
    colors: ColorSemantics;
    sizes: SizeSemantics;
    typography: TypographySemantics;
};
//#endregion

//#region Component
export type ComponentStyles = {
    button: {
        primary: {
            container: ViewStyle;
            text: TextStyle;
        };
        negative: {
            container: ViewStyle;
            text: TextStyle;
        };
        secondary: {
            container: ViewStyle;
            text: TextStyle;
        };
        success: {
            container: ViewStyle;
            text: TextStyle;
        };
        error: {
            container: ViewStyle;
            text: TextStyle;
        };
        disabled: {
            container: ViewStyle;
            text: TextStyle;
        };
    };

    card: {
        container: ViewStyle;
        title: TextStyle;
        content: TextStyle | ViewStyle;
    };

    input: {
        container: TextStyle;
        placeholder: TextStyle;
        focusedBorder: ViewStyle;
        errorBorder: ViewStyle;
    };

    listItem: {
        container: ViewStyle;
        title: TextStyle;
        subtitle: TextStyle;
        icon: TextStyle | ViewStyle;
    };

    modal: {
        overlay: ViewStyle & { blur?: number };
        container: ViewStyle;
        title: TextStyle;
        content: TextStyle | ViewStyle;
    };

    text: {
        title: TextStyle;
        subtitle: TextStyle;
        body: TextStyle;
        label: TextStyle;
    };
};

// Theme
export type Theme = {
    tokens: StyleTokens;
    semantics: StyleSemantics;
    components: ComponentStyles;
};
//#endregion

//#region Builder
export interface BuildThemeComponentsProps {
    tokens: StyleTokens;
    semantics: StyleSemantics;
}

export interface ThemePreset {
    tokens: StyleTokens;
    semantics: (tokens: StyleTokens) => StyleSemantics;
    components: (p: BuildThemeComponentsProps) => ComponentStyles;
}

export interface ThemeContainer {
    [name: string]: {
        light: Theme;
        dark: Theme;
    };
}

export type ThemeMode = "light" | "dark"
//#endregion
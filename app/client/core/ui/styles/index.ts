import { Platform } from "react-native";
import { Theme, ThemeContainer, ThemePreset } from "../../types/theme";
import { buildTheme } from "../../utils/theme";


export const themePresetTokenColors: ThemePreset["tokens"]["colors"] = {
    background: '#fff',
    surface: '#fafafa',

    primary: '#1f1f1f',
    primaryVariant: '#3c3c3cff',
    secondary: '#000d45ff',
    secondaryVariant: '#001264ff',

    onSurface: '#1f1f1f',
    onPrimary: '#F5F6FA',
    onSecondary: '#F5F6FA',
    onDisabled: '#c0c0c0ff',

    disabled: '#CED0CE',
    success: '#3CB371',
    warning: '#e6cf00',
    error: '#c23434',
    backdrop: '#1f1f1f',
};
export const themePresetTokenColorsDark: ThemePreset["tokens"]["colors"] = {
    background: '#000000',
    surface: '#121212',

    primary: '#FFFFFF',
    primaryVariant: '#E6E6E6',
    secondary: '#E6E6E6',
    secondaryVariant: '#FFFFFF',

    onSurface: '#EAEAEA',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onDisabled: '#6A6A6A',

    disabled: '#5e5e5e',
    success: '#BDBDBD',
    warning: '#AFAFAF',
    error: '#EB1515',
    backdrop: '#000000',
};

export const themePresetTokenSizes: ThemePreset["tokens"]["sizes"] = {
    spacing: {
        xs: Platform.select({ web: 4, default: 3 }),
        sm: Platform.select({ web: 8, default: 6 }),
        md: Platform.select({ web: 12, default: 10 }),
        lg: Platform.select({ web: 24, default: 20 }),
        xl: Platform.select({ web: 32, default: 28 }),
    },
    radius: {
        sm: 8,
        md: 14,
        lg: 20,
        },
    borderWidth: {
        thin: 1,
        thick: 2,
    },
    backdrop: {
        opacity: 0.7,
        blur: 5,
    },
};
export const themePresetTokenTypography: ThemePreset["tokens"]["typography"] = {
    fontFamily: 'System',
    fontSize: {
        xs: Platform.select({ web: 10, default: 8 }), 
        sm: Platform.select({ web: 14, default: 10 }), 
        md: Platform.select({ web: 16, default: 12 }), 
        lg: Platform.select({ web: 20, default: 14 }), 
        xl: Platform.select({ web: 32, default: 20 }), 
    },
    fontWeight: {
        regular: 400,
        medium: 600,
        bold: 700,
    },
    lineHeight: {
        tight: Platform.select({ web: 1.2, default: 1 }),
        normal: Platform.select({ web: 1.5, default: 1.2 }),
        relaxed: Platform.select({ web: 1.8, default: 1.5 }),
    },
};
export const themePresetTokenElevation: ThemePreset["tokens"]["elevation"] = {
    level0: 0,
    level1: 4,
    level2: 8,
    level3: 12,
    level4: 16,
};


export const themePresetTokens: ThemePreset["tokens"] = {
    colors: themePresetTokenColors,
    sizes: themePresetTokenSizes,
    typography: themePresetTokenTypography,
    elevation: themePresetTokenElevation,
};
export const themePresetTokensDark: ThemePreset["tokens"] = {
    colors: themePresetTokenColorsDark,
    sizes: themePresetTokenSizes,
    typography: themePresetTokenTypography,
    elevation: themePresetTokenElevation,
};
export const themePresetSemantics: ThemePreset["semantics"] = (tokens) => ({
    colors: {
        text: {
            main: tokens.colors.onSurface,
            primary: tokens.colors.onPrimary,
            secondary: tokens.colors.onSecondary,
            disabled: tokens.colors.onDisabled,
            success: tokens.colors.success,
            error: tokens.colors.error,
        },
        surfaces: {
            base: tokens.colors.background,
            elevated: tokens.colors.surface,
            sunken: tokens.colors.disabled,
        },
        states: {
            focus: tokens.colors.primaryVariant,
            pressed: tokens.colors.secondaryVariant,
            hovered: tokens.colors.secondary,
        },
        borders: {
            default: tokens.colors.primaryVariant,
            focused: tokens.colors.primary,
            disabled: tokens.colors.disabled,
            error: tokens.colors.error,
        },
        buttons: {
            primary: {
                bg: tokens.colors.primary,
                text: tokens.colors.onPrimary,
                border: tokens.colors.primaryVariant,
            },
            secondary: {
                bg: tokens.colors.secondary,
                text: tokens.colors.onSecondary,
                border: tokens.colors.secondaryVariant,
            },
            success: {
                bg: tokens.colors.success,
                text: tokens.colors.onPrimary,
                border: tokens.colors.success,
            },
            error: {
                bg: tokens.colors.error,
                text: tokens.colors.primary,
                border: tokens.colors.error,
            },
            disabled: {
                bg: tokens.colors.disabled,
                text: tokens.colors.onDisabled,
                border: tokens.colors.disabled,
            },
        },
        overlays: {
            backdropColor: tokens.colors.backdrop,
            backdropOpacity: tokens.sizes.backdrop.opacity,
            blur: tokens.sizes.backdrop.blur,
        },
    },
    sizes: {
        padding: {
            buttonSm: tokens.sizes.spacing.sm,
            buttonMd: tokens.sizes.spacing.md,
            card: tokens.sizes.spacing.md,
        },
        radius: {
            button: tokens.sizes.radius.md,
            input: tokens.sizes.radius.md,
            card: tokens.sizes.radius.lg,
        },
    },
    typography: {
        title: {
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            lineHeight:
                tokens.typography.fontSize.xl *
                (tokens.typography.lineHeight.relaxed ?? 1),
        },
        subtitle: {
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.bold,
            lineHeight:
                tokens.typography.fontSize.lg *
                (tokens.typography.lineHeight.relaxed ?? 1),
        },
        body: {
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.medium,
            lineHeight:
                tokens.typography.fontSize.md *
                (tokens.typography.lineHeight.normal ?? 1),
        },
        label: {
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.regular,
            lineHeight:
                tokens.typography.fontSize.sm *
                (tokens.typography.lineHeight.tight ?? 1),
        },
    },
});
export const themePresetComponents: ThemePreset["components"] = ({ tokens, semantics }) => ({
    button: {
        primary: {
            container: {
                backgroundColor: semantics.colors.buttons.primary.bg,
                borderColor: semantics.colors.buttons.primary.border,
                borderWidth: tokens.sizes.borderWidth.thin,
                borderRadius: semantics.sizes.radius.button,
                paddingVertical: semantics.sizes.padding.buttonMd,
            },
            text: {
                color: semantics.colors.buttons.primary.text,
                fontSize: semantics.typography.body.fontSize,
                fontWeight: semantics.typography.label.fontWeight,
            },
        },
        negative: {
            container: {
                backgroundColor: semantics.colors.buttons.primary.text,
                borderColor: semantics.colors.buttons.primary.border,
                borderWidth: tokens.sizes.borderWidth.thin,
                borderRadius: semantics.sizes.radius.button,
                paddingVertical: semantics.sizes.padding.buttonMd,
            },
            text: {
                color: semantics.colors.buttons.primary.bg,
                fontSize: semantics.typography.body.fontSize,
                fontWeight: semantics.typography.label.fontWeight,
            },
        },
        secondary: {
            container: {
                backgroundColor: semantics.colors.buttons.secondary.bg,
                borderColor: semantics.colors.buttons.secondary.border,
                borderWidth: tokens.sizes.borderWidth.thick,
                borderRadius: semantics.sizes.radius.button,
                paddingVertical: semantics.sizes.padding.buttonMd,
            },
            text: {
                color: semantics.colors.buttons.secondary.text,
                fontSize: semantics.typography.body.fontSize,
                fontWeight: semantics.typography.label.fontWeight,
            },
        },
        success: {
            container: {
                backgroundColor: semantics.colors.buttons.success.bg,
                borderColor: semantics.colors.buttons.success.border,
                borderWidth: tokens.sizes.borderWidth.thin,
                borderRadius: semantics.sizes.radius.button,
                paddingVertical: semantics.sizes.padding.buttonMd,
            },
            text: {
                color: semantics.colors.buttons.success.text,
                fontSize: semantics.typography.body.fontSize,
                fontWeight: semantics.typography.label.fontWeight,
            },
        },
        error: {
            container: {
                backgroundColor: semantics.colors.buttons.error.bg,
                borderColor: semantics.colors.buttons.error.border,
                borderWidth: tokens.sizes.borderWidth.thin,
                borderRadius: semantics.sizes.radius.button,
                paddingVertical: semantics.sizes.padding.buttonMd,
            },
            text: {
                color: semantics.colors.buttons.error.text,
                fontSize: semantics.typography.body.fontSize,
                fontWeight: semantics.typography.label.fontWeight,
            },
        },
        disabled: {
            container: {
                backgroundColor: semantics.colors.buttons.disabled.bg,
                borderColor: semantics.colors.buttons.disabled.border,
                borderWidth: tokens.sizes.borderWidth.thin,
                borderRadius: semantics.sizes.radius.button,
                paddingVertical: semantics.sizes.padding.buttonMd,
            },
            text: {
                color: semantics.colors.buttons.disabled.text,
                fontSize: semantics.typography.body.fontSize,
                fontWeight: semantics.typography.label.fontWeight,
            },
        },
    },
    card: {
        container: {
            backgroundColor: semantics.colors.surfaces.elevated,
            borderRadius: semantics.sizes.radius.card,
            borderColor: semantics.colors.borders.disabled,
            borderWidth: tokens.sizes.borderWidth.thin,
            padding: semantics.sizes.padding.card,
            elevation: tokens.elevation.level1,
        },
        title: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.title.fontSize,
            fontWeight: semantics.typography.title.fontWeight,
            lineHeight: semantics.typography.title.lineHeight,
        },
        content: {
            color: semantics.colors.text.secondary,
            fontSize: semantics.typography.body.fontSize,
            lineHeight: semantics.typography.body.lineHeight,
        },
    },
    input: {
        container: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.body.fontSize,
            backgroundColor: semantics.colors.surfaces.base,
            borderRadius: semantics.sizes.radius.input,
            borderColor: semantics.colors.borders.default,
            borderWidth: tokens.sizes.borderWidth.thin,
            padding: tokens.sizes.spacing.md,
        },
        placeholder: {
            color: semantics.colors.text.disabled,
            fontSize: semantics.typography.body.fontSize,
        },
        focusedBorder: {
            borderColor: semantics.colors.borders.focused,
        },
        errorBorder: {
            borderColor: semantics.colors.borders.error,
            borderWidth: tokens.sizes.borderWidth.thick,
        },
    },
    listItem: {
        container: {
            backgroundColor: semantics.colors.surfaces.base,
            padding: tokens.sizes.spacing.md,
        },
        title: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.body.fontSize,
            fontWeight: tokens.typography.fontWeight.medium,
        },
        subtitle: {
            color: semantics.colors.text.secondary,
            fontSize: tokens.typography.fontSize.sm,
        },
        icon: {
            color: semantics.colors.text.secondary,
        },
    },
    modal: {
        overlay: {
            backgroundColor: `${semantics.colors.overlays.backdropColor}${Math.round(
                semantics.colors.overlays.backdropOpacity * 255,
            ).toString(16).padStart(2, '0')}`,
            blur: semantics.colors.overlays.blur,
        },
        container: {
            backgroundColor: semantics.colors.surfaces.elevated,
            borderRadius: semantics.sizes.radius.card,
            padding: semantics.sizes.padding.card,
            elevation: tokens.elevation.level4,
        },
        title: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.title.fontSize,
            fontWeight: semantics.typography.title.fontWeight,
            lineHeight: semantics.typography.title.lineHeight,
        },
        content: {
            color: semantics.colors.text.secondary,
            fontSize: semantics.typography.body.fontSize,
            lineHeight: semantics.typography.body.lineHeight,
        },
    },
    text: {
        title: {
            color: semantics.colors.text.main,
            fontSize: semantics.typography.title.fontSize,
            fontWeight: semantics.typography.title.fontWeight,
            lineHeight: semantics.typography.title.lineHeight,
        },
        subtitle: {
            color: semantics.colors.text.main,
            fontSize: semantics.typography.subtitle.fontSize,
            fontWeight: semantics.typography.subtitle.fontWeight,
            lineHeight: semantics.typography.subtitle.lineHeight,
        },
        body: {
            color: semantics.colors.text.main,
            fontSize: semantics.typography.body.fontSize,
            fontWeight: semantics.typography.body.fontWeight,
            lineHeight: semantics.typography.body.lineHeight,
        },
        label: {
            color: semantics.colors.text.main,
            fontSize: semantics.typography.label.fontSize,
            fontWeight: semantics.typography.label.fontWeight,
        },
    },
});


export const themePreset: ThemePreset = {
    tokens: themePresetTokens,
    semantics: themePresetSemantics,
    components: themePresetComponents,
}

export const darkThemePreset: ThemePreset = {
    tokens: themePresetTokensDark,
    semantics: themePresetSemantics,
    components: themePresetComponents,
}


export const theme: Theme = buildTheme(themePreset);
export const themeDark: Theme = buildTheme(darkThemePreset);


const themes: ThemeContainer = {
    system: {
        light: theme,
        dark: themeDark
    }
};

export default themes;
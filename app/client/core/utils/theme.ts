import { Theme, ThemePreset } from "../types/theme";


export function buildTheme(preset: ThemePreset): Theme {
    const tokens = preset.tokens;
    const semantics = preset.semantics(tokens);
    const components = preset.components({ tokens, semantics });

    return { tokens, semantics, components }
}
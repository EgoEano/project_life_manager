import {
    Platform,
    StyleSheet,
} from 'react-native';
import { Theme } from '../../../core/types/theme';


export const styles = (theme: Theme) => StyleSheet.create({
    root: {
        flex: 1,
        minHeight: 0,
        backgroundColor: theme.tokens.colors.background,
        paddingTop: theme.tokens.sizes.spacing.xs,
    },
    listViewport: {
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
    },
    list: {
        paddingHorizontal: theme.tokens.sizes.spacing.sm,
        paddingBottom: theme.tokens.sizes.spacing.xl * 4,
        gap: theme.tokens.sizes.spacing.md,
    },
    card: {
        borderWidth: theme.tokens.sizes.borderWidth.thin,
        borderColor: theme.tokens.colors.disabled,
        borderRadius: theme.tokens.sizes.radius.lg,
        overflow: "hidden",
        backgroundColor: theme.tokens.colors.surface,
        userSelect: 'none',
    },
    cardSelectedMod: {
        borderColor: theme.tokens.colors.primary,
    },
    cardModMini: {
        height: theme.tokens.sizes.spacing.lg*3,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'flex-start',
    },
    cardContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    cardModDragged: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 12,
        zIndex: 99,
    },
    cardContainerMini: {
        width: "20%",
        alignItems: "center",
        justifyContent: "center",
    },

    cardImageContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    cardImageContainerMini: {
        width: "30%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },

    cardImage: {
        width: "100%",
        height: 240,
    },
    cardImageMini: {
        width: "100%",
        height: "100%",
    },
    cardImageTransparency: {
        opacity: 0.5,
    },
    cardImageSelectedMark: {
        position: "absolute",
        height: 100,
        width: 100,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.tokens.colors.primary,
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRadius: 50,
    },
    cardImageSelectedMarkText: {
        color: theme.tokens.colors.onPrimary,
        fontWeight: "bold",
        fontSize: theme.tokens.typography.fontSize.xl,
    },
    
    cardContent: {
        padding: theme.tokens.sizes.spacing.md,
    },
    cardContentMini: {
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        padding: theme.tokens.sizes.spacing.md,
        alignItems: "center",
        justifyContent: "space-between",
    },
    inputContentMini: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: "flex-end",
        alignItems: 'center',
        paddingRight: theme.tokens.sizes.spacing.md,
        gap: theme.tokens.sizes.spacing.sm,
    },
    inputContentMiniText: {
        minWidth: "10%"
    },
    inputMini: {
        width: theme.tokens.sizes.spacing.xl * 2,
        padding: theme.tokens.sizes.spacing.sm,
    },

    cardHeader: {
        display: 'flex',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardHeaderMini: {
        display: 'flex',
        flexDirection: "row",
        flex: 1, 
        alignItems: "center",
        marginRight: theme.tokens.sizes.spacing.sm, 
    },
    cardTitle: {
        flex: 1,
        flexGrow: 1,
        fontSize: theme.tokens.typography.fontSize.lg,
        color: theme.tokens.colors.secondary,
        fontWeight: theme.tokens.typography.fontWeight.bold,
        ...Platform.select({
            web: { wordBreak: 'break-all' }, 
          }),
    },
    cardTitleMini: {
        flex: 1,
        fontSize: theme.tokens.typography.fontSize.lg,
        color: theme.tokens.colors.secondary,
        fontWeight: theme.tokens.typography.fontWeight.bold,
        ...Platform.select({
            web: { wordBreak: 'break-all' }, 
          }),
    },
    btnMiniViewAction: {
        paddingHorizontal: theme.tokens.sizes.spacing.md,
    },
    
    deleteButton: {
        flex: 1,
        backgroundColor: "transparent",
        borderWidth: 0,
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    deleteText: {
        fontSize: theme.tokens.typography.fontSize.xs,
        letterSpacing: 1,
        color: theme.tokens.colors.error,
    },
    cardDescription: {
        marginTop: theme.tokens.sizes.spacing.sm,
        color: theme.tokens.colors.secondaryVariant,
        lineHeight: theme.tokens.typography.fontSize.lg,
    },
    cardDetails: {
        marginTop: theme.tokens.sizes.spacing.sm,
        color: theme.tokens.colors.secondaryVariant,
        lineHeight: theme.tokens.typography.fontSize.md,
        fontWeight: theme.tokens.typography.fontWeight.regular

    },

    colorsRow: {
        flexDirection: "row",
        marginTop: theme.tokens.sizes.spacing.md,
        gap: theme.tokens.sizes.spacing.sm,
    },
    colorDot: {
        width: theme.tokens.sizes.spacing.lg,
        height: theme.tokens.sizes.spacing.lg,
        borderRadius: 999,
        borderColor: theme.tokens.colors.onSurface,
    },

    fab: {
        position: "absolute",
        right: theme.tokens.sizes.spacing.xl,
        bottom: theme.tokens.sizes.spacing.xl,
        width: theme.tokens.sizes.spacing.xl*2,
        height: theme.tokens.sizes.spacing.xl*2,
        borderRadius: 999,
        backgroundColor: theme.tokens.colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    fabText: {
        color: theme.tokens.colors.onPrimary,
        fontSize: theme.tokens.typography.fontSize.xl,
        fontWeight: theme.tokens.typography.fontWeight.bold,
    },

    inputHalf: {
        width: '50%',
    },
    multiline: {
        minHeight: 110,
        textAlignVertical: "top",
    },

    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: theme.tokens.sizes.spacing.md,
        gap: theme.tokens.sizes.spacing.sm,
    },
    modalImage: {
        width: '100%',
        paddingVertical: 0,
        paddingHorizontal: 0,
        borderWidth: 0,
    },

    formButton: {
        flex: 1,
    },
    transparentButton: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingVertical: 0,
    },
    formButtonText: {
        letterSpacing: 1,
    },
    formContainer: {
        gap: theme.tokens.sizes.spacing.sm,
    },

    squareModalWrap: {
        width: '100%',
    },
    squareModalCard: {
        width: "100%",
        height: "100%",
        padding: 0,
        paddingVertical: theme.tokens.sizes.spacing.lg,
        paddingHorizontal: theme.tokens.sizes.spacing.sm,
        borderRadius: 0,

    },

    //FILTER
    filterRoot: {
        paddingVertical: theme.tokens.sizes.spacing.sm,
        paddingHorizontal: theme.tokens.sizes.spacing.sm,
    },

    //SELECTOR
    selectorRoot: {
        maxHeight: "100%",
        flex: 1,
        justifyContent: 'space-between',
        gap: theme.tokens.sizes.spacing.xs
    },
    squareModalContent: {
        width: "100%",
        flexShrink: 1
    },
    scrollArea: {
        flex: 1,
        flexShrink: 1,
    },
    selectorButtonContainer: {
        flexDirection: 'row',
        width: "100%",
        gap: theme.tokens.sizes.spacing.sm
    },
    tileViewWrapper: {
        borderWidth: 1,
        borderColor: theme.tokens.colors.primary,
        paddingVertical: theme.tokens.sizes.spacing.sm
    },
});

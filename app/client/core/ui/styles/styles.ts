import { StyleSheet } from 'react-native';
import { theme } from '../styles';
import { Theme } from '../../types/theme';

export const globalStyles = StyleSheet.create({
    flexContainer: {
        flex: 1,
    },
    flexCenterContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBar: {
        color: '#00000050',
        backgroundColor: '#00000050',
    },
    backgroundView: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.tokens.colors.background
    }
});

export const navStyles = (theme: Theme) => StyleSheet.create({
    rootLayout: {
        flex: 1,
        height: '100%',
        overflow: 'hidden',
    },
    layoutBody: {
        flex: 1,
    },
    layoutBodyContent: {
        flexGrow: 1,
        paddingVertical: theme.tokens.sizes.spacing.sm,
        paddingHorizontal: theme.tokens.sizes.spacing.sm,
    },

    headerRoot: {
        flexDirection: "row",
        flexGrow: 0,
    },
    headerBtn: {
        borderWidth: 0,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },

    menuLinesContainer: {
        gap: 6
    },
    menuLinesLine: {
        width: 25,
        height: 3,
        backgroundColor: "#fff"
    },

    sidebarModal: { 
        height: "100%",
        alignItems: 'flex-start',
        justifyContent: "center",
    },
    sidebarWrapper: { 
        alignItems: 'flex-start',
    },
    sidebarModalCard: {
        height: "98%",
        width: "100%",
        minWidth: 200,
        maxWidth: 300,
        paddingVertical: theme.tokens.sizes.spacing.md,
        paddingLeft: theme.tokens.sizes.spacing.lg,
        paddingRight: theme.tokens.sizes.spacing.lg * 2,
        marginLeft: theme.tokens.sizes.spacing.md,
        borderRadius: theme.tokens.sizes.radius.md,

    },

    navTreeNode: {
        paddingVertical: theme.tokens.sizes.spacing.sm,
        paddingLeft: theme.tokens.sizes.spacing.md,
        borderRadius: theme.tokens.sizes.radius.md,
    },

    navTreeNodeSelectedMod: {
        backgroundColor: `${theme.tokens.colors.primary}29`,
    },

    placeholerViewRoot: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
});

export const notifStyles = (theme: Theme) => StyleSheet.create({
    // dialog
    confirmModal: {
        minWidth: 200,
    },
    confirmCard: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: theme.tokens.sizes.spacing.md,
    },
    confirmTextArea: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 0,
        flexShrink: 1,
    },
    confirmButtonArea: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    confirmButton: {
        paddingVertical: theme.tokens.sizes.spacing.md,
        paddingHorizontal: theme.tokens.sizes.spacing.lg,
    },

    // notify
    notifyWrapper: {
        position: 'absolute',
        maxWidth: '90%',
        display: 'flex',
        alignItems: 'flex-start',
        left: theme.tokens.sizes.spacing.lg,
        bottom: theme.tokens.sizes.spacing.lg,
        gap: theme.tokens.sizes.spacing.xs,
    },
    notifyCard: {
        display: 'flex',
        flexDirection: 'column',

        paddingVertical: theme.tokens.sizes.spacing.sm,
        paddingHorizontal: theme.tokens.sizes.spacing.md,
        gap: theme.tokens.sizes.spacing.xs,
        
        borderWidth: theme.tokens.sizes.borderWidth.thin,
        borderRadius: theme.tokens.sizes.radius.md,
        borderColor: theme.semantics.colors.borders.default,
        backgroundColor: theme.tokens.colors.background,    
    },
    notifyHeaderText: {
        fontWeight: theme.tokens.typography.fontWeight.bold,
        flexShrink: 1,
    },
    notifyMessageText: {
        fontWeight: theme.tokens.typography.fontWeight.regular,
        flexShrink: 1,
    }
});

export default globalStyles;

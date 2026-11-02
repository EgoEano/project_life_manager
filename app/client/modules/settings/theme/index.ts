import {
    StyleSheet,
} from 'react-native';
import { Theme } from '../../../core/types/theme';

export const styles = (theme: Theme) => StyleSheet.create({
    root: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-start',
        alignContent: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
    },

    rootBckp: { 
        gap: 10,
        paddingVertical: 10,
        flexShrink: 1,
    },
    areaBckp: { 
        display: 'flex', 
        gap: 15, 
    },
    inputHidden: { display: 'none' },
    progressAreaBckp: { 
        width: '100%', 
        backgroundColor: '#eee', 
        borderRadius: '4px' 
    },
    progressBarBckp: { 
        backgroundColor: '#2196F3', 
        height: 10, 
        borderRadius: 4,
    },
    deleteBtn: {
        color: theme.tokens.colors.error,
        fontWeight: theme.tokens.typography.fontWeight.bold
    },

    rootLng: { 
        gap: 10,
    },
    areaLng: { 
        display: 'flex',
        flexDirection: 'row',
        gap: 15, 
    },


    areaThmBtm: { 
        display: 'flex',
        flexDirection: 'row',
    },
    thmBtmL: { 
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        paddingHorizontal: theme.tokens.sizes.spacing.md,
    },
    thmBtmR: { 
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        paddingHorizontal: theme.tokens.sizes.spacing.md,
    },
    haloStyle: {
        shadowColor: theme.tokens.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: theme.tokens.sizes.backdrop.opacity,
        shadowRadius: theme.tokens.sizes.radius.lg * 3,
        elevation: theme.tokens.elevation.level1, 
    },
    themeSelectorTrigger: {
        flex: 1,
        paddingHorizontal: theme.tokens.sizes.spacing.md,
    },
});
import { name as appName } from '../../app.json';
import { enableScreens } from 'react-native-screens';
import {
    AppRegistry,
} from 'react-native';
import { App } from './App';


export default function initMobileApp() {
    enableScreens(true);
    try {
        AppRegistry.registerComponent(appName, () => App);
    } catch (error) {
        console.error("Critical Mobile Bootstrap Error:", error);
    }
}
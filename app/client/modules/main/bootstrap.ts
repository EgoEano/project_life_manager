import { ModuleConfig } from '../../core/types/types';
//import { MainSchema } from './models/main';
import language from './languages';
// import themes from './themes';


export const moduleConfig: ModuleConfig = {
    store: {
        db: {
            isNeedInitDB: false,
            schema: null
        }
    },
    language,
    themes: null,
};

export default async function init() {
}
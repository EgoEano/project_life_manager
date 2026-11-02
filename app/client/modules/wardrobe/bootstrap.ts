import { ModuleConfig } from '../../core/types/types';
import { schema, seed } from './models/wardrobe';
import language from './languages';
// import themes from './themes';


export const moduleConfig: ModuleConfig = {
    store: {
        db: {
            isNeedInitDB: true,
            schema,
            seed
        }
    },
    language,
    themes: null,
};

export default async function init() {
}
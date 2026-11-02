import { ModuleConfig } from '../../core/types/types';
import { schema, seed } from './models/kitchen';
import language from './languages';
import themes from './themes';


export const moduleConfig: ModuleConfig = {
    store: {
        db: {
            isNeedInitDB: true,
            schema,
            seed
        }
    },
    language,
    themes,
};

export default async function init() {
}
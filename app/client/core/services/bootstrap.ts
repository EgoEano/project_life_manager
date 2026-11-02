import { loadModules } from "../../modules/bootstrap";
import { DBConfigSeedData, ModuleDBSchemaBlock } from "../types/types";
import DatabaseLocal from "./storage/dbAdapter";
import getAppConfig from "./utils/appConfigHandler";
import languages from '../ui/locales/languages';
import appThemes from '../ui/styles';


export async function initBootstrap() {
    const modules = await loadModules();

    const applicationDBSchema: ModuleDBSchemaBlock = {};
    const applicationSeedData: DBConfigSeedData = {};
    let shouldInitDB = false;

    // accumulating data
    for (const module of modules) {
        if (!module.moduleConfig) throw new Error ("missing moduleConfig");
        const { store, language, themes } = module.moduleConfig;

        // database
        if (store.db.isNeedInitDB && store.db.schema) {
            shouldInitDB = true;
            Object.assign(applicationDBSchema, module.moduleConfig.store.db.schema);
            if (store.db.seed) {
                for (const [tableName, records] of Object.entries(store.db.seed)) {
                    if (!applicationSeedData[tableName]) applicationSeedData[tableName] = [];

                    applicationSeedData[tableName].push(...records);
                }
            }
        }
        
        // language
        if (language) {
            for (const [langKey, translationPack] of Object.entries(language)) {
                if (!languages[langKey]) languages[langKey] = {};
                Object.assign(languages[langKey], translationPack);
            }
        }

        // themes
        if (themes) {
            for (const [themeKey, themePack] of Object.entries(themes)) {
                if (themes[themeKey]) console.log(`Bootstrap.Themes: Theme key ${themeKey} is already used.`);
                appThemes[themeKey] = themePack;
            }
        }
    }

    // DB init
    if (shouldInitDB) {
        await DatabaseLocal.init({
            databaseName: `${getAppConfig().name}_AppDB`,
            version: 1,
            schema: applicationDBSchema,
            seedData: applicationSeedData,
        });
    }

    for (const module of modules) {
        if (typeof module?.default === 'function')
            await module?.default();
    }
}
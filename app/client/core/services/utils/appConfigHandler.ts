import appConfig from '../../../../app.json';

export type AppConfig = typeof appConfig;
export default function getAppConfig() {
    return appConfig;
}

export function buildConnectionString(input: string) {
    const route = `${(input.startsWith('/') ? '' : '/')}${input}`;
    return `${appConfig.hostUrl}${route}`;
}
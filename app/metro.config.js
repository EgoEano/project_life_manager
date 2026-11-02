const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        blockList: [
            /web_App\.tsx$/,
            /web_Init\.tsx$/,
            /web_Navigation\.tsx$/,
            /webpack\.config\.js$/,
            /public\/.*/,
        ],
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

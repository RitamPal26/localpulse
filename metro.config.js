const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Fix for react-native-css-interop resolution
config.resolver.unstable_enablePackageExports = false;
config.resolver.sourceExts.push('css');
config.transformer.minifierConfig = {
  keep_quotes: true,
};

module.exports = withNativeWind(config, { 
  input: './global.css',
  configPath: './tailwind.config.js' 
});

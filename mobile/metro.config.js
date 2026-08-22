const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase publie des fichiers .cjs que Metro ignore par défaut
config.resolver.sourceExts.push('cjs');

// Force Metro à utiliser le champ "react-native" des paquets plutôt que
// leur carte "exports" — sans ça, il charge la version web de Firebase Auth
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
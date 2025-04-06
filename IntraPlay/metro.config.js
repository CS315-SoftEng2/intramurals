const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@graphql': path.resolve(__dirname, 'graphql'),
  '@': path.resolve(__dirname),
};

module.exports = config;

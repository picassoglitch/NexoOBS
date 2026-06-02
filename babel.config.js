module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // react-native-worklets/plugin is added back when reanimated 4 lands as a
    // dep (must be LAST in plugins[] when re-enabled).
  };
};

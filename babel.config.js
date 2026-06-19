// Babel config for Expo SDK 56.
// - `jsxImportSource: 'nativewind'` enables `className` on RN components.
// - `nativewind/babel` compiles Tailwind classes.
// - The Reanimated/Worklets Babel plugin is auto-injected by `babel-preset-expo`
//   in SDK 56, so it is intentionally NOT listed here.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};

module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      '@babel/preset-typescript',
      [
        'babel-preset-expo',
        {
          'pragma': 'h',
          'pragmaFrag': 'DocumentFragment',
        },
      ],
    ],
  };
};
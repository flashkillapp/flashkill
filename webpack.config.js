const CopyPlugin = require('copy-webpack-plugin');

const backgroundAndCssConfig = {
  entry: [
    './src/features/team-page/background.ts',
    './src/features/match-page/background.ts',
  ],
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
    ],
  },
  output: {
    filename: 'background.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/features/team-page/styles.css', to: 'content/team-page/styles.css' },
        { from: 'src/features/match-page/styles.css', to: 'content/match-page/styles.css' },
      ],
    }),
  ],
};

const contentScripts = [
  'content.ts',
  'team-page/content.ts',
  'match-page/content.ts',
];

const contentScriptConfigs = contentScripts.map(contentScriptPath => {
  const jsFilePath = contentScriptPath.replace('.ts', '.js');
  return {
    entry: './src/features/' + contentScriptPath,
    mode: 'none',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'babel-loader',
        },
        {
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre',
        },
      ],
    },
    output: {
      filename: 'content/' + jsFilePath.replace('content', 'index'),
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
  };
});

module.exports = [
  backgroundAndCssConfig,
  ...contentScriptConfigs,
];

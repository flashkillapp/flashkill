
const backgroundConfig = {
    entry: [
        './src/team-page/maps/background.js',
        './src/team-page/members/background.js',
        './src/team-page/seasons/background.js',
        './src/util/background/fetchCached.js',
    ],
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
        extensions: ['.ts', '.js']
    },
}

const contentScripts = [
    'content.js',
    'team-page/seasons/content.ts',
    'team-page/members/content.js',
];

const contentScriptConfigs = contentScripts.map(contentScriptPath => {
    const jsFilePath = contentScriptPath.replace(".ts", ".js");
    return {
        entry: './src/' + contentScriptPath,
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.js$/,
                    use: ['source-map-loader'],
                    enforce: 'pre',
                }
            ]
        },
        output: {
            filename: 'content/' + jsFilePath,
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
    }
});

const allConfigs = contentScriptConfigs;
allConfigs.push(backgroundConfig);

module.exports = allConfigs;

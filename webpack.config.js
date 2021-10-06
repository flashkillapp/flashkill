
const backgroundConfig = {
    entry: [
        './src/team-page/members/background.ts',
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
        extensions: ['.ts', '.js']
    },
}

const contentScripts = [
    'content.ts',
    'team-page/members/content.ts',
];

const contentScriptConfigs = contentScripts.map(contentScriptPath => {
    const jsFilePath = contentScriptPath.replace('.ts', '.js');
    return {
        entry: './src/' + contentScriptPath,
        mode: 'none',
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
            filename: 'content/' + jsFilePath.replace('content', 'index'),
        },
        resolve: {
            extensions: ['.ts', '.js', '.tsx'],
        },
    }
});

const allConfigs = contentScriptConfigs;
allConfigs.push(backgroundConfig);

module.exports = allConfigs;

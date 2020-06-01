
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

const contentConfig = {
    entry: [
        './src/team-page/members/content.js',
        './src/team-page/seasons/content.ts',
    ],
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
        filename: 'content.js',
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
}

module.exports = [ backgroundConfig, contentConfig ];


const backgroundConfig = {
    entry: [
        './src/scripts/team-page/maps/background.js',
        './src/scripts/team-page/matches/background.js',
        './src/scripts/team-page/members/background.js',
        './src/scripts/team-page/seasons/background.js',
        './src/scripts/util/background/fetchCached.js',
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
        './src/scripts/team-page/maps/content.js',
        './src/scripts/team-page/members/content.js',
        './src/scripts/team-page/seasons/content.ts',
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

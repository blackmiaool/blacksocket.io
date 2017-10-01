const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const path = require('path');
const watch = process.argv.indexOf('--watch') !== -1;
if (watch) {
    require('./test/server')
}
module.exports = [{
    entry: {
        "blacksocket": './src/client.js',
        "blacksocket.min": './src/client.js',
    },
    output: {
        path: path.resolve(__dirname, './client/'),
        filename: '[name].js',
        libraryTarget: 'umd',

    },
    externals: { ws: 'ws' },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    },
    plugins: [
        new UglifyJSPlugin({
            include: /\.min\.js$/,
            minimize: true
        })
    ],
}, {
    entry: './test/client/index.js',
    output: {
        path: path.resolve(__dirname, './dist/test/client'),
        filename: 'index.test.js'
    },
    externals: { ws: 'ws' },
    module: {
        loaders: [

        ]
    },
}]
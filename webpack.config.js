const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './test/client/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: './test/client/index.test.js'
    },
}
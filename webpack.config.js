const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './test/client/index.js',
    output: {
        path: path.resolve(__dirname, './dist/test/client'),
        filename: 'index.test.js'
    },
    watch:true
}
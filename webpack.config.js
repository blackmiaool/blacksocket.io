const webpack = require("webpack");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const path = require("path");
const watch = process.argv.indexOf("--watch") !== -1;
if (watch) {
    require("./test/server");
}
module.exports = [
    {
        entry: {
            blacksocket: "./lib/client.js",
            "blacksocket.min": "./lib/client.js"
        },
        output: {
            path: path.resolve(path.join(__dirname, "client")),
            filename: "[name].js",
            library: "io",
            libraryTarget: "umd"
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"]
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["env"]
                        }
                    }
                },
                {
                    test: /\.tsx?$/,
                    loader: "awesome-typescript-loader"
                }
            ]
        },
        plugins: [
            new UglifyJSPlugin({
                include: /\.min\.js$/,
                minimize: true
            }),
            new webpack.IgnorePlugin(/ws/)
        ]
    }
];

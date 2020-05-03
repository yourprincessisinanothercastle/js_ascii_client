const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const merge = require('webpack-merge');

module.exports = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.ya?ml$/,
                use: 'yaml-loader',
                type: 'json' // Required by Webpack v4
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', 'yaml'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new CopyPlugin([
            {from: 'static', to: 'static'},
            {from: 'index.html', to: 'index.html'}
        ],)
    ]
};


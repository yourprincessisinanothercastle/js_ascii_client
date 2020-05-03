const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');

module.exports = merge(baseConfig, {
      plugins: [
        new CopyPlugin([
            {from: 'static', to: 'static'},
            {from: 'index.html', to: 'index.html'}
        ],),
        new Dotenv({
            path: './.env.prod',
            silent: false
        })
    ],
});



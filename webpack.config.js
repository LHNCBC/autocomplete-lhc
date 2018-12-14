const webpack = require('webpack');
function commonConfig() {
  return {
  /*
    node: {
      fs: "empty"
    },
    */
    entry: './source/index.js',
    output: {
      path: __dirname,
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          // exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env',
                {
                  "targets": {
                    "browsers": "ie >= 10"
                  }
                }
              ]]
            }
          }
        }
      ]
    }/*,
    plugins: [
      // Make jQuery avaiable
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
        "window.$": "jquery"
      })
    ]*/
  }
}

let configs = [];

let nonMinConfig = commonConfig();
nonMinConfig.output.filename = './dist/latest/autocomplete-lhc.js';
nonMinConfig.mode = 'none';
configs.push(nonMinConfig);

let minConfig = commonConfig();
minConfig.output.filename = './dist/latest/autocomplete-lhc.min.js'
minConfig.mode = 'production';
configs.push(minConfig);

module.exports = configs;

const path = require('path');

module.exports = {
  entry: './src/tilt.js',
  mode: 'production',
  devtool: '',
  output: {
    library: 'tilt',
    libraryTarget: 'window',
    path: path.resolve(__dirname, 'dist'),
    filename: 'tilt.min.js'
  }
};
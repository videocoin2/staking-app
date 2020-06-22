/* eslint-disable */
const path = require('path');
const {
  useEslintRc,
  override,
  addBabelPlugin,
  addWebpackAlias,
} = require('customize-cra');

module.exports = override(
  useEslintRc(),
  addBabelPlugin('react-hot-loader/babel'),
  addWebpackAlias({
    react: path.resolve('./node_modules/react'),
    'react-dom': '@hot-loader/react-dom',
  })
);

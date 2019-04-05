import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

const plugins = [
  resolve({
    modulesOnly: true,
  }),
  babel({
    exclude: 'node_modules/**'
  })
];

module.exports = [{
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins,
}, {
  input: 'src/register.js',
  output: {
    file: 'dist/register.js',
    format: 'cjs'
  },
  plugins,
}];
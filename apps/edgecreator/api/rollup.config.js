import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import tscAlias from 'rollup-plugin-tsc-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import esmShim from '@rollup/plugin-esm-shim';

export default commandLineArgs => ({
  input: 'dist/apps/edgecreator/api/index.js',
  output: {
    file: 'dist/bundle.js',
  },
  plugins: [resolve(), typescript(),tscAlias(), commonjs(), json(),esmShim()],
});
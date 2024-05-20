import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import tscAlias from 'rollup-plugin-tsc-alias';
export default commandLineArgs => ({
  input: commandLineArgs.input,
  output: {
    file: commandLineArgs.output,
    format: 'cjs',
  },
  plugins: [resolve(), typescript(),tscAlias({
    commandLineArgs: {
        configFile: String(commandLineArgs.input).replace('index.ts', 'tsconfig.json')
    }
  })],
});
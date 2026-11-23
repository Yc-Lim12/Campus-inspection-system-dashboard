import * as esbuild from 'esbuild';
await esbuild.build({ entryPoints: ['src/main.jsx'], bundle: true, minify: true, outdir: 'dist', loader: { '.js': 'jsx' }, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'warning', target: 'es2019' });

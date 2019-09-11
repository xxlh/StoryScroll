const fs = require('fs');
const { rollup } = require('rollup');
const { minify } = require('uglify-js');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const pretty = require('pretty-bytes');
const sizer = require('gzip-size');
const pkg = require('./package');

const date = new Date();

const banner = `/*
 * ${ pkg.name }.js v${ pkg.version }
 * (c) ${ date.getFullYear() } Little Linghuan & Esone
 * Released under the GPL license
 * ieexx.com
 */
`;

console.info('Compiling... 😤');

var external = [...Object.keys(pkg.dependencies), 'gsap/TweenMax'];
external.splice(external.indexOf('gsap'), 1);
external.splice(external.indexOf('judgebrowser'), 1);

rollup({
  input: 'src/StoryScroll.js',
  external: ['./pixi.js', 'gsap/TweenMax'],
  plugins: [
    babel({
      exclude: 'node_modules/**' // ?????????
    }),
    resolve(),
    commonjs()
  ]
}).then(bun => {
  bun.write({
    banner,
    format: 'cjs',
    file: pkg.main
  });

  bun.write({
    banner,
    format: 'es',
    file: pkg.module
  });

  bun.write({
    banner,
    file: pkg.umd,
    format: 'umd',
    name: pkg['umd:name']
  }).then(_ => {
    const data = fs.readFileSync(pkg.umd, 'utf8');

    // produce minified output
    const { code } = minify(data);
    fs.writeFileSync(pkg.umd, `${banner}\n${code}`); // with banner

    // output gzip size
    const int = sizer.sync(code);
    console.info('Compilation was a success! 👍');
    console.info(`~> gzip size: ${ pretty(int) }`);
  }).catch(console.error);
}).catch(console.error);

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
 * ${ pkg.name } v${ pkg.version }
 * (c) ${ date.getFullYear() } Little Linghuan & Esone
 * Released under the GPL license
 * ieexx.com
 */
`;

const external = [...Object.keys(pkg.dependencies), 'gsap/TweenMax'];
external.splice(external.indexOf('gsap'), 1);
external.splice(external.indexOf('judgebrowser'), 1);


console.info('Compiling... 😤');

// pixi.js
rollup({
  input: 'src/pixi.js',
  external: external,
  plugins: [
    commonjs()
  ]
}).then(bun => {
  bun.write({
    banner,
    format: 'cjs',
    file: 'lib/pixi.js'
  });
});

// StoryScroll.js
rollup({
  input: 'src/StoryScroll.js',
  external: ['./pixi.js', 'gsap/TweenMax', 'pixi.js'],
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
    console.info('👍 Main js compilation was a success! ');
    console.info(`~> gzip size: ${ pretty(int) }`);
  }).catch(console.error);
}).catch(console.error);

// story-projection.js
rollup({
  input: 'src/story-projection.js',
  external: ['storyscroll', 'pixi.js', 'pixi-projection'],
  plugins: [
    commonjs()
  ]
}).then(bun => {
  bun.write({
    banner,
    format: 'cjs',
    file: 'lib/story-projection.js'
  });
  bun.write({
    banner,
    format: 'umd',
    file: 'lib/story-projection.min.js',
    name: pkg['umd:name'] + '-Projection'
  }).then(_ => {
    const data = fs.readFileSync('lib/story-projection.min.js', 'utf8');
    const { code } = minify(data);
    fs.writeFileSync('lib/story-projection.min.js', `${banner}\n${code}`);
    console.info('👍 story-projection compilation was a success! ');
  }).catch(console.error);
}).catch(console.error);

// story-action.js
rollup({
	input: 'src/story-action.js',
	external: ['storyscroll', 'gsap/TweenMax', 'src/StoryScroll.js'],
	plugins: [
	  commonjs()
	]
}).then(bun => {
	bun.write({
	  banner,
	  format: 'cjs',
	  file: 'lib/story-action.js'
	});
	bun.write({
		banner,
		format: 'umd',
		file: 'lib/story-action.min.js',
		name: pkg['umd:name'] + '-Action'
	}).then(_ => {
		const data = fs.readFileSync('lib/story-action.min.js', 'utf8');
		const { code } = minify(data);
		fs.writeFileSync('lib/story-action.min.js', `${banner}\n${code}`);
		console.info('👍 story-action compilation was a success! ');
	}).catch(console.error);
}).catch(console.error);

/*
 * storyscroll v3.4.0
 * (c) 2019 Little Linghuan & Esone
 * Released under the GPL license
 * ieexx.com
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var constants = require('@pixi/constants');
var math = require('@pixi/math');
var runner = require('@pixi/runner');
var settings = require('@pixi/settings');
var ticker = require('@pixi/ticker');
var utils = require('@pixi/utils');
var display = require('@pixi/display');
var core = require('@pixi/core');
var loaders = require('@pixi/loaders');
var sprite = require('@pixi/sprite');
var app = require('@pixi/app');
var graphics = require('@pixi/graphics');
var spriteAnimated = require('@pixi/sprite-animated');
var spritesheet = require('@pixi/spritesheet');
var text = require('@pixi/text');
var interaction = require('@pixi/interaction');

core.Renderer.registerPlugin('batch', core.BatchRenderer);
core.Renderer.registerPlugin('interaction', interaction.InteractionManager);
app.Application.registerPlugin(loaders.AppLoaderPlugin);
app.Application.registerPlugin(ticker.TickerPlugin);
loaders.Loader.registerPlugin(spritesheet.SpritesheetLoader);

Object.keys(constants).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return constants[k];
		}
	});
});
Object.keys(math).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return math[k];
		}
	});
});
Object.keys(runner).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return runner[k];
		}
	});
});
Object.keys(settings).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return settings[k];
		}
	});
});
Object.keys(ticker).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return ticker[k];
		}
	});
});
Object.keys(display).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return display[k];
		}
	});
});
Object.keys(core).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return core[k];
		}
	});
});
Object.keys(loaders).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return loaders[k];
		}
	});
});
Object.keys(sprite).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return sprite[k];
		}
	});
});
Object.keys(app).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return app[k];
		}
	});
});
Object.keys(graphics).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return graphics[k];
		}
	});
});
Object.keys(spriteAnimated).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return spriteAnimated[k];
		}
	});
});
Object.keys(spritesheet).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return spritesheet[k];
		}
	});
});
Object.keys(text).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return text[k];
		}
	});
});
exports.utils = utils;
exports.interaction = interaction;

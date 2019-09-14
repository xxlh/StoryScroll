/*
 * storyscroll v3.1.0
 * (c) 2019 Little Linghuan & Esone
 * Released under the GPL license
 * ieexx.com
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var StoryScroll = _interopDefault(require('storyscroll'));
var PIXI = require('pixi.js');

var storyProjection = (() => {
	global.PIXI = PIXI;
	require("pixi-projection");
	// require("../../../app/js/index.trees")
	StoryScroll.prototype.sprite2d = (imgsrc, o) => {
console.log('sprite2d111');

	};
	// console.log(prj);
	
})();

module.exports = storyProjection;

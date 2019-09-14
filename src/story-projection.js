import StoryScroll from 'storyscroll'
import * as PIXI from 'pixi.js';
global.PIXI = PIXI;
require("pixi-projection");

export default (() => {
	StoryScroll.prototype.sprite2d = (imgsrc, o) => {
		console.log('sprite2d111');

	}

	return global.PIXI.projection;
})()
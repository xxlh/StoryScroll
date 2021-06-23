/*
 * storyscroll v3.7.0
 * (c) 2021 Little Linghuan & Esone
 * Released under the GPL license
 * ieexx.com
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var StoryScroll = _interopDefault(require('storyscroll'));
var PIXI = require('pixi.js');

global.PIXI = PIXI;
require("pixi-projection");


let chapter2d = (() => {
	StoryScroll.prototype.chapter2d = function(o, _parent) {
        let chapter2d = new global.PIXI.projection.Container2d();
		this._setProps(chapter2d, o);
		this._setChapterChildren(chapter2d);
        this._setActions(chapter2d);
		this._ship(chapter2d, _parent);
        return chapter2d; 
	};
	
	const originSetChapterChildrenFunc = StoryScroll.prototype._setChapterChildren;
	StoryScroll.prototype._setChapterChildren = function(chapter){
		originSetChapterChildrenFunc.call(this, chapter);
		chapter.sprite2d = (imgsrc, o, _parent) => this.sprite2d(imgsrc, o, chapter);
		chapter.chapter2d = (o) => this.chapter(o, chapter);
	};

	return StoryScroll.prototype.chapter2d;
})();


let sprite2d = (() => {
	StoryScroll.prototype.sprite2d = function(imgsrc, o, _parent) {
		const sprite2d = new global.PIXI.projection.Sprite2d(PIXI.Texture.from(imgsrc));
		if (typeof o.affine=='string') { sprite2d.proj.affine = global.PIXI.projection.AFFINE[ o.affine.toUpperCase() ]; delete o.affine; }
		if (o.x || o.y) { sprite2d.position.set(o.x||0, o.y||0); delete o.x; delete o.y; }
		this._setProps(sprite2d, o);
        this._setActions(sprite2d);
		this._ship(sprite2d, _parent);
        return sprite2d;
	};

	return StoryScroll.prototype.sprite2d;
})();


var storyProjection = global.PIXI.projection;

exports.chapter2d = chapter2d;
exports.default = storyProjection;
exports.sprite2d = sprite2d;

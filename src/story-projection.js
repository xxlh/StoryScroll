import StoryScroll from 'storyscroll'
import * as PIXI from 'pixi.js';
global.PIXI = PIXI;
require("pixi-projection");


export let chapter2d = (() => {
	StoryScroll.prototype.chapter2d = function(o, _parent) {
        let chapter2d = new global.PIXI.projection.Container2d();
		this._setProps(chapter2d, o);
		this._setChapterChildren(chapter2d);
        this._setActions(chapter2d);
		this._ship(chapter2d, _parent);
        return chapter2d; 
	}
	
	const originSetChapterChildrenFunc = StoryScroll.prototype._setChapterChildren;
	StoryScroll.prototype._setChapterChildren = function(chapter){
		originSetChapterChildrenFunc.call(this, chapter);
		chapter.sprite2d = (imgsrc, o, _parent) => this.sprite2d(imgsrc, o, chapter);
		chapter.chapter2d = (o) => this.chapter(o, chapter);
	}

	return StoryScroll.prototype.chapter2d;
})()


export let sprite2d = (() => {
	StoryScroll.prototype.sprite2d = function(imgsrc, o, _parent) {
		const sprite2d = new global.PIXI.projection.Sprite2d(PIXI.Texture.from(imgsrc));
		if (typeof o.affine=='string') { sprite2d.proj.affine = global.PIXI.projection.AFFINE[ o.affine.toUpperCase() ]; delete o.affine }
		if (o.x || o.y) { sprite2d.position.set(o.x||0, o.y||0); delete o.x; delete o.y }
		this._setProps(sprite2d, o);
        this._setActions(sprite2d);
		this._ship(sprite2d, _parent);
        return sprite2d;
	}

	return StoryScroll.prototype.sprite2d;
})()


export default global.PIXI.projection;
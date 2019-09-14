import StoryScroll from 'storyscroll'
import * as PIXI from 'pixi.js';
global.PIXI = PIXI;
require("pixi-projection");

export default (() => {
	StoryScroll.prototype.chapter2d = function(o, _parent) {
        let chapter2d = new PIXI.projection.Container2d();
        chapter2d.sprite2d = (imgsrc) => this.sprite2d(imgsrc, o, chapter2d);
		this._setProps(chapter2d, o);
        this._setActions(chapter2d);
		if (_parent) _parent.addChild(chapter2d);
		else this.containerScroll.addChild(chapter2d);
        return chapter2d; 
	}
	
	StoryScroll.prototype.sprite2d = function(imgsrc, o, _parent) {
		const sprite2d = new PIXI.projection.Sprite2d(PIXI.Texture.from(imgsrc));
		sprite2d.proj.affine = PIXI.projection.AFFINE[typeof o.affine=='string'?o.affine.toUpperCase():'NONE'];
		delete o.affine;
		if (o.x && o.y) { sprite2d.position.set(o.x, o.y); delete o.x; delete o.y }
		this._setProps(sprite2d, o);
        this._setActions(sprite2d);
		if (_parent) _parent.addChild(sprite2d);
		else this.containerScroll.addChild(sprite2d);
        return sprite2d;
	}
	
	return global.PIXI.projection;
})()
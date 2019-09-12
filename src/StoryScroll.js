import * as PIXI from 'pixi.js';
import * as browser from "./browser";
import {TweenMax} from "gsap/TweenMax";
import Scroller from './Scroller';

global.PIXI = PIXI;
require("pixi-projection");

class StoryScroll {
	designWidth;
	designLength;
	contentWidth;	// Scaled Design With
	contentLength;	// Scaled Design Length
	viewWidth;		// First View Width = Content Width (No Crop)
	viewLength;		// First View Length = deviceHeight/(deviceWidth/designWidth)
	deviceWidth;	// Phsical device width
	deviceHeight;	// Phsical device height
	maxScroll = 10000;
	storyPosition = 0;

	constructor(o) {
		this._defaultSetting(o);
		this._createContainer(o);
		window.onresize = () => this._windowResize();
		this._windowResize();
	}

	chapter(o, _parent) {
		let chapter = new PIXI.Container();
		this._setProps(chapter, o);
		chapter.sprite = (imgsrc, o) => this.sprite(imgsrc, o, chapter);
		chapter.spriteAnimated = (imgsrcs, o, autoPlay) => this.spriteAnimated(imgsrcs, o, autoPlay, chapter);
		chapter.graphic = (o) => this.graphic(o, chapter);
		chapter.text = (textCont, o, style_o) => this.text(textCont, o, style_o, chapter);
		chapter.chapter = (o) => this.chapter(o, chapter);
		this._setActions(chapter);
		if (_parent) _parent.addChild(chapter);
		else this.containerScroll.addChild(chapter);
		return chapter; 
	}

	sprite(imgsrc, o, _parent) {
		let sprite = this._createSprite(imgsrc, o);
		this._setActions(sprite);
		if (_parent) _parent.addChild(sprite);
		else this.containerScroll.addChild(sprite);
		return sprite;
	};

	spriteAnimated(imgsrcs, o, autoPlay, _parent) {
		let sprite = this._createAnimatedSprite(imgsrcs, o, autoPlay);
		this._setActions(sprite);
		if (_parent) _parent.addChild(sprite);
		else this.containerScroll.addChild(sprite);
		if (autoPlay !== false) sprite.play();
		return sprite;
	}

	graphic(o, _parent) {
		let graphic = new PIXI.Graphics();
        this._setProps(graphic, o);
		this._setActions(graphic);
		if (_parent) _parent.addChild(graphic);
		else this.containerScroll.addChild(graphic);
		return graphic;
	}

	text(textCont, o, style_o,_parent) {
		let style = new PIXI.TextStyle();
		this._setProps(style, style_o);
		let text = new PIXI.Text(textCont,style);
		this._setProps(text, o);
		this._setActions(text);
		if (_parent) _parent.addChild(text);
		else this.containerScroll.addChild(text);
		return text;
	};

	act(obj, props, duration, triggerPosition) {
		if (triggerPosition === undefined) triggerPosition = this._getSpriteTriggerPosition(obj);
		if (!obj.actions) obj.actions = {};

		for (const prop in props) {
			if (typeof props[prop] == 'object' && obj[prop]) {
				let hash = this._createHash(8);
				obj.actions[hash] = {action: {type:'point', propsRoot:prop, props:props[prop], duration, triggerPosition}};
				this.actions.push({sprite:obj, hash, ...obj.actions[hash].action});
				delete props[prop];
			}
		}

		let hash = this._createHash(8);
		obj.actions[hash] = {action: {type:'point', props, duration, triggerPosition}};
		this.actions.push({sprite:obj, hash, ...obj.actions[hash].action});
		return obj;
	}

	actByStep(obj, props, section, triggerPosition) {
		if (triggerPosition === undefined) triggerPosition = this._getSpriteTriggerPosition(obj);
		if (!obj.actions) obj.actions = {};
		let hash = this._createHash(8);
		obj.actions[hash] = {action: {type:'section', props, section, triggerPosition}};
		this.actions.push({sprite:obj, hash, ...obj.actions[hash].action});
		return obj;
	}

	setPin(obj, triggerPosition, section) {
		if (!obj.actions) obj.actions = {};
		let hash = this._createHash();
		obj.actions[hash] = {action:{type:'pin', section, triggerPosition}};
		this.actions.push({sprite:obj, hash, ...obj.actions[hash].action});
		return obj;
	}

	stop(){
		this.scrollDirection == 'y' ? this.scroller.options.scrollingY = false : this.scroller.options.scrollingX = false;
	}
	play(){
		this.scrollDirection == 'y' ? this.scroller.options.scrollingY = true : this.scroller.options.scrollingX = true;
	}
	
	_scrollerCallback(left, top, zoom){
		this.scrollPosition = this._getSrollPosition(left, top);
		this.storyPosition = this.scrollPosition / this._scale;
		this.scrollDirection == 'y' ? this.containerScroll.y = -this.storyPosition : this.containerScroll.x = -this.storyPosition;

		// Act
		this.actions.forEach(action => {
			if (action.type == 'point') {
				triggerActionByPosition.call(this, action);
			} else if (action.type == 'section') {
				triggerActionByStep.call(this, action);
			} else if(action.type == 'pin') {
				triggerActionSetPin.call(this, action);
			}
		});

		if (this.debug) {
			if (this.debug == 'all') {
				console.log('top:', top)
				console.log('left:', left)
				console.log('scrollPosition :', this.scrollPosition );
			}
			console.log('storyPosition :', this.storyPosition );
		}


		function triggerActionByPosition(action) {
			let storedAction = action.sprite.actions[action.hash];
			if (this.storyPosition >= action.triggerPosition) {
				if (storedAction.status != 'acting' && storedAction.status != 'done') {
					let tweenTarget = action.propsRoot ? action.sprite[action.propsRoot] : action.sprite;
					let tweenVars = {...action.props};
					tweenVars.onComplete = function(){storedAction.status = 'done'; action.props.onComplete&&action.props.onComplete.call(this)};
					tweenVars.onReverseComplete = function(){storedAction.status = 'reversed'; action.props.onReverseComplete&&action.props.onReverseComplete.call(this)}
					let tweenInstance = TweenMax.to(tweenTarget, action.duration, tweenVars);
					storedAction.tween = tweenInstance;
					storedAction.status = 'acting';
				}
			} else if(action.props.reverse !== false){
				// 倒带
				if (storedAction.status == 'acting' || storedAction.status == 'done') {
					if (storedAction.tween) {
						storedAction.status = 'reversing';
						storedAction.tween.reverse();
					}
				}
			}
		}
		function triggerActionByStep(action) {
			let storedAction = action.sprite.actions[action.hash];
			if ( action.triggerPosition <= this.storyPosition && this.storyPosition < action.triggerPosition + action.section) {
				setProps('during', storedAction, action, this.storyPosition);
			} else if (this.storyPosition >= action.triggerPosition + action.section) {
				// 强制达到最终态
				setProps('after', storedAction, action, this.storyPosition);
			} else if (this.storyPosition < action.triggerPosition) {
				// 强制回复最终态
				setProps('before', storedAction, action, this.storyPosition);
			}
			// ToDo: before, after在多个动画区间bug，after>storyPosition 且 < 下一个区间的triggerPosition

			// 区间最小值, 区间最大值, top, 初始位置, 终点, 速度, 方向
			function _scrollNum(minNum,maxNum,top,start,end) {
				return start + ((top - minNum)/(maxNum - minNum)*(end-start));
			}
			function setProps(positionStatus, storedAction, action, storyPosition) {
				positionStatus = positionStatus || 'before';
				storedAction.originProps = storedAction.originProps || {};
				for (var prop in action.props) {
					if (typeof action.props[prop] == 'object') {
						for (var subprop in action.props[prop]) {
							if (storedAction.originProps[prop] === undefined) storedAction.originProps[prop] = {};
							if (storedAction.originProps[prop][subprop] === undefined) storedAction.originProps[prop][subprop] = action.sprite[prop][subprop];
							if (positionStatus == 'before') {
								action.sprite[prop][subprop] = storedAction.originProps[prop][subprop];
							} else if (positionStatus == 'after') {
								action.sprite[prop][subprop] = action.props[prop][subprop];
							} else {
								action.sprite[prop][subprop] = _scrollNum(action.triggerPosition, action.triggerPosition + action.section, storyPosition, storedAction.originProps[prop][subprop], action.props[prop][subprop]);
							}
						}
					} else {
						if (storedAction.originProps[prop] === undefined) storedAction.originProps[prop] = action.sprite[prop];
						if (positionStatus == 'before') {
							action.sprite[prop] = storedAction.originProps[prop];
						} else if (positionStatus == 'after') {
							action.sprite[prop] = action.props[prop];
						} else {
							action.sprite[prop] = _scrollNum(action.triggerPosition, action.triggerPosition + action.section, storyPosition, storedAction.originProps[prop], action.props[prop]);
						}
					}
				}
			}
		}
		function triggerActionSetPin(action) {
			let storedAction = action.sprite.actions[action.hash];
			storedAction.originProps = storedAction.originProps || {};
			if (storedAction.originProps[this.scrollDirection] === undefined) 
			storedAction.originProps[this.scrollDirection] = action.sprite[this.scrollDirection];

			action.sprite[this.scrollDirection] = storedAction.originProps[this.scrollDirection] - action.triggerPosition + this.storyPosition;
		}
	}
	
	_defaultSetting(o) {
		// Parameters
		this.scrollDirection = o.direction || 'y';
		this.designWidth = o.width || 750;
		this.designLength = o.length || 10000;
		this.debug = o.debug || false;
		this.containerSelector = o.container;

		// init
		this._clientWidth = document.documentElement.clientWidth || window.innerWidth;
		this._clientHeight = document.documentElement.clientHeight || window.innerHeight;
		this.designOrientation = this.scrollDirection == 'y' ? 'portrait' : 'landscape'
		this.actions = [];
		this.loaderList = [];
		
		this.scroller = new Scroller((left, top, zoom) => this._scrollerCallback(left, top, zoom), {
			zooming: false,
			animating: true,
			bouncing: false,
			animationDuration: 1000
		});
		this.scroller.__enableScrollY = true;
		this.storyPosition = 0;

		let mousedown = false;
		document.addEventListener("touchstart", (e) => {
			this.scroller.doTouchStart(e.touches, e.timeStamp);
			mousedown = true;
		}, false);

		document.addEventListener("touchmove", (e) => {
			if (!mousedown) {
				return;
			}
			this.scroller.doTouchMove(e.touches, e.timeStamp);
			mousedown = true;
		}, false);

		document.addEventListener("touchend", (e) => {
			if (!mousedown) {
				return;
			}
			this.scroller.doTouchEnd(e.timeStamp);
			mousedown = false;
		}, false);
	};

	_createContainer(o) {
		this.app = new PIXI.Application( {width: this._clientWidth, height: this._clientHeight, backgroundColor : o.backgroundColor, antialias: true});
		
		if(this.containerSelector === undefined){
			const main = document.body.appendChild(document.createElement('main'));
			main.appendChild(this.app.view);
		}else{
			document.querySelector(this.containerSelector).appendChild(this.app.view);
		}

		this.containerFitWindow = new PIXI.Container();
		this.containerFitWindow.pivot.set(0, 0);
		this.containerScroll = new PIXI.Container();
		this.containerScroll.name = 'story';
		this.containerFitWindow.addChild(this.containerScroll);
		this.app.stage.addChild(this.containerFitWindow);
	}
	
	_windowResize() {
		this.deviceOrientation = this._getDeviceOrientation();
		this.deviceWidth = this.deviceOrientation == 'portrait' ?	this._clientWidth		: this._clientHeight;
		this.deviceHeight = this.deviceOrientation == 'portrait' ?	this._clientHeight	: this._clientWidth;

		this._scalePrev = this._scale;
		this._scale = this.deviceWidth / this.designWidth;
		this.maxScroll = this.designLength - this.deviceHeight

		this.contentWidth = this.deviceWidth;
		this.contentLength = this.designLength * this._scale;

		this.viewWidth = this.designWidth;
		this.viewLength = this.deviceHeight / this._scale;

		this._setContainerRotation(this.containerFitWindow, this.designOrientation, this.deviceOrientation, this.deviceWidth);
		this.containerFitWindow.scale.set(this._scale, this._scale);
		this.app.renderer.resize(this._clientWidth, this._clientHeight);

		let scrollerContentWidth = this.deviceOrientation == 'portrait' ?	this.deviceWidth	: this.contentLength;
		let scrollerContentHeight = this.deviceOrientation == 'portrait' ?	this.contentLength	: this.deviceWidth;
		let scrollerLeft = this.deviceOrientation == 'portrait' ? 0 : this.scrollPosition/this._scalePrev*this._scale||0;
		let scrollerTop = this.deviceOrientation !== 'portrait' ? 0 : this.scrollPosition/this._scalePrev*this._scale||0;

		setTimeout(() => {
			this.scroller.setDimensions(this._clientWidth, this._clientHeight, scrollerContentWidth, scrollerContentHeight);
			this.scroller.scrollTo(scrollerLeft, scrollerTop, false);
		},200)
	}

	_getDeviceOrientation() {
		this._clientWidth = document.documentElement.clientWidth || window.innerWidth;
		this._clientHeight = document.documentElement.clientHeight || window.innerHeight;

		if (browser.weixin) {
			// ToTest: 测试好像现在微信不需要特别判断了？
			if (window.orientation === 180 || window.orientation === 0) {
				return 'portrait';
			} else if (window.orientation === 90 || window.orientation === -90) {
				return 'landscape';
			}
		} else {
			return this._clientWidth < this._clientHeight ? 'portrait' : 'landscape';
		}
	}

	_setContainerRotation(container, designOrientation, deviceOrientation, deviceWidth) {
		const rotationMap = {
			design_portrait: {
				device_portrait: {
					rotation: 0,
					offsetX: 0,
					offsetY: 0
				},
				device_landscape: {
					rotation: - Math.PI / 2,
					offsetX: 0,
					offsetY: deviceWidth
				}
			},
			design_landscape: {
				device_portrait: {
					rotation: Math.PI / 2,
					offsetX: deviceWidth,
					offsetY: 0
				},
				device_landscape: {
					rotation: 0,
					offsetX: 0,
					offsetY: 0
				}
			}
		}
		container.rotation = rotationMap[ 'design_'+designOrientation ] [ 'device_'+deviceOrientation ] ['rotation'];
		container.position.set(
			rotationMap[ 'design_'+designOrientation ] [ 'device_'+deviceOrientation ] ['offsetX'],
			rotationMap[ 'design_'+designOrientation ] [ 'device_'+deviceOrientation ] ['offsetY']
		);
	}

	_getSpriteTriggerPosition(sprite) {
		let spritePosition = this.scrollDirection == 'x' ? sprite.x : sprite.y;
		if (sprite.parent && sprite.parent.name != 'story') return spritePosition + this._getSpriteTriggerPosition(sprite.parent);
		return spritePosition - this.pageHeight * 2/3;
	}

	_getSrollPosition(left, top) {
		let positionMapFunctionGenerator = (left, top) => {
			let positionMap = {
				'design_portrait': {
					'device_portrait': {
						'x': left,
						'y': top
					},
					'device_landscape': {
						'x': top,
						'y': left
					}
				},
				'design_landscape': {
					'device_portrait': {
						'x': top,
						'y': left
					},
					'device_landscape': {
						'x': left,
						'y': top
					}
				}
			}
			return (designOrientation, deviceOrientation, scrollDirection) => {
				return positionMap ['design_'+designOrientation] ['device_'+deviceOrientation] [scrollDirection];
			};
		}

		const getPositionFromMap = positionMapFunctionGenerator(left, top);
		return getPositionFromMap(this.designOrientation, this.deviceOrientation, this.scrollDirection);
	}
	
	_createSprite(imgsrc, opt){
        var newSprite = new PIXI.Sprite.from(imgsrc);
        this._setProps(newSprite, opt);
		// this.loaderList.push(imgsrc);
        return newSprite;
	}
	
	_createAnimatedSprite(imgsrcs, o, autoPlay) {
		let textures = [];
		let AnimatedSpriteInstance = new PIXI.AnimatedSprite([PIXI.Texture.EMPTY]);
		if (typeof imgsrcs == 'object' && imgsrcs.length > 0) {
			imgsrcs.forEach(imgsrc => {
				textures.push(PIXI.Texture.from(imgsrc));
			});
			AnimatedSpriteInstance.textures = textures;
		} else {
			this.app.loader
			.add('spritesheet', imgsrcs)
			.load((loader, resources) => {
				for (const imgkey in resources.spritesheet.data.frames) {
					const texture = PIXI.Texture.from(imgkey);
					const time = resources.spritesheet.data.frames[imgkey].duration;
					textures.push(time? {texture, time} : texture);
				}
				AnimatedSpriteInstance.textures = textures;
				if (autoPlay !== false) AnimatedSpriteInstance.play();
			});
		}
		this._setProps(AnimatedSpriteInstance, o);
		return AnimatedSpriteInstance;
	}

	_setActions(obj) {
		const Self = this;
		obj.act = (props, duration, triggerPosition) => Self.act(obj, props, duration, triggerPosition);
		obj.actByStep = (props, section, triggerPosition) => Self.actByStep(obj, props, section, triggerPosition);
		obj.setPin = (triggerPosition, section) => Self.setPin(obj, triggerPosition, section);
	}

	_setProps(sprite, props) {
		if (props) {
            for (const prop in props) {
                if (props.hasOwnProperty(prop)) {
                    sprite[prop] = props[prop];
                }
            }
		}
		return sprite;
	}

	_createHash (hashLength) {
		return Array.from(Array(Number(hashLength) || 24), () => Math.floor(Math.random() * 36).toString(36)).join('');
	}
}

export default StoryScroll;
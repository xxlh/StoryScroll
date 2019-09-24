// import * as PIXI from './pixi.js';
import * as PIXI from 'pixi.js';
import * as browser from "./browser";
import Scroller from './Scroller';
import { objectTypeIndexer } from '@babel/types';


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
	prevPool = [];
	stagePool = [];
	nextPool = [];
	currZIndex =1;

	constructor(o) {
		this._defaultSetting(o||{});
		this._createContainer(o);
		this._windowResize();
		window.addEventListener('resize', this._windowResize.bind(this), false);
	}

	chapter(o, _parent) {
		let chapter = new PIXI.Container();
		this._setProps(chapter, o);
		this._setChapterChildren(chapter);
		this._setActions(chapter);
		this._ship(chapter, _parent);
		// if (_parent) _parent.addChild(chapter);
		// else this.containerScroll.addChild(chapter);
		return chapter;
	}

	sprite(imgsrc, o, _parent) {
		let sprite = this._createSprite(imgsrc);
        this._setProps(sprite, o);
		this._setActions(sprite);
		this._ship(sprite, _parent);
		return sprite;
	};
	_ship(obj, _parent) {
		if (_parent) {
			_parent.addChild(obj);
		} else if (!this.progressive) {
			this.containerScroll.addChild(obj);
		} else {
			// Todo: zIndex
			obj.zIndex = this.currZIndex++;
			// Todo: order list

			this.nextPool.push(obj);
			this.nextPool.sort(function(a, b){return a.x - b.x});
			
			// init stagePool
			if(obj.x < 2*this.viewLength) {
				this.stagePool.push(obj);
				this.stagePool.sort(function(a, b){return a.zIndex - b.zIndex});
			}
			
		}
	}
	init(){
		this.stagePool.forEach(obj => {
			// this.containerScroll.addChildAt(obj ,obj.zIndex);
		});
	}
	spriteAnimated(imgsrcs, o, autoPlay, _parent) {
		let sprite = this._createAnimatedSprite(imgsrcs, autoPlay);
		this._setProps(sprite, o);
		this._setActions(sprite);
		this._ship(sprite, _parent);
		// if (_parent) _parent.addChild(sprite);
		// else this.containerScroll.addChild(sprite);
		if (autoPlay !== false) sprite.play();
		return sprite;
	}

	graphic(o, _parent) {
		let graphic = new PIXI.Graphics();
        this._setProps(graphic, o);
		this._setActions(graphic);
		this._ship(graphic, _parent);
		// if (_parent) _parent.addChild(graphic);
		// else this.containerScroll.addChild(graphic);
		return graphic;
	}

	text(textCont, o, style_o, _parent) {
		let style = new PIXI.TextStyle();
		this._setProps(style, style_o);
		let text = new PIXI.Text(textCont, style);
		this._setProps(text, o);
		this._setActions(text);
		this._ship(text, _parent);
		if (_parent) _parent.addChild(text);
		else this.containerScroll.addChild(text);
		return text;
	};

	actionByStep(obj, props, section, triggerPosition) {
		if (triggerPosition === undefined) triggerPosition = this._getSpriteTriggerPosition(obj);
		if (!obj.actions) obj.actions = {};
		let hash = this._createHash(8);
		obj.actions[hash] = {action: {type:'section', props, section, triggerPosition}};
		this.sectionActions.push({sprite:obj, hash, ...obj.actions[hash].action});
		return obj;
	}

	setPin(obj, triggerPosition, section) {
		if (!obj.actions) obj.actions = {};
		let hash = this._createHash(8);
		obj.actions[hash] = {action:{type:'pin', section, triggerPosition}};
		this.pinActions.push({sprite:obj, hash, ...obj.actions[hash].action});
		return obj;
	}

	stop(){
		this.scroller.options.scrollingX = false;
		this.scroller.options.scrollingY = false;
	}
	play(){
		this.scroller.options.scrollingX = true;
		this.scroller.options.scrollingY = true;
	}
	
	_scrollerCallback(left, top, zoom){
		this.scrollPosition = this._getSrollPosition(left, top);
		this.storyPosition = this.scrollPosition / this._scale;
		this.scrollDirection == 'y' ? this.containerScroll.y = -this.storyPosition : this.containerScroll.x = -this.storyPosition;
		
		// Get Stage
		// goonStage.call(this);
		// recallStage.call(this);
		// leaveStage.call(this);
		// getoutStage.call(this);

		// Run Actions
		// Todo: filter unstage sprites
		this.sectionActions.forEach(action => {
			triggerActionByStep.call(this, action);
		});
		this.pinActions.forEach(action => {
			triggerActionSetPin.call(this, action);
		});

		if (this.debug) {
			if (this.debug == 'all') {
				console.log('top:', top)
				console.log('left:', left)
				console.log('scrollPosition :', this.scrollPosition );
			}
			else console.log('scrollPosition :', this.scrollPosition );
		}

	
		function goonStage(){
			if (this.nextPool.length == 0) return;
			if (this.nextPool[0][this.scrollDirection] < this.storyPosition + 0.5*this.viewLength) {
				this.containerScroll.addChildAt(this.nextPool[0],this.nextPool[0].zIndex);
				this.stagePool.push(this.nextPool.shift());
				goonStage.call(this);
			}
		}		
		function recallStage(){
			if (this.prevPool.length == 0) return;
			if (this.prevPool[this.prevPool.length-1][this.scrollDirection] > this.storyPosition - 0.2*this.viewLength) {
				this.containerScroll.addChildAt(this.prevPool[this.prevPool.length-1],this.prevPool[this.prevPool.length-1].zIndex);
				this.stagePool.unshift(this.prevPool.pop());
				recallStage.call(this);
			}
		}
		function leaveStage(){
			if (this.stagePool.length == 0) return;
			if (this.stagePool[0][this.scrollDirection] < this.storyPosition + 0.5*this.viewLength) {
				this.containerScroll.removeChild(this.stagePool[0]);
				this.prevPool.push(this.stagePool.shift());
				leaveStage.call(this);
			}
		}
		function getoutStage(){
			if (this.stagePool.length == 0) return;
			if (this.stagePool[this.stagePool.length-1][this.scrollDirection] > this.storyPosition - 0.2*this.viewLength) {
				this.containerScroll.removeChild(this.stagePool[this.stagePool.length-1]);
				this.nextPool.unshift(this.stagePool.pop());
				getoutStage.call(this);
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
		this.containerSelector = o.container;
		this.backgroundColor = o.bgcolor;
		this.useLoader = o.loader || false;
		this.progressive = o.progressive || false;
		this.antialias = o.antialias || false;
		this.debug = o.debug || false;

		// init
		this._clientWidth = window.innerWidth || document.documentElement.clientWidth;
		this._clientHeight = window.innerHeight || document.documentElement.clientHeight;
		this.designOrientation = this.scrollDirection == 'y' ? 'portrait' : 'landscape'
		this.pinActions = [];
		this.sectionActions = [];
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
		this.app = new PIXI.Application( {backgroundColor : this.backgroundColor, antialias: this.antialias, resolution: 1});
		this.loader = this.app.loader;
		this.load = this.app.loader.load;
		this.loader.on("complete", loader => this.useLoader = false);
		
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
		this.app.view.style.transformOrigin = "0 0";
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

		if (this.antialias) {
			this._setContainerRotation(this.containerFitWindow, this.designOrientation, this.deviceOrientation, this.deviceWidth/this._scale);
			this.app.view.style.transform = "scale("+this._scale+")";
			this.app.renderer.resize(this._clientWidth/this._scale, this._clientHeight/this._scale);
		} else {
			this._setContainerRotation(this.containerFitWindow, this.designOrientation, this.deviceOrientation, this.deviceWidth);
			this.containerFitWindow.scale.set(this._scale, this._scale);
			this.app.renderer.resize(this._clientWidth, this._clientHeight);
		}

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
		if (browser.weixin) {
			this._clientWidth = document.documentElement.clientWidth || window.innerWidth;
			this._clientHeight = document.documentElement.clientHeight || window.innerHeight;
			// ToTest: 测试好像现在微信不需要特别判断了？
			if (window.orientation === 180 || window.orientation === 0) {
				return 'portrait';
			} else if (window.orientation === 90 || window.orientation === -90) {
				return 'landscape';
			}
		} else {
			this._clientWidth = window.innerWidth || document.documentElement.clientWidth;
			this._clientHeight = window.innerHeight || document.documentElement.clientHeight;
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

	_getCommonProps(obj, props) {
		let commonProps = {};
		for (const prop in props) {
			if (!obj[prop] && typeof props[prop] != 'function') commonProps[prop] = props[prop];
		}
		return commonProps;
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
	
	_createSprite(imgsrc){
		var spriteInstance = new PIXI.Sprite.from(PIXI.Texture.EMPTY);
		const loader = new PIXI.Loader();
		if (!this.useLoader) {
			spriteInstance.texture = PIXI.Texture.from(imgsrc);
		} else if (this.loader.resources[imgsrc]) {
			this.loader.on("complete", (loader, resources) => spriteInstance.texture = resources[imgsrc].texture);
		} else {
			this.loader.add(imgsrc, resource => spriteInstance.texture = resource.texture);
		}
		// this.loaderList.push(imgsrc);
        return spriteInstance;
	}
	
	_createAnimatedSprite(imgsrcs, autoPlay) {
		let textures = [];
		let animatedSpriteInstance = new PIXI.AnimatedSprite([PIXI.Texture.EMPTY]);
		if (typeof imgsrcs == 'object' && imgsrcs.length > 0) {
			if(!this.useLoader){
				imgsrcs.forEach(imgsrc => {
					textures.push(PIXI.Texture.from(imgsrc));
				});
				animatedSpriteInstance.textures = textures;
			}else{
				imgsrcs.forEach(imgsrc => {
					if (!this.loader.resources[imgsrc]) this.loader.add(imgsrc);
				});

				this.loader.on("complete", loader => {
					imgsrcs.forEach(imgsrc => {
						textures.push(loader.resources[imgsrc].texture);
					});
					animatedSpriteInstance.textures = textures;
					if (autoPlay !== false) animatedSpriteInstance.play();
				});
			}
		} else {
			if(!this.loader.resources[imgsrcs]) this.app.loader.add(imgsrcs);
			
			this.loader.on("complete", loader => {
				for (const imgkey in this.loader.resources[imgsrcs].data.frames) {
					const texture = PIXI.Texture.from(imgkey);
					const time = this.loader.resources[imgsrcs].data.frames[imgkey].duration;
					textures.push(time? {texture, time} : texture);
				}
				animatedSpriteInstance.textures = textures;
				if (autoPlay !== false) animatedSpriteInstance.play();
			});
		}
		return animatedSpriteInstance;
	}

	_setActions(obj) {
		obj.actionByStep = (props, section, triggerPosition) => this.actionByStep(obj, props, section, triggerPosition);
		obj.setPin = (triggerPosition, section) => this.setPin(obj, triggerPosition, section);
	}

	_setChapterChildren(chapter){
		chapter.sprite = (imgsrc, o) => this.sprite(imgsrc, o, chapter);
		chapter.spriteAnimated = (imgsrcs, o, autoPlay) => this.spriteAnimated(imgsrcs, o, autoPlay, chapter);
		chapter.graphic = (o) => this.graphic(o, chapter);
		chapter.text = (textCont, o, style_o) => this.text(textCont, o, style_o, chapter);
		chapter.chapter = (o) => this.chapter(o, chapter);
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
// import * as PIXI from './pixi.js';
import * as PIXI from 'pixi.js';
import * as browser from "./browser";
import Scroller from './Scroller';


class StoryScroll {
	STAGE_BOUNDARY = 3; 	// Stage Length = viewLength * STAGE_BOUNDARY

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
	stagePoolByLen = [];
	stageZIndexes = {};
	nextPool = [];
	currentZIndex = 0;

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
		return chapter;
	}

	sprite(imgsrc, o, _parent) {
		let sprite = this._createSprite(imgsrc);
        this._setProps(sprite, o);
		this._setActions(sprite);
		this._ship(sprite, _parent);
		return sprite;
	};
	spriteVideo(videoUrl, o, _parent) {
		let sprite = this.sprite(videoUrl, o, _parent);
		sprite.play = function(){
			sprite.texture.baseTexture.resource.source.play()
		}
		sprite.pause= function(){
			sprite.texture.baseTexture.resource.source.pause()
		}

		if(o.hasVideoButton!== false){
			let videoButton = this.graphic({o,...{x: o.x + (o.width-100)/2, y:o.y + (o.height - 100)/2,  alpha:1,}}, _parent);
			videoButton.beginFill(0x0, 0.5)
			.drawRoundedRect(0, 0, 100, 100, 50)
			.endFill()
			.beginFill(0xffffff)
			.moveTo(36, 30)
			.lineTo(36, 70)
			.lineTo(70, 50);
			videoButton.interactive = true;
			videoButton.buttonMode = true;
			videoButton.on('pointertap', toggleVideo);

			sprite.interactive = true;
			sprite.buttonMode = true;
			sprite.on('pointertap', toggleVideo);

			sprite.isPlay = false;
			function toggleVideo() {
				if(sprite.isPlay){
					sprite.pause();
					videoButton.alpha = 1
				}else{
					sprite.play();
					videoButton.alpha = 0
				}
				sprite.isPlay = !sprite.isPlay
			}
		}

		return sprite;
	};
	spriteAnimated(imgsrcs, o, autoPlay, _parent) {
		let sprite = this._createAnimatedSprite(imgsrcs, autoPlay);
		this._setProps(sprite, o);
		this._setActions(sprite);
		this._ship(sprite, _parent);
		console.log(sprite)
		if (autoPlay !== false) {
			sprite.play()
		}else{
			sprite.playByStep = (props, section, triggerPosition) => this.playByStep(sprite, props, section, triggerPosition);
		};
		return sprite;
	}

	graphic(o, _parent) {
		let graphic = new PIXI.Graphics();
        this._setProps(graphic, o);
		this._setActions(graphic);
		this._ship(graphic, _parent);
		return graphic;
	}

	text(textCont, o, style_o, _parent) {
		let style = new PIXI.TextStyle();
		this._setProps(style, style_o);
		let text = new PIXI.Text(textCont, style);
		this._setProps(text, o);
		this._setActions(text);
		this._ship(text, _parent);
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
	playByStep(obj, fromto, section, triggerPosition) {
		if (triggerPosition === undefined) triggerPosition = this._getSpriteTriggerPosition(obj);
		if (!obj.actions) obj.actions = {};
		let hash = this._createHash(8);
		obj.actions[hash] = {action: {type:'animatePlay', fromto, section, triggerPosition}};
		this.sectionAnimations.push({sprite:obj, hash, ...obj.actions[hash].action});
		return obj;
	}
	setPin(obj, triggerPosition, section) {
		if (!obj.actions) obj.actions = {};
		if (!section) section = this.maxScroll + this.viewLength - obj[this.scrollDirection];
		obj.pinSection = section;
		let hash = this._createHash(8);
		obj.actions[hash] = {action:{type:'pin', section, triggerPosition}};
		this.pinActions.push({sprite:obj, hash, ...obj.actions[hash].action});
		return obj;
	}

	stop(){
		// Todo: bug when resize window
		this.scroller.options.scrollingX = false;
		this.scroller.options.scrollingY = false;
	}
	play(){
		// Todo: support auto play
		// Todo: support auto play by pressing screen
		this.scroller.options.scrollingX = true;
		this.scroller.options.scrollingY = true;
	}
	
	scrollTo(left, top){
		let scrollerLeft = this.deviceOrientation == 'portrait' ? 0 : left  ||0;
		let scrollerTop = this.deviceOrientation !== 'portrait' ? 0 : top ||0;
		this.scroller.scrollTo(scrollerLeft, scrollerTop, false);
	}
	restLenght(lenght){
		this.designLength = lenght
		
		this._windowResize();
	}
	_scrollerCallback(left, top, zoom){
		const Self = this;
		this.scrollPosition = this._getSrollPosition(left, top);
		this.storyPosition = this.scrollPosition / this._scale;
		this.scrollDirection == 'y' ? this.containerScroll.y = -this.storyPosition : this.containerScroll.x = -this.storyPosition;
		
		// Get Stage
		if (this.progressive) {
			goonStage.call(this);
			leaveStage.call(this);
			recallStage.call(this);
			pulldownStage.call(this);
		}

		// Run Actions
		this.sectionActions.forEach(action => {
			triggerActionByStep.call(this, action);
		});
		this.pinActions.forEach(action => {
			triggerActionSetPin.call(this, action);
		});
		this.sectionAnimations.forEach(action => {
			triggerAnimatePlayByStep.call(this, action);
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
			if (this.nextPool[0][this.scrollDirection] < this.storyPosition + this.viewLength + (this.STAGE_BOUNDARY-1)/2*this.viewLength) {
				let comingObj = this.nextPool.shift();
				this.containerScroll.addChild(comingObj);
				this.stageZIndexes[comingObj.zIndex] = true;
				this.stagePool.push(comingObj);
				this.stagePoolByLen.push(comingObj);
				this.stagePoolByLen.sort((a, b) => (a[this.scrollDirection] + a[ this.scrollDirection?'width':'height' ]) - (b[this.scrollDirection] + b[ this.scrollDirection?'width':'height' ]));
				_recoverPausedRepeatAction(comingObj);
				goonStage.call(this);
			}
		}
		function leaveStage(){
			_delFrontUnstaged(this.stagePoolByLen);
			if (this.stagePoolByLen.length == 0) return;
			if (this.stagePoolByLen[0][this.scrollDirection] + _getStageObjWidth(this.stagePoolByLen[0]) < this.storyPosition - (this.STAGE_BOUNDARY-1)/2*this.viewLength) {
				const leavingObj = this.stagePoolByLen.shift();
				this.containerScroll.removeChild(leavingObj);
				delete this.stageZIndexes[leavingObj.zIndex];
				this.prevPool.push(leavingObj);
				_pauseRepeatAction(leavingObj);
				leaveStage.call(this);
			}

			function _delFrontUnstaged(pool) {
				if (pool.length == 0) return;
				if (_isOnStage(pool[0])) return;
				pool.shift();
				_delFrontUnstaged(pool);
			}
		}
		function recallStage(){
			if (this.prevPool.length == 0) return;
			if (this.prevPool[this.prevPool.length-1][this.scrollDirection] + _getStageObjWidth(this.prevPool[this.prevPool.length-1]) > this.storyPosition - (this.STAGE_BOUNDARY-1)/2*this.viewLength) {
				let comingObj = this.prevPool.pop();
				this.containerScroll.addChild(comingObj);
				this.stageZIndexes[comingObj.zIndex] = true;
				this.stagePoolByLen.unshift(comingObj);
				this.stagePool.unshift(comingObj);
				this.stagePool.sort((a, b) => a[this.scrollDirection] - b[this.scrollDirection]);
				_recoverPausedRepeatAction(comingObj);
				recallStage.call(this);
			}
		}
		function pulldownStage(){
			_delBehindUnstaged(this.stagePool);
			if (this.stagePool.length == 0) return;
			if (this.stagePool[this.stagePool.length-1][this.scrollDirection] > this.storyPosition + this.viewLength + (this.STAGE_BOUNDARY-1)/2*this.viewLength) {
				const leavingObj = this.stagePool.pop();
				this.containerScroll.removeChild(leavingObj);
				delete this.stageZIndexes[leavingObj.zIndex];
				this.nextPool.unshift(leavingObj);
				_pauseRepeatAction(leavingObj);
				pulldownStage.call(this);
			}

			function _delBehindUnstaged(pool) {
				if (pool.length == 0) return;
				if (_isOnStage(pool[pool.length-1])) return;
				pool.shift();
				_delBehindUnstaged(pool);
			}
		}
		function _getStageObjWidth(obj) {
			let leavingObjWidth = obj[ Self.scrollDirection?'width':'height' ];
			if (obj.pinSection) leavingObjWidth += obj.pinSection;
			return leavingObjWidth;
		}
		function _pauseRepeatAction(obj) {
				if (obj.tweens) obj.tweens.forEach(tween => {
					tween.pausedAtLeaving = tween.paused();
					if (!tween.pausedAtLeaving) tween.pause();
				});
		}
		function _recoverPausedRepeatAction(obj) {
				if (obj.tweens) obj.tweens.forEach(tween => {
					if (!tween.pausedAtLeaving) tween.play();
				});
		}
		function _isOnStage(obj) {
			if (!Self.progressive) return true;
			if (Self.stageZIndexes[ obj.zIndex ]) return true;
			return false;
		}

		function triggerActionByStep(action) {
			if (action.sprite._destroyed) return;
			if (!_isOnStage(action.sprite)) return;
			
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
			function _getMidstate(minNum,maxNum,top,start,end) {
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
								action.sprite[prop][subprop] = _getMidstate(action.triggerPosition, action.triggerPosition + action.section, storyPosition, storedAction.originProps[prop][subprop], action.props[prop][subprop]);
							}
						}
					} else {
						if (storedAction.originProps[prop] === undefined) storedAction.originProps[prop] = action.sprite[prop];
						if (positionStatus == 'before') {
							action.sprite[prop] = storedAction.originProps[prop];
						} else if (positionStatus == 'after') {
							action.sprite[prop] = action.props[prop];
						} else {
							action.sprite[prop] = _getMidstate(action.triggerPosition, action.triggerPosition + action.section, storyPosition, storedAction.originProps[prop], action.props[prop]);
						}
					}
				}
			}
		}
		function triggerActionSetPin(action) {
			if (action.sprite._destroyed) return;
			if (!_isOnStage(action.sprite)) return;

			let storedAction = action.sprite.actions[action.hash];
			storedAction.originProps = storedAction.originProps || {};
			if (storedAction.originProps[this.scrollDirection] === undefined) 
			storedAction.originProps[this.scrollDirection] = action.sprite[this.scrollDirection];

			action.sprite[this.scrollDirection] = storedAction.originProps[this.scrollDirection] - action.triggerPosition + this.storyPosition;
		}

		function triggerAnimatePlayByStep(action) {
			if (action.sprite._destroyed) return;
			if (!_isOnStage(action.sprite)) return;

			let storedAction = action.sprite.actions[action.hash];
			if ( action.triggerPosition <= this.storyPosition && this.storyPosition < action.triggerPosition + action.section) {
				let midstate = _getMidstate(action.triggerPosition, action.triggerPosition + action.section, this.storyPosition, action.fromto.from, action.fromto.to);
				if (midstate != storedAction.current) goto(action.sprite, midstate, storedAction);
			} else if (this.storyPosition >= action.triggerPosition + action.section) {
				// 强制达到最终态
				goto(action.sprite, action.fromto.to, storedAction);
			} else if (this.storyPosition < action.triggerPosition) {
				// 强制回复最终态
				goto(action.sprite, action.fromto.from, storedAction);
			}
			function _getMidstate(minNum,maxNum,top,from,to) {
				return from + Math.floor((top - minNum) / (maxNum - minNum)*(to-from))
			}
			function goto(sprite, frame, storedAction) {
				sprite.gotoAndStop(frame);
				storedAction.current = frame;
			}
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
		this.actionDelaysOnLoaded = o.delay || 500;
		this.loaded = false;
		this.progressive = o.progressive || false;
		this.antialias = o.antialias || false;
		this.debug = o.debug || false;

		// init
		this._clientWidth = window.innerWidth || document.documentElement.clientWidth;
		this._clientHeight = window.innerHeight || document.documentElement.clientHeight;
		this.designOrientation = this.scrollDirection == 'y' ? 'portrait' : 'landscape'
		this.pinActions = [];
		this.sectionActions = [];
		this.sectionAnimations =[];
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
		this.load = () => this.app.loader.load.call(this.app.loader);
		this.loader.onComplete.add(loader => this.loaded = true);
		
		if(this.containerSelector === undefined){
			const main = document.body.appendChild(document.createElement('main'));
			main.appendChild(this.app.view);
		}else{
			document.querySelector(this.containerSelector).appendChild(this.app.view);
			document.querySelector(this.containerSelector).style.overflow = 'hidden';
		}

		this.containerFitWindow = new PIXI.Container();
		this.containerFitWindow.pivot.set(0, 0);
		this.containerScroll = new PIXI.Container();
		this.containerScroll.name = 'story';
		if (this.progressive) this.containerScroll.sortableChildren=true;
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
		console.log(this.designLength)
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
			// Todo: enableX Y scroll
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
		} else if (browser.weibo) {
			this._clientWidth = document.documentElement.clientWidth || window.innerWidth;
			this._clientHeight = document.documentElement.clientHeight || window.innerHeight;
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
		let spriteInstance = new PIXI.Sprite.from(PIXI.Texture.EMPTY);
		let isVideo = /\.(mp4|mpg|avi|mkv|flv)$/.test(imgsrc)
		spriteInstance.isVideo = false;
		if (!this.useLoader || this.loaded || isVideo) {
			spriteInstance.texture = PIXI.Texture.from(imgsrc);
			spriteInstance.isVideo = !spriteInstance.isVideo;
		} else if (this.loader.resources[imgsrc]) {
			this.loader.onComplete.add((loader, resources) => spriteInstance.texture = resources[imgsrc].texture);
		} else {
			this.loader.add(imgsrc, resource => spriteInstance.texture = resource.texture);
		}
		// this.loaderList.push(imgsrc);
        return spriteInstance;
	}
	_createAnimatedSprite(imgsrcs, autoPlay) {
		let animatedSpriteInstance = new PIXI.AnimatedSprite([PIXI.Texture.EMPTY]);
		if (typeof imgsrcs == 'object' && imgsrcs.length > 0) {
			let textures = [];
			if(!this.useLoader || this.loaded){
				imgsrcs.forEach(imgsrc => {
					textures.push(PIXI.Texture.from(imgsrc));
				});
				animatedSpriteInstance.textures = textures;
			}else{
				imgsrcs.forEach(imgsrc => {
					if (!this.loader.resources[imgsrc]) this.loader.add(imgsrc);
				});

				this.loader.onComplete.add(loader => {
					imgsrcs.forEach(imgsrc => {
						textures.push(loader.resources[imgsrc].texture);
					});
					animatedSpriteInstance.textures = textures;
					if (autoPlay !== false) animatedSpriteInstance.play();
				});
			}
		} else {
			if (!this.useLoader || this.loaded) {
				const loader = new PIXI.Loader();
				loader.add(imgsrcs).load((loader, resources) => setAnimatedSpriteTextures(animatedSpriteInstance, resources[imgsrcs], autoPlay));
			}else{
				if(!this.loader.resources[imgsrcs]) {
					this.app.loader.add(imgsrcs, resource => setAnimatedSpriteTextures(animatedSpriteInstance, resource, autoPlay));
				} else {
					this.loader.onComplete.add((loader, resources) => setAnimatedSpriteTextures(animatedSpriteInstance, resources[imgsrcs], autoPlay));
				}
			}

			function setAnimatedSpriteTextures(animatedSpriteInstance, resource, autoPlay) {
				let textures = [];
				for (const imgkey in resource.data.frames) {
					const texture = PIXI.Texture.from(imgkey);
					const time = resource.data.frames[imgkey].duration;
					textures.push(time? {texture, time} : texture);
				}
				animatedSpriteInstance.textures = textures;
				if (autoPlay !== false) animatedSpriteInstance.play();
			}
		}
		return animatedSpriteInstance;
	}

	_setProps(obj, props) {
		if (props) {
            for (const prop in props) {
                if (props.hasOwnProperty(prop)) {
                    obj[prop] = props[prop];
                }
            }
		}
		obj.zIndex = this.currentZIndex++;
		return obj;
	}

	_setChapterChildren(chapter){
		chapter.sprite = (imgsrc, o) => this.sprite(imgsrc, o, chapter);
		chapter.spriteVideo = (videoUrl, o) => this.spriteVideo(videoUrl, o, chapter);
		chapter.spriteAnimated = (imgsrcs, o, autoPlay) => this.spriteAnimated(imgsrcs, o, autoPlay, chapter);
		chapter.graphic = (o) => this.graphic(o, chapter);
		chapter.text = (textCont, o, style_o) => this.text(textCont, o, style_o, chapter);
		chapter.chapter = (o) => this.chapter(o, chapter);
	}

	_setActions(obj) {
		obj.actionByStep = (props, section, triggerPosition) => this.actionByStep(obj, props, section, triggerPosition);
		obj.setPin = (triggerPosition, section) => this.setPin(obj, triggerPosition, section);
	}

	_ship(obj, _parent) {
		if (_parent) {
			_parent.addChild(obj);
		} else if (!this.progressive) {
			this.containerScroll.addChild(obj);
		} else {
			this.nextPool.push(obj);
			this.nextPool.sort((a, b) => a[this.scrollDirection] - b[this.scrollDirection]);
		}
	}

	_createHash (hashLength) {
		return Array.from(Array(Number(hashLength) || 24), () => Math.floor(Math.random() * 36).toString(36)).join('');
	}
}

export default StoryScroll;
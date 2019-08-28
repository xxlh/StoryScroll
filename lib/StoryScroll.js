(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'pixi.js', 'judgebrowser', 'mathjs', 'gsap/TweenMax', './Scroller'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('pixi.js'), require('judgebrowser'), require('mathjs'), require('gsap/TweenMax'), require('./Scroller'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.pixi, global.judgebrowser, global.mathjs, global.TweenMax, global.Scroller);
		global.StoryScroll = mod.exports;
	}
})(this, function (exports, _pixi, _judgebrowser, _mathjs, _TweenMax, _Scroller) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var PIXI = _interopRequireWildcard(_pixi);

	var browser = _interopRequireWildcard(_judgebrowser);

	var _mathjs2 = _interopRequireDefault(_mathjs);

	var _Scroller2 = _interopRequireDefault(_Scroller);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	var _extends = Object.assign || function (target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];

			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}

		return target;
	};

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
		return typeof obj;
	} : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}

		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

	var StoryScroll = function () {
		function StoryScroll(o) {
			var _this = this;

			_classCallCheck(this, StoryScroll);

			this._defaultSetting(o);
			this._createContainer(o);
			window.onresize = function (e) {
				return _this._windowResize();
			};
			this._windowResize();
		}

		_createClass(StoryScroll, [{
			key: 'chapter',
			value: function chapter(o, _parent) {
				var _this2 = this;

				var chapter = new PIXI.Container();
				this._setProps(chapter, o);
				chapter.sprite = function (imgsrc, o) {
					return _this2.sprite(imgsrc, o, chapter);
				};
				chapter.spriteAnimated = function (imgsrcs, o, autoPlay) {
					return _this2.spriteAnimated(imgsrcs, o, autoPlay, chapter);
				};
				chapter.graphic = function (o) {
					return _this2.graphic(o, chapter);
				};
				chapter.chapter = function (o) {
					return _this2.chapter(o, chapter);
				};
				this._setActions(chapter);
				if (_parent) _parent.addChild(chapter);else this.containerScroll.addChild(chapter);
				return chapter;
			}
		}, {
			key: 'sprite',
			value: function sprite(imgsrc, o, _parent) {
				var sprite = this._createSprite(imgsrc, o);
				this._setActions(sprite);
				if (_parent) _parent.addChild(sprite);else this.containerScroll.addChild(sprite);
				return sprite;
			}
		}, {
			key: '_createSprite',
			value: function _createSprite(imgsrc, opt) {
				var newSprite = new PIXI.Sprite.from(imgsrc);
				this._setProps(newSprite, opt);
				// this.loaderList.push(imgsrc);
				return newSprite;
			}
		}, {
			key: 'spriteAnimated',
			value: function spriteAnimated(imgsrcs, o, autoPlay, _parent) {
				var sprite = this._createAnimatedSprite(imgsrcs, o, autoPlay);
				this._setActions(sprite);
				if (_parent) _parent.addChild(sprite);else this.containerScroll.addChild(sprite);
				if (autoPlay !== false) sprite.play();
				return sprite;
			}
		}, {
			key: '_createAnimatedSprite',
			value: function _createAnimatedSprite(imgsrcs, o, autoPlay) {
				var textures = [];
				var AnimatedSpriteInstance = new PIXI.AnimatedSprite([PIXI.Texture.EMPTY]);
				if ((typeof imgsrcs === 'undefined' ? 'undefined' : _typeof(imgsrcs)) == 'object' && imgsrcs.length > 0) {
					imgsrcs.forEach(function (imgsrc) {
						textures.push(PIXI.Texture.from(imgsrc));
					});
					AnimatedSpriteInstance.textures = textures;
				} else {
					this.app.loader.add('spritesheet', imgsrcs).load(function (loader, resources) {
						for (var imgkey in resources.spritesheet.data.frames) {
							var texture = PIXI.Texture.from(imgkey);
							var time = resources.spritesheet.data.frames[imgkey].duration;
							textures.push(time ? { texture: texture, time: time } : texture);
						}
						AnimatedSpriteInstance.textures = textures;
						if (autoPlay !== false) AnimatedSpriteInstance.play();
					});
				}
				this._setProps(AnimatedSpriteInstance, o);
				return AnimatedSpriteInstance;
			}
		}, {
			key: '_setProps',
			value: function _setProps(sprite, props) {
				if (props) {
					for (var prop in props) {
						if (props.hasOwnProperty(prop)) {
							sprite[prop] = props[prop];
						}
					}
				}
				return sprite;
			}
		}, {
			key: 'graphic',
			value: function graphic(o, _parent) {
				var graphic = new PIXI.Graphics();
				this._setProps(graphic, o);
				this._setActions(graphic);
				if (_parent) _parent.addChild(graphic);else this.containerScroll.addChild(graphic);
				return graphic;
			}
		}, {
			key: '_setActions',
			value: function _setActions(obj) {
				var Self = this;
				obj.act = function (props, duration, triggerPosition) {
					return Self.act(obj, props, duration, triggerPosition);
				};
				obj.actByStep = function (props, section, triggerPosition) {
					return Self.actByStep(obj, props, section, triggerPosition);
				};
				obj.setPin = function (triggerPosition, section) {
					return Self.setPin(obj, triggerPosition, section);
				};
			}
		}, {
			key: 'act',
			value: function act(obj, props, duration, triggerPosition) {
				if (triggerPosition === undefined) triggerPosition = this._getSpriteTriggerPosition(obj);
				if (!obj.actions) obj.actions = {};
				var hash = this._createHash(8);
				obj.actions[hash] = { action: { type: 'point', props: props, duration: duration, triggerPosition: triggerPosition } };
				this.actions.push(_extends({ sprite: obj, hash: hash }, obj.actions[hash].action));
				return obj;
			}
		}, {
			key: 'actByStep',
			value: function actByStep(obj, props, section, triggerPosition) {
				if (triggerPosition === undefined) triggerPosition = this._getSpriteTriggerPosition(obj);
				if (!obj.actions) obj.actions = {};
				var hash = this._createHash(8);
				obj.actions[hash] = { action: { type: 'section', props: props, section: section, triggerPosition: triggerPosition } };
				this.actions.push(_extends({ sprite: obj, hash: hash }, obj.actions[hash].action));
				return obj;
			}
		}, {
			key: 'setPin',
			value: function setPin(obj, triggerPosition, section) {
				if (section === undefined) section = this.maxScroll;
				var props = this.scrollDirection == 'x' ? { x: obj.x + section } : { y: obj.y + section };
				obj.actByStep(props, section, triggerPosition);
				return obj;
			}
		}, {
			key: '_defaultSetting',
			value: function _defaultSetting(o) {
				var _this3 = this;

				this.crop = o.crop || 'longside'; // false, none,longside,shortside
				this.cropOrigin = o.cropOrigin || 'top'; // center, top,bottom, left,right
				this.designOrientation = o.orientation || 'portrait'; // 设计稿横竖屏: portrait, landscape
				this.scrollDirection = o.scrollDirection || 'y';
				this.maxScroll = o.maxScroll || 10000;
				this.desiginWidth = o.desiginWidth || 750;
				this.actionList = [];
				this.actions = [];

				// init
				this._width = document.documentElement.clientWidth || window.innerWidth;
				this._height = document.documentElement.clientHeight || window.innerHeight;
				this.deviceOrientation = this._width < this._height ? 'portrait' : 'landscape'; // 当前设备横竖屏
				this.loaderList = [];

				this.scroller = new _Scroller2.default(function (left, top, zoom) {
					return _this3._scrollerCallback(left, top, zoom);
				}, {
					zooming: false,
					animating: true,
					bouncing: false,
					animationDuration: 1000
				});
				this.scroller.__enableScrollY = true;
				this.scrollPosition = 0;

				var mousedown = false;
				document.addEventListener("touchstart", function (e) {
					_this3.scroller.doTouchStart(e.touches, e.timeStamp);
					mousedown = true;
				}, false);

				document.addEventListener("touchmove", function (e) {
					if (!mousedown) {
						return;
					}
					_this3.scroller.doTouchMove(e.touches, e.timeStamp);
					mousedown = true;
				}, false);

				document.addEventListener("touchend", function (e) {
					if (!mousedown) {
						return;
					}
					_this3.scroller.doTouchEnd(e.timeStamp);
					mousedown = false;
				}, false);
			}
		}, {
			key: '_createContainer',
			value: function _createContainer(o) {
				this.app = new PIXI.Application({ width: this._width, height: this._height, backgroundColor: o.backgroundColor, antialias: true });
				var main = document.body.appendChild(document.createElement('main'));
				main.appendChild(this.app.view);

				this.containerFitWindow = new PIXI.Container();
				this.containerFitWindow.pivot.set(0, 0);
				this.containerScroll = new PIXI.Container();
				this.containerScroll.name = 'story';
				this.containerFitWindow.addChild(this.containerScroll);
				this.app.stage.addChild(this.containerFitWindow);

				//debug
				// let part2Bg = createSprite("p2door0.png",{
				// let part2Bg = createSprite("page_01.jpg",{
				// 	x:0,
				// 	y:0,
				// })
				// this.containerScroll.addChild(part2Bg);
			}
		}, {
			key: '_scrollerCallback',
			value: function _scrollerCallback(left, top, zoom) {
				var _this4 = this;

				// console.log('top:', top)
				// console.log('left:', left)
				// scrollTo.set({left, top})
				// this.scrollPosition = scrollTo.getSrollPosition();
				// scrollToDestination(left, top)

				// this.scrollPosition = this.deviceOrientation=='portrait' ? top : left;
				// this.scrollPosition /= this._scale; 

				this.scrollPosition = this._getSrollPosition(left, top);

				if (this.scrollDirection == 'x') {
					this.containerScroll.x = -this.scrollPosition / this._scale;
					this.scrollPosition = this.scrollPosition / this._scale;
				} else {
					this.containerScroll.y = -this.scrollPosition / this._scale;
					this.scrollPosition = this.scrollPosition / this._scale;
				}
				console.log('scrollPosition :', this.scrollPosition);

				// Act
				this.actions.forEach(function (action) {
					if (action.type == 'point') {
						triggerActionByPosition.call(_this4, action);
					} else if (action.type == 'section') {
						triggerActionByStep.call(_this4, action);
					} else if (action.type == 'pin') {
						triggerActionSetPin.call(_this4, action);
					}
				});

				function triggerActionByPosition(action) {
					var storedAction = action.sprite.actions[action.hash];
					if (this.scrollPosition > action.triggerPosition) {
						if (storedAction.status != 'acting' && storedAction.status != 'done') {
							action.props.onComplete = function (el) {
								return storedAction.status = 'done';
							};
							action.props.onReverseComplete = function (el) {
								return storedAction.status = 'reversed';
							};
							var tweenInstance = _TweenMax.TweenMax.to(action.sprite, action.duration, action.props);
							_setActStatus(action.sprite, action.hash, tweenInstance);
						}
					} else {
						// 倒带
						if (storedAction.status == 'acting' || storedAction.status == 'done') {
							if (storedAction.tween) {
								storedAction.status = 'reversing';
								storedAction.tween.reverse();
							}
						}
					}
				}
				function _setActStatus(sprite, hash, tweenInstance) {
					sprite.actions[hash].tween = tweenInstance;
					sprite.actions[hash].status = 'acting';
				}
				function triggerActionByStep(action) {
					if (action.triggerPosition < this.scrollPosition && this.scrollPosition < action.triggerPosition + action.section) {
						action.sprite._originProps = action.sprite._originProps || {};
						for (var prop in action.props) {
							if (_typeof(action.props[prop]) == 'object') {
								for (var subprop in action.props[prop]) {
									if (!action.sprite._originProps[prop]) action.sprite._originProps[prop] = {};
									if (!action.sprite._originProps[prop][subprop]) action.sprite._originProps[prop][subprop] = action.sprite[prop][subprop];
									action.sprite[prop][subprop] = this._scrollNum(action.triggerPosition, action.triggerPosition + action.section, this.scrollPosition, action.sprite._originProps[prop][subprop], action.props[prop][subprop]);
								}
							} else {
								if (!action.sprite._originProps[prop]) action.sprite._originProps[prop] = action.sprite[prop];
								action.sprite[prop] = this._scrollNum(action.triggerPosition, action.triggerPosition + action.section, this.scrollPosition, action.sprite._originProps[prop], action.props[prop]);
							}
						}
					} else if (this.scrollPosition <= action.triggerPosition + action.section) {
						// 强制达到最终态
						// if > position => props = ending, else < p => props = start
					}
				}
			}
		}, {
			key: '_scrollNum',
			value: function _scrollNum(minNum, maxNum, top, start, end) {
				return start + (top - minNum) / (maxNum - minNum) * (end - start);
			}
		}, {
			key: '_getSpriteTriggerPosition',
			value: function _getSpriteTriggerPosition(sprite) {
				var spritePosition = this.scrollDirection == 'x' ? sprite.x : sprite.y;
				if (sprite.parent && sprite.parent.name != 'story') return spritePosition + this._getSpriteTriggerPosition(sprite.parent);
				return spritePosition - this.pageHeight * 2 / 3;
			}
		}, {
			key: '_createHash',
			value: function _createHash(hashLength) {
				return Array.from(Array(Number(hashLength) || 24), function () {
					return _mathjs2.default.floor(_mathjs2.default.random() * 36).toString(36);
				}).join('');
			}
		}, {
			key: '_getSrollPosition',
			value: function _getSrollPosition(left, top) {
				var positionMapFunctionGenerator = function positionMapFunctionGenerator(left, top) {
					var positionMap = {
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
					};
					return function (designOrientation, deviceOrientation, scrollDirection) {
						return positionMap['design_' + designOrientation]['device_' + deviceOrientation][scrollDirection];
					};
				};

				var getPositionFromMap = positionMapFunctionGenerator(left, top);
				return getPositionFromMap(this.designOrientation, this.deviceOrientation, this.scrollDirection);
			}
		}, {
			key: '_windowResize',
			value: function _windowResize() {
				this._width = document.documentElement.clientWidth || window.innerWidth;
				this._height = document.documentElement.clientHeight || window.innerHeight;
				this.deviceOrientation = this._width < this._height ? 'portrait' : 'landscape';

				if (browser.weixin) {
					if (this.designOrientation == 'portrait') {
						if (window.orientation === 90 || window.orientation === -90) {
							// 横屏 浏览器的宽度大于高度
							this._viewPortraitDeviceL();
						} else if (window.orientation === 180 || window.orientation === 0) {
							// 竖屏 浏览器的宽度小于高度
							this._viewPortraitDeviceP();
						}
					} else {
						if (window.orientation === 90 || window.orientation === -90) {
							// 横屏 浏览器的宽度大于高度
							this._viewLandscapDeviceL();
						} else if (window.orientation === 180 || window.orientation === 0) {
							// 竖屏 浏览器的宽度小于高度
							this._viewLandscapDeviceP();
						}
					}
				} else {
					// console.log("width"+this._width +"height"+this._height)
					if (this.designOrientation == 'portrait') {
						if (this.deviceOrientation == 'portrait') {
							this._viewPortraitDeviceP();
						} else {
							this._viewPortraitDeviceL();
						}
					} else {
						if (this.deviceOrientation == 'portrait') {
							this._viewLandscapDeviceP();
						} else {
							this._viewLandscapDeviceL();
						}
					}
				}
			}
		}, {
			key: '_viewLandscapDeviceL',
			value: function _viewLandscapDeviceL() {
				var _this5 = this;

				this._scale = this._height / this.desiginWidth;
				this.pageHeight = this._width / this._scale;
				this.containerFitWindow.rotation = 0;
				this.containerFitWindow.scale.set(this._scale, this._scale);
				this.app.renderer.resize(this._width, this._height);
				switch (this.cropOrigin) {
					case 'center':
						this.containerFitWindow.position.set(0, (this._width - this.maxScroll) / 2);
						break;
					case 'right':
						this.containerFitWindow.position.set(0, this._width - this.maxScroll);
						break;
					case 'left':
					default:
						this.containerFitWindow.position.set(0, 0);
						break;
				}

				setTimeout(function () {
					if (_this5.scrollDirection == 'x') {
						_this5.scroller.setDimensions(_this5._width, _this5._height, _this5.maxScroll + _this5._width, _this5._height);
						_this5.scroller.scrollTo(_this5.scrollPosition * _this5._scale, 0, false);
					} else {
						_this5.scroller.setDimensions(_this5._width, _this5._height, _this5._width, _this5.maxScroll + _this5._height);
						_this5.scroller.scrollTo(0, _this5.scrollPosition * _this5._scale, false);
					}
				}, 200);
			}
		}, {
			key: '_viewLandscapDeviceP',
			value: function _viewLandscapDeviceP() {
				var _this6 = this;

				this._scale = this._width / this.desiginWidth;
				this.pageHeight = this._height / this._scale;
				this.containerFitWindow.rotation = _mathjs2.default.PI / 2;
				this.containerFitWindow.scale.set(this._scale, this._scale);
				this.app.renderer.resize(this._width, this._height);
				switch (this.cropOrigin) {
					case 'center':
						this.containerFitWindow.position.set(this._width, (this._height - this.maxScroll) / 2);
						break;
					case 'bottom':
						this.containerFitWindow.position.set(this._width, this._height - this.maxScroll);
						break;
					case 'top':
					default:
						this.containerFitWindow.position.set(this._width, 0);
						break;
				}

				setTimeout(function () {
					if (_this6.scrollDirection == 'x') {
						_this6.scroller.setDimensions(_this6._width, _this6._height, _this6._width, _this6.maxScroll + _this6._height);
						_this6.scroller.scrollTo(_this6.scrollPosition * _this6._scale, 0, false);
					} else {
						_this6.scroller.setDimensions(_this6._width, _this6._height, _this6.maxScroll + _this6._width, _this6._height);
						_this6.scroller.scrollTo(_this6.scrollPosition * _this6._scale, 0, false);
					}
				}, 200);
			}
		}, {
			key: '_viewPortraitDeviceP',
			value: function _viewPortraitDeviceP() {
				var _this7 = this;

				this._scale = this._height / this.desiginWidth;
				this.pageHeight = this._width / this._scale;
				this.containerFitWindow.rotation = 0;
				this.containerFitWindow.scale.set(this._scale, this._scale);
				this.app.renderer.resize(this._width, this._height);
				switch (this.cropOrigin) {
					case 'center':
						this.containerFitWindow.position.set(0, (this._width - this.maxScroll) / 2);
						break;
					case 'bottom':
						this.containerFitWindow.position.set(0, this._width - this.maxScroll);
						break;
					case 'top':
					default:
						this.containerFitWindow.position.set(0, 0);
						break;
				}

				setTimeout(function () {
					if (_this7.scrollDirection == 'x') {
						_this7.scroller.setDimensions(_this7._width, _this7._height, _this7.maxScroll + _this7._width, _this7._height);
						_this7.scroller.scrollTo(_this7.scrollPosition * _this7._scale, 0, false);
					} else {
						_this7.scroller.setDimensions(_this7._width, _this7._height, _this7._width, _this7.maxScroll + _this7._height);
						_this7.scroller.scrollTo(0, _this7.scrollPosition * _this7._scale, false);
					}
				}, 200);
			}
		}, {
			key: '_viewPortraitDeviceL',
			value: function _viewPortraitDeviceL() {
				var _this8 = this;

				this._scale = this._width / this.desiginWidth;
				this.pageHeight = this._height / this._scale;
				this.containerFitWindow.rotation = -_mathjs2.default.PI / 2;
				this.containerFitWindow.scale.set(this._scale, this._scale);
				this.app.renderer.resize(this._width, this._height);
				switch (this.cropOrigin) {
					case 'center':
						this.containerFitWindow.position.set((this._width - this.maxScroll) / 2, this._height);
						break;
					case 'bottom':
						this.containerFitWindow.position.set(this._width - this.maxScroll, this._height);
						break;
					case 'top':
					default:
						this.containerFitWindow.position.set(0, this._height);
						break;
				}

				setTimeout(function () {
					if (_this8.scrollDirection == 'x') {
						_this8.scroller.setDimensions(_this8._width, _this8._height, _this8._width, _this8.maxScroll + _this8._height);
						_this8.scroller.scrollTo(0, _this8.scrollPosition * _this8._scale, false);
					} else {
						_this8.scroller.setDimensions(_this8._width, _this8._height, _this8.maxScroll + _this8._width, _this8._height);
						_this8.scroller.scrollTo(_this8.scrollPosition * _this8._scale, 0, false);
					}
				}, 200);
			}
		}]);

		return StoryScroll;
	}();

	exports.default = StoryScroll;
});
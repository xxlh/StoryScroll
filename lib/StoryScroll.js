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
		// Phsical device height
		// First View Length = deviceHeight/(deviceWidth/designWidth)
		// Scaled Design Length
		function StoryScroll(o) {
			var _this = this;

			_classCallCheck(this, StoryScroll);

			this.maxScroll = 10000;
			this.storyPosition = 0;

			this._defaultSetting(o);
			this._createContainer(o);
			window.onresize = function (e) {
				return _this._windowResize();
			};
			this._windowResize();
		} // Phsical device width
		// First View Width = Content Width (No Crop)
		// Scaled Design With


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
				// if (section === undefined) section = this.maxScroll;
				// let props = this.scrollDirection == 'x' ? {x: obj.x + section } : {y: obj.y + section };
				// obj.actByStep(props, section, triggerPosition)
				if (!obj.actions) obj.actions = {};
				var hash = this._createHash();
				obj.actions[hash] = { action: { type: 'pin', section: section, triggerPosition: triggerPosition } };
				this.actions.push(_extends({ sprite: obj, hash: hash }, obj.actions[hash].action));
				return obj;
			}
		}, {
			key: '_defaultSetting',
			value: function _defaultSetting(o) {
				var _this3 = this;

				this.scrollDirection = o.direction || 'y';
				this.designWidth = o.width || 750;
				this.designLength = o.length || 10000;
				this.debug = o.debug || false;
				this.appendID = o.appendID;

				// init
				this._clientWidth = document.documentElement.clientWidth || window.innerWidth;
				this._clientHeight = document.documentElement.clientHeight || window.innerHeight;
				this.designOrientation = this.scrollDirection == 'y' ? 'portrait' : 'landscape';
				this.actionList = [];
				this.actions = [];
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
				this.storyPosition = 0;

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
				this.app = new PIXI.Application({ width: this._clientWidth, height: this._clientHeight, backgroundColor: o.backgroundColor, antialias: true });
				// const main = document.body.appendChild(document.createElement('main'));
				// main.appendChild(this.app.view);
				document.getElementById(this.appendID).appendChild(this.app.view);

				this.containerFitWindow = new PIXI.Container();
				this.containerFitWindow.pivot.set(0, 0);
				this.containerScroll = new PIXI.Container();
				this.containerScroll.name = 'story';
				this.containerFitWindow.addChild(this.containerScroll);
				this.app.stage.addChild(this.containerFitWindow);
			}
		}, {
			key: '_scrollerCallback',
			value: function _scrollerCallback(left, top, zoom) {
				var _this4 = this;

				this.scrollPosition = this._getSrollPosition(left, top);
				this.storyPosition = this.scrollPosition / this._scale;
				this.scrollDirection == 'y' ? this.containerScroll.y = -this.storyPosition : this.containerScroll.x = -this.storyPosition;

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

				if (this.debug) {
					if (this.debug == 'all') {
						console.log('top:', top);
						console.log('left:', left);
						console.log('scrollPosition :', this.scrollPosition);
					}
					console.log('storyPosition :', this.storyPosition);
				}

				function triggerActionByPosition(action) {
					var storedAction = action.sprite.actions[action.hash];
					if (this.storyPosition > action.triggerPosition) {
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
					var storedAction = action.sprite.actions[action.hash];
					if (action.triggerPosition < this.storyPosition && this.storyPosition < action.triggerPosition + action.section) {
						setProps('during', storedAction, action, this.storyPosition);
					} else if (this.storyPosition >= action.triggerPosition + action.section) {
						// 强制达到最终态
						setProps('after', storedAction, action, this.storyPosition);
					} else if (this.storyPosition <= action.triggerPosition) {
						// 强制回复最终态
						setProps('before', storedAction, action, this.storyPosition);
					}
					// ToDo: before, after在多个动画区间bug，after>storyPosition 且 < 下一个区间的triggerPosition

					// 区间最小值, 区间最大值, top, 初始位置, 终点, 速度, 方向
					function _scrollNum(minNum, maxNum, top, start, end) {
						return start + (top - minNum) / (maxNum - minNum) * (end - start);
					}
					function setProps(positionStatus, storedAction, action, storyPosition) {
						positionStatus = positionStatus || 'before';
						storedAction.originProps = storedAction.originProps || {};
						for (var prop in action.props) {
							if (_typeof(action.props[prop]) == 'object') {
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
					var storedAction = action.sprite.actions[action.hash];
					storedAction.originProps = storedAction.originProps || {};
					if (storedAction.originProps[this.scrollDirection] === undefined) storedAction.originProps[this.scrollDirection] = action.sprite[this.scrollDirection];

					action.sprite[this.scrollDirection] = storedAction.originProps[this.scrollDirection] - action.triggerPosition + this.storyPosition;
				}
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
				var _this5 = this;

				this.deviceOrientation = getDeviceOrientation.call(this);
				this.deviceWidth = this.deviceOrientation == 'portrait' ? this._clientWidth : this._clientHeight;
				this.deviceHeight = this.deviceOrientation == 'portrait' ? this._clientHeight : this._clientWidth;

				this._scale = this.deviceWidth / this.designWidth;
				this.maxScroll = this.designLength - this.deviceHeight;

				this.contentWidth = this.deviceWidth;
				this.contentLength = this.designLength * this._scale;

				this.viewWidth = this.designWidth;
				this.viewLength = this.deviceHeight / this._scale;

				setContainerRotation(this.containerFitWindow, this.designOrientation, this.deviceOrientation, this.deviceWidth);
				this.containerFitWindow.scale.set(this._scale, this._scale);
				this.app.renderer.resize(this._clientWidth, this._clientHeight);

				var scrollerContentWidth = this.deviceOrientation == 'portrait' ? this.deviceWidth : this.contentLength;
				var scrollerContentHeight = this.deviceOrientation == 'portrait' ? this.contentLength : this.deviceWidth;
				var scrollerLeft = this.deviceOrientation == 'portrait' ? 0 : this.scrollPosition || 0;
				var scrollerTop = this.deviceOrientation == 'portrait' ? this.scrollPosition || 0 : 0;

				setTimeout(function () {
					_this5.scroller.setDimensions(_this5._clientWidth, _this5._clientHeight, scrollerContentWidth, scrollerContentHeight);
					_this5.scroller.scrollTo(scrollerLeft, scrollerTop, false);
				}, 200);

				function getDeviceOrientation(params) {
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

				function setContainerRotation(container, designOrientation, deviceOrientation, deviceWidth) {
					var rotationMap = {
						design_portrait: {
							device_portrait: {
								rotation: 0,
								offsetX: 0,
								offsetY: 0
							},
							device_landscape: {
								rotation: -_mathjs2.default.PI / 2,
								offsetX: 0,
								offsetY: deviceWidth
							}
						},
						design_landscape: {
							device_portrait: {
								rotation: _mathjs2.default.PI / 2,
								offsetX: deviceWidth,
								offsetY: 0
							},
							device_landscape: {
								rotation: 0,
								offsetX: 0,
								offsetY: 0
							}
						}
					};
					container.rotation = rotationMap['design_' + designOrientation]['device_' + deviceOrientation]['rotation'];
					container.position.set(rotationMap['design_' + designOrientation]['device_' + deviceOrientation]['offsetX'], rotationMap['design_' + designOrientation]['device_' + deviceOrientation]['offsetY']);
				}
			}
		}]);

		return StoryScroll;
	}();

	exports.default = StoryScroll;
});
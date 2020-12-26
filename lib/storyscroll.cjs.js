/*
 * storyscroll v3.6.2
 * (c) 2020 Little Linghuan & Esone
 * Released under the GPL license
 * ieexx.com
 */

'use strict';

var PIXI = require('pixi.js');

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var u = navigator.userAgent;
var trident = u.indexOf('Trident') > -1; //IE内核

var presto = u.indexOf('Presto') > -1; //opera内核

var webKit = u.indexOf('AppleWebKit') > -1; //苹果、谷歌内核

var gecko = u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1; //火狐内核

var mobile = !!u.match(/AppleWebKit.*Mobile.*/); //是否为移动终端

var ios = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

var android = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端

var iPhone = u.indexOf('iPhone') > -1; //是否为iPhone或者QQHD浏览器

var iPad = u.indexOf('iPad') > -1; //是否iPad

var webApp = u.indexOf('Safari') == -1; //是否web应该程序，没有头部与底部

var weixin = u.indexOf('MicroMessenger') > -1; //是否微信 （2015-01-22新增）

var weibo = u.indexOf('Weibo') > -1; //是否微博

var qq = u.match(/\sQQ/i) == " qq"; //是否QQ

/*
 * Scroller
 * http://github.com/zynga/scroller
 *
 * Copyright 2011, Zynga Inc.
 * Licensed under the MIT License.
 * https://raw.github.com/zynga/scroller/master/MIT-LICENSE.txt
 *
 * Based on the work of: Unify Project (unify-project.org)
 * http://unify-project.org
 * Copyright 2011, Deutsche Telekom AG
 * License: MIT + Apache (V2)
 */

/**
 * Generic animation class with support for dropped frames both optional easing and duration.
 *
 * Optional duration is useful when the lifetime is defined by another condition than time
 * e.g. speed of an animating object, etc.
 *
 * Dropped frame logic allows to keep using the same updater logic independent from the actual
 * rendering. This eases a lot of cases where it might be pretty complex to break down a state
 * based on the pure time difference.
 */
(function (global) {
  var time = Date.now || function () {
    return +new Date();
  };

  var desiredFrames = 60;
  var millisecondsPerSecond = 1000;
  var running = {};
  var counter = 1; // Create namespaces

  if (!global.core) {
    global.core = {
      effect: {}
    };
  } else if (!core.effect) {
    core.effect = {};
  }

  core.effect.Animate = {
    /**
     * A requestAnimationFrame wrapper / polyfill.
     *
     * @param callback {Function} The callback to be invoked before the next repaint.
     * @param root {HTMLElement} The root element for the repaint
     */
    requestAnimationFrame: function () {
      // Check for request animation Frame support
      var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;
      var isNative = !!requestFrame;

      if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) {
        isNative = false;
      }

      if (isNative) {
        return function (callback, root) {
          requestFrame(callback, root);
        };
      }

      var TARGET_FPS = 60;
      var requests = {};
      var rafHandle = 1;
      var intervalHandle = null;
      var lastActive = +new Date();
      return function (callback, root) {
        var callbackHandle = rafHandle++; // Store callback

        requests[callbackHandle] = callback;

        if (intervalHandle === null) {
          intervalHandle = setInterval(function () {
            var time = +new Date();
            var currentRequests = requests; // Reset data structure before executing callbacks

            requests = {};

            for (var key in currentRequests) {
              if (currentRequests.hasOwnProperty(key)) {
                currentRequests[key](time);
                lastActive = time;
              }
            } // Disable the timeout when nothing happens for a certain
            // period of time


            if (time - lastActive > 2500) {
              clearInterval(intervalHandle);
              intervalHandle = null;
            }
          }, 1000 / TARGET_FPS);
        }

        return callbackHandle;
      };
    }(),

    /**
     * Stops the given animation.
     *
     * @param id {Integer} Unique animation ID
     * @return {Boolean} Whether the animation was stopped (aka, was running before)
     */
    stop: function stop(id) {
      var cleared = running[id] != null;

      if (cleared) {
        running[id] = null;
      }

      return cleared;
    },

    /**
     * Whether the given animation is still running.
     *
     * @param id {Integer} Unique animation ID
     * @return {Boolean} Whether the animation is still running
     */
    isRunning: function isRunning(id) {
      return running[id] != null;
    },

    /**
     * Start the animation.
     *
     * @param stepCallback {Function} Pointer to function which is executed on every step.
     *   Signature of the method should be `function(percent, now, virtual) { return continueWithAnimation; }`
     * @param verifyCallback {Function} Executed before every animation step.
     *   Signature of the method should be `function() { return continueWithAnimation; }`
     * @param completedCallback {Function}
     *   Signature of the method should be `function(droppedFrames, finishedAnimation) {}`
     * @param duration {Integer} Milliseconds to run the animation
     * @param easingMethod {Function} Pointer to easing function
     *   Signature of the method should be `function(percent) { return modifiedValue; }`
     * @param root {Element ? document.body} Render root, when available. Used for internal
     *   usage of requestAnimationFrame.
     * @return {Integer} Identifier of animation. Can be used to stop it any time.
     */
    start: function start(stepCallback, verifyCallback, completedCallback, duration, easingMethod, root) {
      var start = time();
      var lastFrame = start;
      var percent = 0;
      var dropCounter = 0;
      var id = counter++;

      if (!root) {
        root = document.body;
      } // Compacting running db automatically every few new animations


      if (id % 20 === 0) {
        var newRunning = {};

        for (var usedId in running) {
          newRunning[usedId] = true;
        }

        running = newRunning;
      } // This is the internal step method which is called every few milliseconds


      var step = function step(virtual) {
        // Normalize virtual value
        var render = virtual !== true; // Get current time

        var now = time(); // Verification is executed before next animation step

        if (!running[id] || verifyCallback && !verifyCallback(id)) {
          running[id] = null;
          completedCallback && completedCallback(desiredFrames - dropCounter / ((now - start) / millisecondsPerSecond), id, false);
          return;
        } // For the current rendering to apply let's update omitted steps in memory.
        // This is important to bring internal state variables up-to-date with progress in time.


        if (render) {
          var droppedFrames = Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;

          for (var j = 0; j < Math.min(droppedFrames, 4); j++) {
            step(true);
            dropCounter++;
          }
        } // Compute percent value


        if (duration) {
          percent = (now - start) / duration;

          if (percent > 1) {
            percent = 1;
          }
        } // Execute step callback, then...


        var value = easingMethod ? easingMethod(percent) : percent;

        if ((stepCallback(value, now, render) === false || percent === 1) && render) {
          running[id] = null;
          completedCallback && completedCallback(desiredFrames - dropCounter / ((now - start) / millisecondsPerSecond), id, percent === 1 || duration == null);
        } else if (render) {
          lastFrame = now;
          core.effect.Animate.requestAnimationFrame(step, root);
        }
      }; // Mark as running


      running[id] = true; // Init first step

      core.effect.Animate.requestAnimationFrame(step, root); // Return unique animation ID

      return id;
    }
  };
})(window);

/*
 * Scroller
 * http://github.com/zynga/scroller
 *
 * Copyright 2011, Zynga Inc.
 * Licensed under the MIT License.
 * https://raw.github.com/zynga/scroller/master/MIT-LICENSE.txt
 *
 * Based on the work of: Unify Project (unify-project.org)
 * http://unify-project.org
 * Copyright 2011, Deutsche Telekom AG
 * License: MIT + Apache (V2)
 */
var Scroller;

(function () {
  var NOOP = function NOOP() {};
  /**
   * A pure logic 'component' for 'virtual' scrolling/zooming.
   */


  Scroller = function Scroller(callback, options) {
    this.__callback = callback;
    this.options = {
      /** Enable scrolling on x-axis */
      scrollingX: true,

      /** Enable scrolling on y-axis */
      scrollingY: true,

      /** Enable animations for deceleration, snap back, zooming and scrolling */
      animating: true,

      /** duration for animations triggered by scrollTo/zoomTo */
      animationDuration: 250,

      /** Enable bouncing (content can be slowly moved outside and jumps back after releasing) */
      bouncing: true,

      /** Enable locking to the main axis if user moves only slightly on one of them at start */
      locking: true,

      /** Enable pagination mode (switching between full page content panes) */
      paging: false,

      /** Enable snapping of content to a configured pixel grid */
      snapping: false,

      /** Enable zooming of content via API, fingers and mouse wheel */
      zooming: false,

      /** Minimum zoom level */
      minZoom: 0.5,

      /** Maximum zoom level */
      maxZoom: 3,

      /** Multiply or decrease scrolling speed **/
      speedMultiplier: 1,

      /** Callback that is fired on the later of touch end or deceleration end,
      	provided that another scrolling action has not begun. Used to know
      	when to fade out a scrollbar. */
      scrollingComplete: NOOP,

      /** This configures the amount of change applied to deceleration when reaching boundaries  **/
      penetrationDeceleration: 0.03,

      /** This configures the amount of change applied to acceleration when reaching boundaries  **/
      penetrationAcceleration: 0.08
    };

    for (var key in options) {
      this.options[key] = options[key];
    }
  }; // Easing Equations (c) 2003 Robert Penner, all rights reserved.
  // Open source under the BSD License.

  /**
   * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
  **/


  var easeOutCubic = function easeOutCubic(pos) {
    return Math.pow(pos - 1, 3) + 1;
  };
  /**
   * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
  **/


  var easeInOutCubic = function easeInOutCubic(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 3);
    }

    return 0.5 * (Math.pow(pos - 2, 3) + 2);
  };

  var members = {
    /*
    ---------------------------------------------------------------------------
    	INTERNAL FIELDS :: STATUS
    ---------------------------------------------------------------------------
    */

    /** {Boolean} Whether only a single finger is used in touch handling */
    __isSingleTouch: false,

    /** {Boolean} Whether a touch event sequence is in progress */
    __isTracking: false,

    /** {Boolean} Whether a deceleration animation went to completion. */
    __didDecelerationComplete: false,

    /**
     * {Boolean} Whether a gesture zoom/rotate event is in progress. Activates when
     * a gesturestart event happens. This has higher priority than dragging.
     */
    __isGesturing: false,

    /**
     * {Boolean} Whether the user has moved by such a distance that we have enabled
     * dragging mode. Hint: It's only enabled after some pixels of movement to
     * not interrupt with clicks etc.
     */
    __isDragging: false,

    /**
     * {Boolean} Not touching and dragging anymore, and smoothly animating the
     * touch sequence using deceleration.
     */
    __isDecelerating: false,

    /**
     * {Boolean} Smoothly animating the currently configured change
     */
    __isAnimating: false,

    /*
    ---------------------------------------------------------------------------
    	INTERNAL FIELDS :: DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /** {Integer} Available outer left position (from document perspective) */
    __clientLeft: 0,

    /** {Integer} Available outer top position (from document perspective) */
    __clientTop: 0,

    /** {Integer} Available outer width */
    __clientWidth: 0,

    /** {Integer} Available outer height */
    __clientHeight: 0,

    /** {Integer} Outer width of content */
    __contentWidth: 0,

    /** {Integer} Outer height of content */
    __contentHeight: 0,

    /** {Integer} Snapping width for content */
    __snapWidth: 100,

    /** {Integer} Snapping height for content */
    __snapHeight: 100,

    /** {Integer} Height to assign to refresh area */
    __refreshHeight: null,

    /** {Boolean} Whether the refresh process is enabled when the event is released now */
    __refreshActive: false,

    /** {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release */
    __refreshActivate: null,

    /** {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled */
    __refreshDeactivate: null,

    /** {Function} Callback to execute to start the actual refresh. Call {@link #refreshFinish} when done */
    __refreshStart: null,

    /** {Number} Zoom level */
    __zoomLevel: 1,

    /** {Number} Scroll position on x-axis */
    __scrollLeft: 0,

    /** {Number} Scroll position on y-axis */
    __scrollTop: 0,

    /** {Integer} Maximum allowed scroll position on x-axis */
    __maxScrollLeft: 0,

    /** {Integer} Maximum allowed scroll position on y-axis */
    __maxScrollTop: 0,

    /* {Number} Scheduled left position (final position when animating) */
    __scheduledLeft: 0,

    /* {Number} Scheduled top position (final position when animating) */
    __scheduledTop: 0,

    /* {Number} Scheduled zoom level (final scale when animating) */
    __scheduledZoom: 0,

    /*
    ---------------------------------------------------------------------------
    	INTERNAL FIELDS :: LAST POSITIONS
    ---------------------------------------------------------------------------
    */

    /** {Number} Left position of finger at start */
    __lastTouchLeft: null,

    /** {Number} Top position of finger at start */
    __lastTouchTop: null,

    /** {Date} Timestamp of last move of finger. Used to limit tracking range for deceleration speed. */
    __lastTouchMove: null,

    /** {Array} List of positions, uses three indexes for each state: left, top, timestamp */
    __positions: null,

    /*
    ---------------------------------------------------------------------------
    	INTERNAL FIELDS :: DECELERATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /** {Integer} Minimum left scroll position during deceleration */
    __minDecelerationScrollLeft: null,

    /** {Integer} Minimum top scroll position during deceleration */
    __minDecelerationScrollTop: null,

    /** {Integer} Maximum left scroll position during deceleration */
    __maxDecelerationScrollLeft: null,

    /** {Integer} Maximum top scroll position during deceleration */
    __maxDecelerationScrollTop: null,

    /** {Number} Current factor to modify horizontal scroll position with on every step */
    __decelerationVelocityX: null,

    /** {Number} Current factor to modify vertical scroll position with on every step */
    __decelerationVelocityY: null,

    /*
    ---------------------------------------------------------------------------
    	PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Configures the dimensions of the client (outer) and content (inner) elements.
     * Requires the available space for the outer element and the outer size of the inner element.
     * All values which are falsy (null or zero etc.) are ignored and the old value is kept.
     *
     * @param clientWidth {Integer ? null} Inner width of outer element
     * @param clientHeight {Integer ? null} Inner height of outer element
     * @param contentWidth {Integer ? null} Outer width of inner element
     * @param contentHeight {Integer ? null} Outer height of inner element
     */
    setDimensions: function setDimensions(clientWidth, clientHeight, contentWidth, contentHeight) {
      var self = this; // Only update values which are defined

      if (clientWidth === +clientWidth) {
        self.__clientWidth = clientWidth;
      }

      if (clientHeight === +clientHeight) {
        self.__clientHeight = clientHeight;
      }

      if (contentWidth === +contentWidth) {
        self.__contentWidth = contentWidth;
      }

      if (contentHeight === +contentHeight) {
        self.__contentHeight = contentHeight;
      } // Refresh maximums


      self.__computeScrollMax(); // Refresh scroll position


      self.scrollTo(self.__scrollLeft, self.__scrollTop, true);
    },

    /**
     * Sets the client coordinates in relation to the document.
     *
     * @param left {Integer ? 0} Left position of outer element
     * @param top {Integer ? 0} Top position of outer element
     */
    setPosition: function setPosition(left, top) {
      var self = this;
      self.__clientLeft = left || 0;
      self.__clientTop = top || 0;
    },

    /**
     * Configures the snapping (when snapping is active)
     *
     * @param width {Integer} Snapping width
     * @param height {Integer} Snapping height
     */
    setSnapSize: function setSnapSize(width, height) {
      var self = this;
      self.__snapWidth = width;
      self.__snapHeight = height;
    },

    /**
     * Activates pull-to-refresh. A special zone on the top of the list to start a list refresh whenever
     * the user event is released during visibility of this zone. This was introduced by some apps on iOS like
     * the official Twitter client.
     *
     * @param height {Integer} Height of pull-to-refresh zone on top of rendered list
     * @param activateCallback {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release.
     * @param deactivateCallback {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled.
     * @param startCallback {Function} Callback to execute to start the real async refresh action. Call {@link #finishPullToRefresh} after finish of refresh.
     */
    activatePullToRefresh: function activatePullToRefresh(height, activateCallback, deactivateCallback, startCallback) {
      var self = this;
      self.__refreshHeight = height;
      self.__refreshActivate = activateCallback;
      self.__refreshDeactivate = deactivateCallback;
      self.__refreshStart = startCallback;
    },

    /**
     * Starts pull-to-refresh manually.
     */
    triggerPullToRefresh: function triggerPullToRefresh() {
      // Use publish instead of scrollTo to allow scrolling to out of boundary position
      // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
      this.__publish(this.__scrollLeft, -this.__refreshHeight, this.__zoomLevel, true);

      if (this.__refreshStart) {
        this.__refreshStart();
      }
    },

    /**
     * Signalizes that pull-to-refresh is finished.
     */
    finishPullToRefresh: function finishPullToRefresh() {
      var self = this;
      self.__refreshActive = false;

      if (self.__refreshDeactivate) {
        self.__refreshDeactivate();
      }

      self.scrollTo(self.__scrollLeft, self.__scrollTop, true);
    },

    /**
     * Returns the scroll position and zooming values
     *
     * @return {Map} `left` and `top` scroll position and `zoom` level
     */
    getValues: function getValues() {
      var self = this;
      return {
        left: self.__scrollLeft,
        top: self.__scrollTop,
        zoom: self.__zoomLevel
      };
    },

    /**
     * Returns the maximum scroll values
     *
     * @return {Map} `left` and `top` maximum scroll values
     */
    getScrollMax: function getScrollMax() {
      var self = this;
      return {
        left: self.__maxScrollLeft,
        top: self.__maxScrollTop
      };
    },

    /**
     * Zooms to the given level. Supports optional animation. Zooms
     * the center when no coordinates are given.
     *
     * @param level {Number} Level to zoom to
     * @param animate {Boolean ? false} Whether to use animation
     * @param originLeft {Number ? null} Zoom in at given left coordinate
     * @param originTop {Number ? null} Zoom in at given top coordinate
     * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
     */
    zoomTo: function zoomTo(level, animate, originLeft, originTop, callback) {
      var self = this;

      if (!self.options.zooming) {
        throw new Error("Zooming is not enabled!");
      } // Add callback if exists


      if (callback) {
        self.__zoomComplete = callback;
      } // Stop deceleration


      if (self.__isDecelerating) {
        core.effect.Animate.stop(self.__isDecelerating);
        self.__isDecelerating = false;
      }

      var oldLevel = self.__zoomLevel; // Normalize input origin to center of viewport if not defined

      if (originLeft == null) {
        originLeft = self.__clientWidth / 2;
      }

      if (originTop == null) {
        originTop = self.__clientHeight / 2;
      } // Limit level according to configuration


      level = Math.max(Math.min(level, self.options.maxZoom), self.options.minZoom); // Recompute maximum values while temporary tweaking maximum scroll ranges

      self.__computeScrollMax(level); // Recompute left and top coordinates based on new zoom level


      var left = (originLeft + self.__scrollLeft) * level / oldLevel - originLeft;
      var top = (originTop + self.__scrollTop) * level / oldLevel - originTop; // Limit x-axis

      if (left > self.__maxScrollLeft) {
        left = self.__maxScrollLeft;
      } else if (left < 0) {
        left = 0;
      } // Limit y-axis


      if (top > self.__maxScrollTop) {
        top = self.__maxScrollTop;
      } else if (top < 0) {
        top = 0;
      } // Push values out


      self.__publish(left, top, level, animate);
    },

    /**
     * Zooms the content by the given factor.
     *
     * @param factor {Number} Zoom by given factor
     * @param animate {Boolean ? false} Whether to use animation
     * @param originLeft {Number ? 0} Zoom in at given left coordinate
     * @param originTop {Number ? 0} Zoom in at given top coordinate
     * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
     */
    zoomBy: function zoomBy(factor, animate, originLeft, originTop, callback) {
      var self = this;
      self.zoomTo(self.__zoomLevel * factor, animate, originLeft, originTop, callback);
    },

    /**
     * Scrolls to the given position. Respect limitations and snapping automatically.
     *
     * @param left {Number?null} Horizontal scroll position, keeps current if value is <code>null</code>
     * @param top {Number?null} Vertical scroll position, keeps current if value is <code>null</code>
     * @param animate {Boolean?false} Whether the scrolling should happen using an animation
     * @param zoom {Number?null} Zoom level to go to
     */
    scrollTo: function scrollTo(left, top, animate, zoom) {
      var self = this; // Stop deceleration

      if (self.__isDecelerating) {
        core.effect.Animate.stop(self.__isDecelerating);
        self.__isDecelerating = false;
      } // Correct coordinates based on new zoom level


      if (zoom != null && zoom !== self.__zoomLevel) {
        if (!self.options.zooming) {
          throw new Error("Zooming is not enabled!");
        }

        left *= zoom;
        top *= zoom; // Recompute maximum values while temporary tweaking maximum scroll ranges

        self.__computeScrollMax(zoom);
      } else {
        // Keep zoom when not defined
        zoom = self.__zoomLevel;
      }

      if (!self.options.scrollingX) {
        left = self.__scrollLeft;
      } else {
        if (self.options.paging) {
          left = Math.round(left / self.__clientWidth) * self.__clientWidth;
        } else if (self.options.snapping) {
          left = Math.round(left / self.__snapWidth) * self.__snapWidth;
        }
      }

      if (!self.options.scrollingY) {
        top = self.__scrollTop;
      } else {
        if (self.options.paging) {
          top = Math.round(top / self.__clientHeight) * self.__clientHeight;
        } else if (self.options.snapping) {
          top = Math.round(top / self.__snapHeight) * self.__snapHeight;
        }
      } // Limit for allowed ranges


      left = Math.max(Math.min(self.__maxScrollLeft, left), 0);
      top = Math.max(Math.min(self.__maxScrollTop, top), 0); // Don't animate when no change detected, still call publish to make sure
      // that rendered position is really in-sync with internal data

      if (left === self.__scrollLeft && top === self.__scrollTop) {
        animate = false;
      } // Publish new values


      if (!self.__isTracking) {
        self.__publish(left, top, zoom, animate);
      }
    },

    /**
     * Scroll by the given offset
     *
     * @param left {Number ? 0} Scroll x-axis by given offset
     * @param top {Number ? 0} Scroll x-axis by given offset
     * @param animate {Boolean ? false} Whether to animate the given change
     */
    scrollBy: function scrollBy(left, top, animate) {
      var self = this;
      var startLeft = self.__isAnimating ? self.__scheduledLeft : self.__scrollLeft;
      var startTop = self.__isAnimating ? self.__scheduledTop : self.__scrollTop;
      self.scrollTo(startLeft + (left || 0), startTop + (top || 0), animate);
    },

    /*
    ---------------------------------------------------------------------------
    	EVENT CALLBACKS
    ---------------------------------------------------------------------------
    */

    /**
     * Mouse wheel handler for zooming support
     */
    doMouseZoom: function doMouseZoom(wheelDelta, timeStamp, pageX, pageY) {
      var self = this;
      var change = wheelDelta > 0 ? 0.97 : 1.03;
      return self.zoomTo(self.__zoomLevel * change, false, pageX - self.__clientLeft, pageY - self.__clientTop);
    },

    /**
     * Touch start handler for scrolling support
     */
    doTouchStart: function doTouchStart(touches, timeStamp) {
      // Array-like check is enough here
      if (touches.length == null) {
        throw new Error("Invalid touch list: " + touches);
      }

      if (timeStamp instanceof Date) {
        timeStamp = timeStamp.valueOf();
      }

      if (typeof timeStamp !== "number") {
        throw new Error("Invalid timestamp value: " + timeStamp);
      }

      var self = this; // Reset interruptedAnimation flag

      self.__interruptedAnimation = true; // Stop deceleration

      if (self.__isDecelerating) {
        core.effect.Animate.stop(self.__isDecelerating);
        self.__isDecelerating = false;
        self.__interruptedAnimation = true;
      } // Stop animation


      if (self.__isAnimating) {
        core.effect.Animate.stop(self.__isAnimating);
        self.__isAnimating = false;
        self.__interruptedAnimation = true;
      } // Use center point when dealing with two fingers


      var currentTouchLeft, currentTouchTop;
      var isSingleTouch = touches.length === 1;

      if (isSingleTouch) {
        currentTouchLeft = touches[0].pageX;
        currentTouchTop = touches[0].pageY;
      } else {
        currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
        currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
      } // Store initial positions


      self.__initialTouchLeft = currentTouchLeft;
      self.__initialTouchTop = currentTouchTop; // Store current zoom level

      self.__zoomLevelStart = self.__zoomLevel; // Store initial touch positions

      self.__lastTouchLeft = currentTouchLeft;
      self.__lastTouchTop = currentTouchTop; // Store initial move time stamp

      self.__lastTouchMove = timeStamp; // Reset initial scale

      self.__lastScale = 1; // Reset locking flags

      self.__enableScrollX = !isSingleTouch && self.options.scrollingX;
      self.__enableScrollY = !isSingleTouch && self.options.scrollingY; // Reset tracking flag

      self.__isTracking = true; // Reset deceleration complete flag

      self.__didDecelerationComplete = false; // Dragging starts directly with two fingers, otherwise lazy with an offset

      self.__isDragging = !isSingleTouch; // Some features are disabled in multi touch scenarios

      self.__isSingleTouch = isSingleTouch; // Clearing data structure

      self.__positions = [];
    },

    /**
     * Touch move handler for scrolling support
     */
    doTouchMove: function doTouchMove(touches, timeStamp, scale) {
      // Array-like check is enough here
      if (touches.length == null) {
        throw new Error("Invalid touch list: " + touches);
      }

      if (timeStamp instanceof Date) {
        timeStamp = timeStamp.valueOf();
      }

      if (typeof timeStamp !== "number") {
        throw new Error("Invalid timestamp value: " + timeStamp);
      }

      var self = this; // Ignore event when tracking is not enabled (event might be outside of element)

      if (!self.__isTracking) {
        return;
      }

      var currentTouchLeft, currentTouchTop; // Compute move based around of center of fingers

      if (touches.length === 2) {
        currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
        currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
      } else {
        currentTouchLeft = touches[0].pageX;
        currentTouchTop = touches[0].pageY;
      }

      var positions = self.__positions; // Are we already is dragging mode?

      if (self.__isDragging) {
        // Compute move distance
        var moveX = currentTouchLeft - self.__lastTouchLeft;
        var moveY = currentTouchTop - self.__lastTouchTop; // Read previous scroll position and zooming

        var scrollLeft = self.__scrollLeft;
        var scrollTop = self.__scrollTop;
        var level = self.__zoomLevel; // Work with scaling

        if (scale != null && self.options.zooming) {
          var oldLevel = level; // Recompute level based on previous scale and new scale

          level = level / self.__lastScale * scale; // Limit level according to configuration

          level = Math.max(Math.min(level, self.options.maxZoom), self.options.minZoom); // Only do further compution when change happened

          if (oldLevel !== level) {
            // Compute relative event position to container
            var currentTouchLeftRel = currentTouchLeft - self.__clientLeft;
            var currentTouchTopRel = currentTouchTop - self.__clientTop; // Recompute left and top coordinates based on new zoom level

            scrollLeft = (currentTouchLeftRel + scrollLeft) * level / oldLevel - currentTouchLeftRel;
            scrollTop = (currentTouchTopRel + scrollTop) * level / oldLevel - currentTouchTopRel; // Recompute max scroll values

            self.__computeScrollMax(level);
          }
        }

        if (self.__enableScrollX) {
          scrollLeft -= moveX * this.options.speedMultiplier;
          var maxScrollLeft = self.__maxScrollLeft;

          if (scrollLeft > maxScrollLeft || scrollLeft < 0) {
            // Slow down on the edges
            if (self.options.bouncing) {
              scrollLeft += moveX / 2 * this.options.speedMultiplier;
            } else if (scrollLeft > maxScrollLeft) {
              scrollLeft = maxScrollLeft;
            } else {
              scrollLeft = 0;
            }
          }
        } // Compute new vertical scroll position


        if (self.__enableScrollY) {
          scrollTop -= moveY * this.options.speedMultiplier;
          var maxScrollTop = self.__maxScrollTop;

          if (scrollTop > maxScrollTop || scrollTop < 0) {
            // Slow down on the edges
            if (self.options.bouncing) {
              scrollTop += moveY / 2 * this.options.speedMultiplier; // Support pull-to-refresh (only when only y is scrollable)

              if (!self.__enableScrollX && self.__refreshHeight != null) {
                if (!self.__refreshActive && scrollTop <= -self.__refreshHeight) {
                  self.__refreshActive = true;

                  if (self.__refreshActivate) {
                    self.__refreshActivate();
                  }
                } else if (self.__refreshActive && scrollTop > -self.__refreshHeight) {
                  self.__refreshActive = false;

                  if (self.__refreshDeactivate) {
                    self.__refreshDeactivate();
                  }
                }
              }
            } else if (scrollTop > maxScrollTop) {
              scrollTop = maxScrollTop;
            } else {
              scrollTop = 0;
            }
          }
        } // Keep list from growing infinitely (holding min 10, max 20 measure points)


        if (positions.length > 60) {
          positions.splice(0, 30);
        } // Track scroll movement for decleration


        positions.push(scrollLeft, scrollTop, timeStamp); // Sync scroll position

        self.__publish(scrollLeft, scrollTop, level); // Otherwise figure out whether we are switching into dragging mode now.

      } else {
        var minimumTrackingForScroll = self.options.locking ? 3 : 0;
        var minimumTrackingForDrag = 5;
        var distanceX = Math.abs(currentTouchLeft - self.__initialTouchLeft);
        var distanceY = Math.abs(currentTouchTop - self.__initialTouchTop);
        self.__enableScrollX = self.options.scrollingX && distanceX >= minimumTrackingForScroll;
        self.__enableScrollY = self.options.scrollingY && distanceY >= minimumTrackingForScroll;
        positions.push(self.__scrollLeft, self.__scrollTop, timeStamp);
        self.__isDragging = (self.__enableScrollX || self.__enableScrollY) && (distanceX >= minimumTrackingForDrag || distanceY >= minimumTrackingForDrag);

        if (self.__isDragging) {
          self.__interruptedAnimation = false;
        }
      } // Update last touch positions and time stamp for next event


      self.__lastTouchLeft = currentTouchLeft;
      self.__lastTouchTop = currentTouchTop;
      self.__lastTouchMove = timeStamp;
      self.__lastScale = scale;
    },

    /**
     * Touch end handler for scrolling support
     */
    doTouchEnd: function doTouchEnd(timeStamp) {
      if (timeStamp instanceof Date) {
        timeStamp = timeStamp.valueOf();
      }

      if (typeof timeStamp !== "number") {
        throw new Error("Invalid timestamp value: " + timeStamp);
      }

      var self = this; // Ignore event when tracking is not enabled (no touchstart event on element)
      // This is required as this listener ('touchmove') sits on the document and not on the element itself.

      if (!self.__isTracking) {
        return;
      } // Not touching anymore (when two finger hit the screen there are two touch end events)


      self.__isTracking = false; // Be sure to reset the dragging flag now. Here we also detect whether
      // the finger has moved fast enough to switch into a deceleration animation.

      if (self.__isDragging) {
        // Reset dragging flag
        self.__isDragging = false; // Start deceleration
        // Verify that the last move detected was in some relevant time frame

        if (self.__isSingleTouch && self.options.animating && timeStamp - self.__lastTouchMove <= 100) {
          // Then figure out what the scroll position was about 100ms ago
          var positions = self.__positions;
          var endPos = positions.length - 1;
          var startPos = endPos; // Move pointer to position measured 100ms ago

          for (var i = endPos; i > 0 && positions[i] > self.__lastTouchMove - 100; i -= 3) {
            startPos = i;
          } // If start and stop position is identical in a 100ms timeframe,
          // we cannot compute any useful deceleration.


          if (startPos !== endPos) {
            // Compute relative movement between these two points
            var timeOffset = positions[endPos] - positions[startPos];
            var movedLeft = self.__scrollLeft - positions[startPos - 2];
            var movedTop = self.__scrollTop - positions[startPos - 1]; // Based on 50ms compute the movement to apply for each render step

            self.__decelerationVelocityX = movedLeft / timeOffset * (1000 / 60);
            self.__decelerationVelocityY = movedTop / timeOffset * (1000 / 60); // How much velocity is required to start the deceleration

            var minVelocityToStartDeceleration = self.options.paging || self.options.snapping ? 4 : 1; // Verify that we have enough velocity to start deceleration

            if (Math.abs(self.__decelerationVelocityX) > minVelocityToStartDeceleration || Math.abs(self.__decelerationVelocityY) > minVelocityToStartDeceleration) {
              // Deactivate pull-to-refresh when decelerating
              if (!self.__refreshActive) {
                self.__startDeceleration(timeStamp);
              }
            } else {
              self.options.scrollingComplete();
            }
          } else {
            self.options.scrollingComplete();
          }
        } else if (timeStamp - self.__lastTouchMove > 100) {
          self.options.scrollingComplete();
        }
      } // If this was a slower move it is per default non decelerated, but this
      // still means that we want snap back to the bounds which is done here.
      // This is placed outside the condition above to improve edge case stability
      // e.g. touchend fired without enabled dragging. This should normally do not
      // have modified the scroll positions or even showed the scrollbars though.


      if (!self.__isDecelerating) {
        if (self.__refreshActive && self.__refreshStart) {
          // Use publish instead of scrollTo to allow scrolling to out of boundary position
          // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
          self.__publish(self.__scrollLeft, -self.__refreshHeight, self.__zoomLevel, true);

          if (self.__refreshStart) {
            self.__refreshStart();
          }
        } else {
          if (self.__interruptedAnimation || self.__isDragging) {
            self.options.scrollingComplete();
          }

          self.scrollTo(self.__scrollLeft, self.__scrollTop, true, self.__zoomLevel); // Directly signalize deactivation (nothing todo on refresh?)

          if (self.__refreshActive) {
            self.__refreshActive = false;

            if (self.__refreshDeactivate) {
              self.__refreshDeactivate();
            }
          }
        }
      } // Fully cleanup list


      self.__positions.length = 0;
    },

    /*
    ---------------------------------------------------------------------------
    	PRIVATE API
    ---------------------------------------------------------------------------
    */

    /**
     * Applies the scroll position to the content element
     *
     * @param left {Number} Left scroll position
     * @param top {Number} Top scroll position
     * @param animate {Boolean?false} Whether animation should be used to move to the new coordinates
     */
    __publish: function __publish(left, top, zoom, animate) {
      var self = this; // Remember whether we had an animation, then we try to continue based on the current "drive" of the animation

      var wasAnimating = self.__isAnimating;

      if (wasAnimating) {
        core.effect.Animate.stop(wasAnimating);
        self.__isAnimating = false;
      }

      if (animate && self.options.animating) {
        // Keep scheduled positions for scrollBy/zoomBy functionality
        self.__scheduledLeft = left;
        self.__scheduledTop = top;
        self.__scheduledZoom = zoom;
        var oldLeft = self.__scrollLeft;
        var oldTop = self.__scrollTop;
        var oldZoom = self.__zoomLevel;
        var diffLeft = left - oldLeft;
        var diffTop = top - oldTop;
        var diffZoom = zoom - oldZoom;

        var step = function step(percent, now, render) {
          if (render) {
            self.__scrollLeft = oldLeft + diffLeft * percent;
            self.__scrollTop = oldTop + diffTop * percent;
            self.__zoomLevel = oldZoom + diffZoom * percent; // Push values out

            if (self.__callback) {
              self.__callback(self.__scrollLeft, self.__scrollTop, self.__zoomLevel);
            }
          }
        };

        var verify = function verify(id) {
          return self.__isAnimating === id;
        };

        var completed = function completed(renderedFramesPerSecond, animationId, wasFinished) {
          if (animationId === self.__isAnimating) {
            self.__isAnimating = false;
          }

          if (self.__didDecelerationComplete || wasFinished) {
            self.options.scrollingComplete();
          }

          if (self.options.zooming) {
            self.__computeScrollMax();

            if (self.__zoomComplete) {
              self.__zoomComplete();

              self.__zoomComplete = null;
            }
          }
        }; // When continuing based on previous animation we choose an ease-out animation instead of ease-in-out


        self.__isAnimating = core.effect.Animate.start(step, verify, completed, self.options.animationDuration, wasAnimating ? easeOutCubic : easeInOutCubic);
      } else {
        self.__scheduledLeft = self.__scrollLeft = left;
        self.__scheduledTop = self.__scrollTop = top;
        self.__scheduledZoom = self.__zoomLevel = zoom; // Push values out

        if (self.__callback) {
          self.__callback(left, top, zoom);
        } // Fix max scroll ranges


        if (self.options.zooming) {
          self.__computeScrollMax();

          if (self.__zoomComplete) {
            self.__zoomComplete();

            self.__zoomComplete = null;
          }
        }
      }
    },

    /**
     * Recomputes scroll minimum values based on client dimensions and content dimensions.
     */
    __computeScrollMax: function __computeScrollMax(zoomLevel) {
      var self = this;

      if (zoomLevel == null) {
        zoomLevel = self.__zoomLevel;
      }

      self.__maxScrollLeft = Math.max(self.__contentWidth * zoomLevel - self.__clientWidth, 0);
      self.__maxScrollTop = Math.max(self.__contentHeight * zoomLevel - self.__clientHeight, 0);
    },

    /*
    ---------------------------------------------------------------------------
    	ANIMATION (DECELERATION) SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Called when a touch sequence end and the speed of the finger was high enough
     * to switch into deceleration mode.
     */
    __startDeceleration: function __startDeceleration(timeStamp) {
      var self = this;

      if (self.options.paging) {
        var scrollLeft = Math.max(Math.min(self.__scrollLeft, self.__maxScrollLeft), 0);
        var scrollTop = Math.max(Math.min(self.__scrollTop, self.__maxScrollTop), 0);
        var clientWidth = self.__clientWidth;
        var clientHeight = self.__clientHeight; // We limit deceleration not to the min/max values of the allowed range, but to the size of the visible client area.
        // Each page should have exactly the size of the client area.

        self.__minDecelerationScrollLeft = Math.floor(scrollLeft / clientWidth) * clientWidth;
        self.__minDecelerationScrollTop = Math.floor(scrollTop / clientHeight) * clientHeight;
        self.__maxDecelerationScrollLeft = Math.ceil(scrollLeft / clientWidth) * clientWidth;
        self.__maxDecelerationScrollTop = Math.ceil(scrollTop / clientHeight) * clientHeight;
      } else {
        self.__minDecelerationScrollLeft = 0;
        self.__minDecelerationScrollTop = 0;
        self.__maxDecelerationScrollLeft = self.__maxScrollLeft;
        self.__maxDecelerationScrollTop = self.__maxScrollTop;
      } // Wrap class method


      var step = function step(percent, now, render) {
        self.__stepThroughDeceleration(render);
      }; // How much velocity is required to keep the deceleration running


      var minVelocityToKeepDecelerating = self.options.snapping ? 4 : 0.001; // Detect whether it's still worth to continue animating steps
      // If we are already slow enough to not being user perceivable anymore, we stop the whole process here.

      var verify = function verify() {
        var shouldContinue = Math.abs(self.__decelerationVelocityX) >= minVelocityToKeepDecelerating || Math.abs(self.__decelerationVelocityY) >= minVelocityToKeepDecelerating;

        if (!shouldContinue) {
          self.__didDecelerationComplete = true;
        }

        return shouldContinue;
      };

      var completed = function completed(renderedFramesPerSecond, animationId, wasFinished) {
        self.__isDecelerating = false;

        if (self.__didDecelerationComplete) {
          self.options.scrollingComplete();
        } // Animate to grid when snapping is active, otherwise just fix out-of-boundary positions


        self.scrollTo(self.__scrollLeft, self.__scrollTop, self.options.snapping);
      }; // Start animation and switch on flag


      self.__isDecelerating = core.effect.Animate.start(step, verify, completed);
    },

    /**
     * Called on every step of the animation
     *
     * @param inMemory {Boolean?false} Whether to not render the current step, but keep it in memory only. Used internally only!
     */
    __stepThroughDeceleration: function __stepThroughDeceleration(render) {
      var self = this; //
      // COMPUTE NEXT SCROLL POSITION
      //
      // Add deceleration to scroll position

      var scrollLeft = self.__scrollLeft + self.__decelerationVelocityX;
      var scrollTop = self.__scrollTop + self.__decelerationVelocityY; //
      // HARD LIMIT SCROLL POSITION FOR NON BOUNCING MODE
      //

      if (!self.options.bouncing) {
        var scrollLeftFixed = Math.max(Math.min(self.__maxDecelerationScrollLeft, scrollLeft), self.__minDecelerationScrollLeft);

        if (scrollLeftFixed !== scrollLeft) {
          scrollLeft = scrollLeftFixed;
          self.__decelerationVelocityX = 0;
        }

        var scrollTopFixed = Math.max(Math.min(self.__maxDecelerationScrollTop, scrollTop), self.__minDecelerationScrollTop);

        if (scrollTopFixed !== scrollTop) {
          scrollTop = scrollTopFixed;
          self.__decelerationVelocityY = 0;
        }
      } //
      // UPDATE SCROLL POSITION
      //


      if (render) {
        self.__publish(scrollLeft, scrollTop, self.__zoomLevel);
      } else {
        self.__scrollLeft = scrollLeft;
        self.__scrollTop = scrollTop;
      } //
      // SLOW DOWN
      //
      // Slow down velocity on every iteration


      if (!self.options.paging) {
        // This is the factor applied to every iteration of the animation
        // to slow down the process. This should emulate natural behavior where
        // objects slow down when the initiator of the movement is removed
        var frictionFactor = 0.95;
        self.__decelerationVelocityX *= frictionFactor;
        self.__decelerationVelocityY *= frictionFactor;
      } //
      // BOUNCING SUPPORT
      //


      if (self.options.bouncing) {
        var scrollOutsideX = 0;
        var scrollOutsideY = 0; // This configures the amount of change applied to deceleration/acceleration when reaching boundaries

        var penetrationDeceleration = self.options.penetrationDeceleration;
        var penetrationAcceleration = self.options.penetrationAcceleration; // Check limits

        if (scrollLeft < self.__minDecelerationScrollLeft) {
          scrollOutsideX = self.__minDecelerationScrollLeft - scrollLeft;
        } else if (scrollLeft > self.__maxDecelerationScrollLeft) {
          scrollOutsideX = self.__maxDecelerationScrollLeft - scrollLeft;
        }

        if (scrollTop < self.__minDecelerationScrollTop) {
          scrollOutsideY = self.__minDecelerationScrollTop - scrollTop;
        } else if (scrollTop > self.__maxDecelerationScrollTop) {
          scrollOutsideY = self.__maxDecelerationScrollTop - scrollTop;
        } // Slow down until slow enough, then flip back to snap position


        if (scrollOutsideX !== 0) {
          if (scrollOutsideX * self.__decelerationVelocityX <= 0) {
            self.__decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
          } else {
            self.__decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
          }
        }

        if (scrollOutsideY !== 0) {
          if (scrollOutsideY * self.__decelerationVelocityY <= 0) {
            self.__decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
          } else {
            self.__decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
          }
        }
      }
    }
  }; // Copy over members to prototype

  for (var key in members) {
    Scroller.prototype[key] = members[key];
  }
})();

var Scroller$1 = Scroller;

var StoryScroll = /*#__PURE__*/function () {
  // Stage Length = viewLength * STAGE_BOUNDARY
  // Scaled Design With
  // Scaled Design Length
  // First View Width = Content Width (No Crop)
  // First View Length = deviceHeight/(deviceWidth/designWidth)
  // Phsical device width
  // Phsical device height
  function StoryScroll(o) {
    _classCallCheck(this, StoryScroll);

    _defineProperty(this, "STAGE_BOUNDARY", 3);

    _defineProperty(this, "designWidth", void 0);

    _defineProperty(this, "designLength", void 0);

    _defineProperty(this, "contentWidth", void 0);

    _defineProperty(this, "contentLength", void 0);

    _defineProperty(this, "viewWidth", void 0);

    _defineProperty(this, "viewLength", void 0);

    _defineProperty(this, "deviceWidth", void 0);

    _defineProperty(this, "deviceHeight", void 0);

    _defineProperty(this, "maxScroll", 10000);

    _defineProperty(this, "storyPosition", 0);

    _defineProperty(this, "prevPool", []);

    _defineProperty(this, "stagePool", []);

    _defineProperty(this, "stagePoolByLen", []);

    _defineProperty(this, "stageZIndexes", {});

    _defineProperty(this, "nextPool", []);

    _defineProperty(this, "currentZIndex", 0);

    this._defaultSetting(o || {});

    this._createContainer(o);

    this._windowResize();

    window.addEventListener('resize', this._windowResize.bind(this), false);
  }

  _createClass(StoryScroll, [{
    key: "chapter",
    value: function chapter(o, _parent) {
      var chapter = new PIXI.Container();

      this._setProps(chapter, o);

      this._setChapterChildren(chapter);

      this._setActions(chapter);

      this._ship(chapter, _parent);

      return chapter;
    }
  }, {
    key: "sprite",
    value: function sprite(imgsrc, o, _parent) {
      var sprite = this._createSprite(imgsrc);

      this._setProps(sprite, o);

      this._setActions(sprite);

      this._ship(sprite, _parent);

      return sprite;
    }
  }, {
    key: "spriteAnimated",
    value: function spriteAnimated(imgsrcs, o, autoPlay, _parent) {
      var sprite = this._createAnimatedSprite(imgsrcs, autoPlay);

      this._setProps(sprite, o);

      this._setActions(sprite);

      this._ship(sprite, _parent);

      if (autoPlay !== false) sprite.play();
      return sprite;
    }
  }, {
    key: "graphic",
    value: function graphic(o, _parent) {
      var graphic = new PIXI.Graphics();

      this._setProps(graphic, o);

      this._setActions(graphic);

      this._ship(graphic, _parent);

      return graphic;
    }
  }, {
    key: "text",
    value: function text(textCont, o, style_o, _parent) {
      var style = new PIXI.TextStyle();

      this._setProps(style, style_o);

      var text = new PIXI.Text(textCont, style);

      this._setProps(text, o);

      this._setActions(text);

      this._ship(text, _parent);

      return text;
    }
  }, {
    key: "actionByStep",
    value: function actionByStep(obj, props, section, triggerPosition) {
      if (triggerPosition === undefined) triggerPosition = this._getSpriteTriggerPosition(obj);
      if (!obj.actions) obj.actions = {};

      var hash = this._createHash(8);

      obj.actions[hash] = {
        action: {
          type: 'section',
          props: props,
          section: section,
          triggerPosition: triggerPosition
        }
      };
      this.sectionActions.push(_objectSpread2({
        sprite: obj,
        hash: hash
      }, obj.actions[hash].action));
      return obj;
    }
  }, {
    key: "setPin",
    value: function setPin(obj, triggerPosition, section) {
      if (!obj.actions) obj.actions = {};
      if (!section) section = this.maxScroll + this.viewLength - obj[this.scrollDirection];
      obj.pinSection = section;

      var hash = this._createHash(8);

      obj.actions[hash] = {
        action: {
          type: 'pin',
          section: section,
          triggerPosition: triggerPosition
        }
      };
      this.pinActions.push(_objectSpread2({
        sprite: obj,
        hash: hash
      }, obj.actions[hash].action));
      return obj;
    }
  }, {
    key: "stop",
    value: function stop() {
      // Todo: bug when resize window
      this.scroller.options.scrollingX = false;
      this.scroller.options.scrollingY = false;
    }
  }, {
    key: "play",
    value: function play() {
      // Todo: support auto play
      // Todo: support auto play by pressing screen
      this.scroller.options.scrollingX = true;
      this.scroller.options.scrollingY = true;
    }
  }, {
    key: "_scrollerCallback",
    value: function _scrollerCallback(left, top, zoom) {
      var _this = this;

      var Self = this;
      this.scrollPosition = this._getSrollPosition(left, top);
      this.storyPosition = this.scrollPosition / this._scale;
      this.scrollDirection == 'y' ? this.containerScroll.y = -this.storyPosition : this.containerScroll.x = -this.storyPosition; // Get Stage

      goonStage.call(this);
      leaveStage.call(this);
      recallStage.call(this);
      pulldownStage.call(this); // Run Actions

      this.sectionActions.forEach(function (action) {
        triggerActionByStep.call(_this, action);
      });
      this.pinActions.forEach(function (action) {
        triggerActionSetPin.call(_this, action);
      });

      if (this.debug) {
        if (this.debug == 'all') {
          console.log('top:', top);
          console.log('left:', left);
          console.log('scrollPosition :', this.scrollPosition);
        } else console.log('scrollPosition :', this.scrollPosition);
      }

      function goonStage() {
        var _this2 = this;

        if (this.nextPool.length == 0) return;

        if (this.nextPool[0][this.scrollDirection] < this.storyPosition + this.viewLength + (this.STAGE_BOUNDARY - 1) / 2 * this.viewLength) {
          var comingObj = this.nextPool.shift();
          this.containerScroll.addChild(comingObj);
          this.stageZIndexes[comingObj.zIndex] = true;
          this.stagePool.push(comingObj);
          this.stagePoolByLen.push(comingObj);
          this.stagePoolByLen.sort(function (a, b) {
            return a[_this2.scrollDirection] + a[_this2.scrollDirection ? 'width' : 'height'] - (b[_this2.scrollDirection] + b[_this2.scrollDirection ? 'width' : 'height']);
          });

          _recoverPausedRepeatAction(comingObj);

          goonStage.call(this);
        }
      }

      function leaveStage() {
        _delFrontUnstaged(this.stagePoolByLen);

        if (this.stagePoolByLen.length == 0) return;

        if (this.stagePoolByLen[0][this.scrollDirection] + _getStageObjWidth(this.stagePoolByLen[0]) < this.storyPosition - (this.STAGE_BOUNDARY - 1) / 2 * this.viewLength) {
          var leavingObj = this.stagePoolByLen.shift();
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

      function recallStage() {
        var _this3 = this;

        if (this.prevPool.length == 0) return;

        if (this.prevPool[this.prevPool.length - 1][this.scrollDirection] + _getStageObjWidth(this.prevPool[this.prevPool.length - 1]) > this.storyPosition - (this.STAGE_BOUNDARY - 1) / 2 * this.viewLength) {
          var comingObj = this.prevPool.pop();
          this.containerScroll.addChild(comingObj);
          this.stageZIndexes[comingObj.zIndex] = true;
          this.stagePoolByLen.unshift(comingObj);
          this.stagePool.unshift(comingObj);
          this.stagePool.sort(function (a, b) {
            return a[_this3.scrollDirection] - b[_this3.scrollDirection];
          });

          _recoverPausedRepeatAction(comingObj);

          recallStage.call(this);
        }
      }

      function pulldownStage() {
        _delBehindUnstaged(this.stagePool);

        if (this.stagePool.length == 0) return;

        if (this.stagePool[this.stagePool.length - 1][this.scrollDirection] > this.storyPosition + this.viewLength + (this.STAGE_BOUNDARY - 1) / 2 * this.viewLength) {
          var leavingObj = this.stagePool.pop();
          this.containerScroll.removeChild(leavingObj);
          delete this.stageZIndexes[leavingObj.zIndex];
          this.nextPool.unshift(leavingObj);

          _pauseRepeatAction(leavingObj);

          pulldownStage.call(this);
        }

        function _delBehindUnstaged(pool) {
          if (pool.length == 0) return;
          if (_isOnStage(pool[pool.length - 1])) return;
          pool.shift();

          _delBehindUnstaged(pool);
        }
      }

      function _getStageObjWidth(obj) {
        var leavingObjWidth = obj[Self.scrollDirection ? 'width' : 'height'];
        if (obj.pinSection) leavingObjWidth += obj.pinSection;
        return leavingObjWidth;
      }

      function _pauseRepeatAction(obj) {
        if (obj.tweens) obj.tweens.forEach(function (tween) {
          tween.pausedAtLeaving = tween.paused();
          if (!tween.pausedAtLeaving) tween.pause();
        });
      }

      function _recoverPausedRepeatAction(obj) {
        if (obj.tweens) obj.tweens.forEach(function (tween) {
          if (!tween.pausedAtLeaving) tween.play();
        });
      }

      function _isOnStage(obj) {
        if (Self.stageZIndexes[obj.zIndex]) return true;
        return false;
      }

      function triggerActionByStep(action) {
        if (action.sprite._destroyed) return;
        if (!_isOnStage(action.sprite)) return;
        var storedAction = action.sprite.actions[action.hash];

        if (action.triggerPosition <= this.storyPosition && this.storyPosition < action.triggerPosition + action.section) {
          setProps('during', storedAction, action, this.storyPosition);
        } else if (this.storyPosition >= action.triggerPosition + action.section) {
          // 强制达到最终态
          setProps('after', storedAction, action, this.storyPosition);
        } else if (this.storyPosition < action.triggerPosition) {
          // 强制回复最终态
          setProps('before', storedAction, action, this.storyPosition);
        } // ToDo: before, after在多个动画区间bug，after>storyPosition 且 < 下一个区间的triggerPosition
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
        if (action.sprite._destroyed) return;
        if (!_isOnStage(action.sprite)) return;
        var storedAction = action.sprite.actions[action.hash];
        storedAction.originProps = storedAction.originProps || {};
        if (storedAction.originProps[this.scrollDirection] === undefined) storedAction.originProps[this.scrollDirection] = action.sprite[this.scrollDirection];
        action.sprite[this.scrollDirection] = storedAction.originProps[this.scrollDirection] - action.triggerPosition + this.storyPosition;
      }
    }
  }, {
    key: "_defaultSetting",
    value: function _defaultSetting(o) {
      var _this4 = this;

      // Parameters
      this.scrollDirection = o.direction || 'y';
      this.designWidth = o.width || 750;
      this.designLength = o.length || 10000;
      this.containerSelector = o.container;
      this.backgroundColor = o.bgcolor;
      this.useLoader = o.loader || false;
      this.progressive = o.progressive || false;
      this.antialias = o.antialias || false;
      this.debug = o.debug || false; // init

      this._clientWidth = window.innerWidth || document.documentElement.clientWidth;
      this._clientHeight = window.innerHeight || document.documentElement.clientHeight;
      this.designOrientation = this.scrollDirection == 'y' ? 'portrait' : 'landscape';
      this.pinActions = [];
      this.sectionActions = [];
      this.loaderList = [];
      this.scroller = new Scroller$1(function (left, top, zoom) {
        return _this4._scrollerCallback(left, top, zoom);
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
        _this4.scroller.doTouchStart(e.touches, e.timeStamp);

        mousedown = true;
      }, false);
      document.addEventListener("touchmove", function (e) {
        if (!mousedown) {
          return;
        }

        _this4.scroller.doTouchMove(e.touches, e.timeStamp);

        mousedown = true;
      }, false);
      document.addEventListener("touchend", function (e) {
        if (!mousedown) {
          return;
        }

        _this4.scroller.doTouchEnd(e.timeStamp);

        mousedown = false;
      }, false);
    }
  }, {
    key: "_createContainer",
    value: function _createContainer(o) {
      var _this5 = this;

      this.app = new PIXI.Application({
        backgroundColor: this.backgroundColor,
        antialias: this.antialias,
        resolution: 1
      });
      this.loader = this.app.loader;

      this.load = function () {
        return _this5.app.loader.load.call(_this5.app.loader);
      };

      this.loader.onComplete.add(function (loader) {
        return _this5.useLoader = false;
      });

      if (this.containerSelector === undefined) {
        var main = document.body.appendChild(document.createElement('main'));
        main.appendChild(this.app.view);
      } else {
        document.querySelector(this.containerSelector).appendChild(this.app.view);
      }

      this.containerFitWindow = new PIXI.Container();
      this.containerFitWindow.pivot.set(0, 0);
      this.containerScroll = new PIXI.Container();
      this.containerScroll.name = 'story';
      if (this.progressive) this.containerScroll.sortableChildren = true;
      this.containerFitWindow.addChild(this.containerScroll);
      this.app.stage.addChild(this.containerFitWindow);
      this.app.view.style.transformOrigin = "0 0";
    }
  }, {
    key: "_windowResize",
    value: function _windowResize() {
      var _this6 = this;

      this.deviceOrientation = this._getDeviceOrientation();
      this.deviceWidth = this.deviceOrientation == 'portrait' ? this._clientWidth : this._clientHeight;
      this.deviceHeight = this.deviceOrientation == 'portrait' ? this._clientHeight : this._clientWidth;
      this._scalePrev = this._scale;
      this._scale = this.deviceWidth / this.designWidth;
      this.maxScroll = this.designLength - this.deviceHeight;
      this.contentWidth = this.deviceWidth;
      this.contentLength = this.designLength * this._scale;
      this.viewWidth = this.designWidth;
      this.viewLength = this.deviceHeight / this._scale;

      if (this.antialias) {
        this._setContainerRotation(this.containerFitWindow, this.designOrientation, this.deviceOrientation, this.deviceWidth / this._scale);

        this.app.view.style.transform = "scale(" + this._scale + ")";
        this.app.renderer.resize(this._clientWidth / this._scale, this._clientHeight / this._scale);
      } else {
        this._setContainerRotation(this.containerFitWindow, this.designOrientation, this.deviceOrientation, this.deviceWidth);

        this.containerFitWindow.scale.set(this._scale, this._scale);
        this.app.renderer.resize(this._clientWidth, this._clientHeight);
      }

      var scrollerContentWidth = this.deviceOrientation == 'portrait' ? this.deviceWidth : this.contentLength;
      var scrollerContentHeight = this.deviceOrientation == 'portrait' ? this.contentLength : this.deviceWidth;
      var scrollerLeft = this.deviceOrientation == 'portrait' ? 0 : this.scrollPosition / this._scalePrev * this._scale || 0;
      var scrollerTop = this.deviceOrientation !== 'portrait' ? 0 : this.scrollPosition / this._scalePrev * this._scale || 0;
      setTimeout(function () {
        _this6.scroller.setDimensions(_this6._clientWidth, _this6._clientHeight, scrollerContentWidth, scrollerContentHeight); // Todo: enableX Y scroll


        _this6.scroller.scrollTo(scrollerLeft, scrollerTop, false);
      }, 200);
    }
  }, {
    key: "_getDeviceOrientation",
    value: function _getDeviceOrientation() {
      if (weixin) {
        this._clientWidth = document.documentElement.clientWidth || window.innerWidth;
        this._clientHeight = document.documentElement.clientHeight || window.innerHeight; // ToTest: 测试好像现在微信不需要特别判断了？

        if (window.orientation === 180 || window.orientation === 0) {
          return 'portrait';
        } else if (window.orientation === 90 || window.orientation === -90) {
          return 'landscape';
        }
      } else if (weibo) {
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
  }, {
    key: "_setContainerRotation",
    value: function _setContainerRotation(container, designOrientation, deviceOrientation, deviceWidth) {
      var rotationMap = {
        design_portrait: {
          device_portrait: {
            rotation: 0,
            offsetX: 0,
            offsetY: 0
          },
          device_landscape: {
            rotation: -Math.PI / 2,
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
      };
      container.rotation = rotationMap['design_' + designOrientation]['device_' + deviceOrientation]['rotation'];
      container.position.set(rotationMap['design_' + designOrientation]['device_' + deviceOrientation]['offsetX'], rotationMap['design_' + designOrientation]['device_' + deviceOrientation]['offsetY']);
    }
  }, {
    key: "_getSpriteTriggerPosition",
    value: function _getSpriteTriggerPosition(sprite) {
      var spritePosition = this.scrollDirection == 'x' ? sprite.x : sprite.y;
      if (sprite.parent && sprite.parent.name != 'story') return spritePosition + this._getSpriteTriggerPosition(sprite.parent);
      return spritePosition - this.pageHeight * 2 / 3;
    }
  }, {
    key: "_getSrollPosition",
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
    key: "_createSprite",
    value: function _createSprite(imgsrc) {
      var spriteInstance = new PIXI.Sprite.from(PIXI.Texture.EMPTY);
      var loader = new PIXI.Loader();

      if (!this.useLoader) {
        spriteInstance.texture = PIXI.Texture.from(imgsrc);
      } else if (this.loader.resources[imgsrc]) {
        this.loader.onComplete.add(function (loader, resources) {
          return spriteInstance.texture = resources[imgsrc].texture;
        });
      } else {
        this.loader.add(imgsrc, function (resource) {
          return spriteInstance.texture = resource.texture;
        });
      } // this.loaderList.push(imgsrc);


      return spriteInstance;
    }
  }, {
    key: "_createAnimatedSprite",
    value: function _createAnimatedSprite(imgsrcs, autoPlay) {
      var _this7 = this;

      var animatedSpriteInstance = new PIXI.AnimatedSprite([PIXI.Texture.EMPTY]);

      if (_typeof(imgsrcs) == 'object' && imgsrcs.length > 0) {
        var textures = [];

        if (!this.useLoader) {
          imgsrcs.forEach(function (imgsrc) {
            textures.push(PIXI.Texture.from(imgsrc));
          });
          animatedSpriteInstance.textures = textures;
        } else {
          imgsrcs.forEach(function (imgsrc) {
            if (!_this7.loader.resources[imgsrc]) _this7.loader.add(imgsrc);
          });
          this.loader.onComplete.add(function (loader) {
            imgsrcs.forEach(function (imgsrc) {
              textures.push(loader.resources[imgsrc].texture);
            });
            animatedSpriteInstance.textures = textures;
            if (autoPlay !== false) animatedSpriteInstance.play();
          });
        }
      } else {
        var setAnimatedSpriteTextures = function setAnimatedSpriteTextures(animatedSpriteInstance, resource, autoPlay) {
          var textures = [];

          for (var imgkey in resource.data.frames) {
            var texture = PIXI.Texture.from(imgkey);
            var time = resource.data.frames[imgkey].duration;
            textures.push(time ? {
              texture: texture,
              time: time
            } : texture);
          }

          animatedSpriteInstance.textures = textures;
          if (autoPlay !== false) animatedSpriteInstance.play();
        };

        if (!this.useLoader) {
          var loader = new PIXI.Loader();
          loader.add(imgsrcs).load(function (loader, resources) {
            return setAnimatedSpriteTextures(animatedSpriteInstance, resources[imgsrcs], autoPlay);
          });
        } else {
          if (!this.loader.resources[imgsrcs]) {
            this.app.loader.add(imgsrcs, function (resource) {
              return setAnimatedSpriteTextures(animatedSpriteInstance, resource, autoPlay);
            });
          } else {
            this.loader.onComplete.add(function (loader, resources) {
              return setAnimatedSpriteTextures(animatedSpriteInstance, resources[imgsrcs], autoPlay);
            });
          }
        }
      }

      return animatedSpriteInstance;
    }
  }, {
    key: "_setProps",
    value: function _setProps(obj, props) {
      if (props) {
        for (var prop in props) {
          if (props.hasOwnProperty(prop)) {
            obj[prop] = props[prop];
          }
        }
      }

      obj.zIndex = this.currentZIndex++;
      return obj;
    }
  }, {
    key: "_setChapterChildren",
    value: function _setChapterChildren(chapter) {
      var _this8 = this;

      chapter.sprite = function (imgsrc, o) {
        return _this8.sprite(imgsrc, o, chapter);
      };

      chapter.spriteAnimated = function (imgsrcs, o, autoPlay) {
        return _this8.spriteAnimated(imgsrcs, o, autoPlay, chapter);
      };

      chapter.graphic = function (o) {
        return _this8.graphic(o, chapter);
      };

      chapter.text = function (textCont, o, style_o) {
        return _this8.text(textCont, o, style_o, chapter);
      };

      chapter.chapter = function (o) {
        return _this8.chapter(o, chapter);
      };
    }
  }, {
    key: "_setActions",
    value: function _setActions(obj) {
      var _this9 = this;

      obj.actionByStep = function (props, section, triggerPosition) {
        return _this9.actionByStep(obj, props, section, triggerPosition);
      };

      obj.setPin = function (triggerPosition, section) {
        return _this9.setPin(obj, triggerPosition, section);
      };
    }
  }, {
    key: "_ship",
    value: function _ship(obj, _parent) {
      var _this10 = this;

      if (_parent) {
        _parent.addChild(obj);
      } else if (!this.progressive) {
        this.containerScroll.addChild(obj);
      } else {
        this.nextPool.push(obj);
        this.nextPool.sort(function (a, b) {
          return a[_this10.scrollDirection] - b[_this10.scrollDirection];
        });
      }
    }
  }, {
    key: "_createHash",
    value: function _createHash(hashLength) {
      return Array.from(Array(Number(hashLength) || 24), function () {
        return Math.floor(Math.random() * 36).toString(36);
      }).join('');
    }
  }]);

  return StoryScroll;
}();

module.exports = StoryScroll;

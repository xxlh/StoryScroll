(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', '@pixi/constants', '@pixi/math', '@pixi/runner', '@pixi/settings', '@pixi/ticker', '@pixi/display', '@pixi/core', '@pixi/loaders', '@pixi/sprite', '@pixi/app', '@pixi/graphics', '@pixi/sprite-animated', '@pixi/spritesheet', '@pixi/text', '@pixi/utils', '@pixi/interaction'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('@pixi/constants'), require('@pixi/math'), require('@pixi/runner'), require('@pixi/settings'), require('@pixi/ticker'), require('@pixi/display'), require('@pixi/core'), require('@pixi/loaders'), require('@pixi/sprite'), require('@pixi/app'), require('@pixi/graphics'), require('@pixi/sprite-animated'), require('@pixi/spritesheet'), require('@pixi/text'), require('@pixi/utils'), require('@pixi/interaction'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.constants, global.math, global.runner, global.settings, global.ticker, global.display, global.core, global.loaders, global.sprite, global.app, global.graphics, global.spriteAnimated, global.spritesheet, global.text, global.utils, global.interaction);
    global.pixi = mod.exports;
  }
})(this, function (exports, _constants, _math, _runner, _settings, _ticker, _display, _core, _loaders, _sprite, _app, _graphics, _spriteAnimated, _spritesheet, _text, _utils, _interaction) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.interaction = exports.utils = undefined;
  Object.keys(_constants).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _constants[key];
      }
    });
  });
  Object.keys(_math).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _math[key];
      }
    });
  });
  Object.keys(_runner).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _runner[key];
      }
    });
  });
  Object.keys(_settings).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _settings[key];
      }
    });
  });
  Object.keys(_ticker).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _ticker[key];
      }
    });
  });
  Object.keys(_display).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _display[key];
      }
    });
  });
  Object.keys(_core).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _core[key];
      }
    });
  });
  Object.keys(_loaders).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _loaders[key];
      }
    });
  });
  Object.keys(_sprite).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _sprite[key];
      }
    });
  });
  Object.keys(_app).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _app[key];
      }
    });
  });
  Object.keys(_graphics).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _graphics[key];
      }
    });
  });
  Object.keys(_spriteAnimated).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _spriteAnimated[key];
      }
    });
  });
  Object.keys(_spritesheet).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _spritesheet[key];
      }
    });
  });
  Object.keys(_text).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _text[key];
      }
    });
  });

  var utils = _interopRequireWildcard(_utils);

  var interaction = _interopRequireWildcard(_interaction);

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

  exports.utils = utils;
  exports.interaction = interaction;

  _core.Renderer.registerPlugin('batch', _core.BatchRenderer);
  _core.Renderer.registerPlugin('interaction', interaction.InteractionManager);

  // Application plugins

  _app.Application.registerPlugin(_loaders.AppLoaderPlugin);

  _app.Application.registerPlugin(_ticker.TickerPlugin);

  // Loader plugins

  _loaders.Loader.registerPlugin(_spritesheet.SpritesheetLoader);
});
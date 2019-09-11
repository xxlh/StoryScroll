(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.StoryScrollTest = mod.exports;
  }
})(this, function () {
  'use strict';

  // import StoryScroll from './StoryScroll';

  // let story = new StoryScroll ({
  // 	control: 'manual',	// auto,manual
  // 	crop: 'longside',	// false, none,longside,shortside
  // 	cropOrigin: 'top',	// center, top,bottom, left,right
  // 	// viewOrientation: 'landscape',
  // 	// scrollDirection: 'x',
  // 	maxScroll: 2000
  // });

  test('two plus two is four', function () {
    expect(2 + 2).toBe(4);
  });
});
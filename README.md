# StoryScroll
The javascript library for story scroll interactions with html5 canvas.

## Installation

__Option 1: npm__  
If you prefer the [node package manager](https://www.npmjs.com/package/storyscroll), feel free to use it.  
Keep in mind that like with bower non-crucial files will be ignored (see above).

```bash
npm install storyscroll
```

__Option 2: Bower__   
Please mind that since they are not core dependencies, you will have to add frameworks like GSAP, PIXI manually, should you choose to use them.

Include the *core* library in your HTML file:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.1.3/pixi.min.js"></script>
<script src="../lib/storyscroll.min.js"></script>
```

## Usage

```javascript
import StoryScroll from 'storyscroll'

// init controller
const story = new StoryScroll ({
	direction: 'x',
	width: 750,
	length: 20000,
	bgcolor: 0x000000
});

// create a sprite
const sprite = story.sprite(require('./images/sprite.png'), {x:40, y:540}).act({x: 0,y:400}, 0.8);
```

## Plugins

### Loader

Support to setup a progressor with PIXI.Loader.

```javascript
// init controller
const story = new StoryScroll ({
	loader: true
});

// create a sprite
const sprite1 = story.sprite(require('./images/sprite.png'), {x:40, y:540}).act({x: 0,y:400}, 0.8);
const sprite2 = story.sprite(require('./images/sprite.png'), {x:80, y:540}).act({x: 9,y:400}, 0.8);

// start loading for all sprites ABOVE
story.loader.on("progress", (loader, resource) => {
	console.log("Progress: " + (loader.progress|0) + "%");
})
.load((loader, resource) => {
	console.log("All files loaded");
});
```

### Action Plugin

Support to do .action() with TweenMax animation.

```javascript
import {act, action} from 'storyscroll/action';

// Add a action to trigger by scroll to some position
sprite.action({x:100, reverse:false, onComplete:function(){
	sprite.act({alpha:0}, .3);	// act animation immediately
}}, 3, 100);
```

### Projection Plugin

Support to do .sprite2d() with PIXI.projection.

```javascript
import {sprite2d, chapter2d} from 'storyscroll/projection'

// create a 2D sprite
const chapter2d = story.chapter2d({x:100, y:10});	
const sprite2d = chapter2d.sprite2d(require('./images/sprite_2d.png'),{x:900, y: 30, affine:'AXIS_X', factor:1})
```

## Browser Support

StoryScroll aims to support all major browsers even in older versions:  
Firefox 26+, Chrome 30+, Safari 5.1+, Opera 10+, IE 9+

## About the Author

I am a creative coder based in Xiamen, China.

[Learn more on my website](http://ieexx.com) or [Follow me on Weibo](http://weibo.com/1225xlh)

## License

StoryScroll is dual licensed under the GPL.  
For more information click [here](https://github.com/xxlh/StoryScroll/blob/master/LICENSE).

## Thanks

This library was made possible by many people who have supported it with passion, donations or advice. Special thanks go out to: [Esone MacGhilleseatheanaich](https://github.com/ee01).

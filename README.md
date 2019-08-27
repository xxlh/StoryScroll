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
<script src="src//StoryScroll.js"></script>
```

## Usage

```javascript
import StoryScroll from 'storyscroll'

// init controller
window.story = new StoryScroll ({
	crop: 'longside',	// false, none,longside,shortside
	cropOrigin: 'top',	// center, top,bottom, left,right
	orientation: 'landscape',
	scrollDirection: 'x',
	maxScroll: 20000,
	backgroundColor: 0x000000
});

// create a sprite
let sprite = story.sprite(require('./images/sprite.png'), {x:40, y:540}).act({x: 0,y:400}, 0.8);
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

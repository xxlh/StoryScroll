import StoryScroll from 'storyscroll';
import TweenMax from "gsap/TweenMax";


StoryScroll.prototype.pointActions = [];

const originSetActions = StoryScroll.prototype._setActions;
StoryScroll.prototype._setActions = function(obj) {
	originSetActions.call(this, obj);
	obj.act = (props, duration) => this.act(obj, props, duration);
	obj.action = (props, duration, triggerPosition) => this.action(obj, props, duration, triggerPosition);
}

StoryScroll.prototype._getCommonProps = function(obj, props) {
	let commonProps = {};
	for (const prop in props) {
		if (!obj[prop] && typeof props[prop] != 'function') commonProps[prop] = props[prop];
	}
	return commonProps;
}


export let act = (() => {
	StoryScroll.prototype.act = function(obj, props, duration) {
		let commonProps = this._getCommonProps(obj, props);
		obj.tweens = obj.tweens || [];
		for (const prop in props) {
			if (typeof props[prop] == 'object' && obj[prop]) {
				const tweenInstance = TweenMax.to(obj[prop], duration, {...props[prop], ...commonProps});
				if (commonProps.repeat == -1) obj.tweens.push(tweenInstance);
				delete props[prop];
			}
		}
		const tweenInstance = TweenMax.to(obj, duration, props);
		if (props.repeat == -1) obj.tweens.push(tweenInstance);
	}

	return StoryScroll.prototype.act;
})()


export let action = (() => {
	StoryScroll.prototype.action = function(obj, props, duration, triggerPosition) {
		if (triggerPosition === undefined) triggerPosition = this._getSpriteTriggerPosition(obj);
		if (!obj.actions) obj.actions = {};

		let commonProps = this._getCommonProps(obj, props);
		for (const prop in props) {
			if (typeof props[prop] == 'object' && obj[prop]) {
				let hash = this._createHash(8);
				obj.actions[hash] = {action: {type:'point', propsRoot:prop, props:{...props[prop], ...commonProps}, duration, triggerPosition}};
				this.pointActions.push({sprite:obj, hash, ...obj.actions[hash].action});
				delete props[prop];
			}
		}

		let hash = this._createHash(8);
		obj.actions[hash] = {action: {type:'point', props, duration, triggerPosition}};
		this.pointActions.push({sprite:obj, hash, ...obj.actions[hash].action});
		return obj;
	}

	const originScrollerCallback = StoryScroll.prototype._scrollerCallback;
	StoryScroll.prototype._scrollerCallback = function(left, top, zoom) {
		originScrollerCallback.call(this, left, top, zoom);
		this.pointActions.forEach(action => {
			triggerActionByPosition.call(this, action);
		});

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
					action.sprite.tweens = action.sprite.tweens || [];
					if (action.props.repeat == -1) action.sprite.tweens.push(tweenInstance);
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
	}

	return StoryScroll.prototype.action;
})()


export default {act, action}
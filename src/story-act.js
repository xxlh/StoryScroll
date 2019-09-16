import StoryScroll from 'storyscroll';
import {TweenMax} from "gsap/TweenMax";
export default(() => {
	const originSetActions = StoryScroll.prototype._setActions;
	StoryScroll.prototype._setActions = function(obj) {
		originSetActions.call(this, obj);
		obj.act = (props, duration) => this.act(obj, props, duration);
		obj.action = (props, duration, triggerPosition) => this.action(obj, props, duration, triggerPosition);
	}

	/* act */
	StoryScroll.prototype.act = function(obj, props, duration) {
		let commonProps = this._getCommonProps(obj, props);
		for (const prop in props) {
			if (typeof props[prop] == 'object' && obj[prop]) {
				TweenMax.to(obj[prop], duration, {...props[prop], ...commonProps});
				delete props[prop];
			}
		}
		TweenMax.to(obj, duration, props);
	}

	/* action */
	StoryScroll.prototype.action = function(obj, props, duration, triggerPosition) {
		if (triggerPosition === undefined) triggerPosition = this._getSpriteTriggerPosition(obj);
		if (!obj.actions) obj.actions = {};

		let commonProps = this._getCommonProps(obj, props);
		for (const prop in props) {
			if (typeof props[prop] == 'object' && obj[prop]) {
				let hash = this._createHash(8);
				obj.actions[hash] = {action: {type:'point', propsRoot:prop, props:{...props[prop], ...commonProps}, duration, triggerPosition}};
				this.actions.push({sprite:obj, hash, ...obj.actions[hash].action});
				delete props[prop];
			}
		}

		let hash = this._createHash(8);
		obj.actions[hash] = {action: {type:'point', props, duration, triggerPosition}};
		this.actions.push({sprite:obj, hash, ...obj.actions[hash].action});
		return obj;
	}

	const originScrollerCallback = StoryScroll.prototype._scrollerCallback;
	StoryScroll.prototype._scrollerCallback = function(left, top, zoom) {
		originScrollerCallback.call(this, left, top, zoom);
		this.actions.forEach(action => {
			if(action.type == 'point')
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
})()
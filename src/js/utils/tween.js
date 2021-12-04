import { Tween, Easing } from '@tweenjs/tween.js';

export class TWEEN {
  constructor(animations = null, props = {}) {

    this.tweens = [];

    this._init(animations, props);
  }

  _init(animations, props) {
    const start = this._createTween(animations, props);
    this.tweens.push(start);
  }

  _createTween(animations = null, props = {}) {
    if (!animations) {
      const tween = this._initSingleTween({target: null, to: null}, props);
      return tween;
    }
    else if  (Array.isArray(animations)) {
      const {
        onStart = () => {},
        onComplete = () => {},
        onUpdate = () => {},
      } = props;
      const parallelTweens = [];
      animations.forEach((el) => {
        const tween = this._initSingleTween(el, props, false);
        parallelTweens.push(tween)
      });
      if (parallelTweens.length > 1) {
        parallelTweens[0].onStart((...tweenData) => {
          parallelTweens.slice(1).forEach(el => {
            el.start();
          });
          onStart(...tweenData);
        })
      }
      else {
        parallelTweens[0].onStart(onStart);
      }
      parallelTweens[0].onComplete(onComplete);
      parallelTweens[0].onUpdate(onUpdate);
      return parallelTweens[0];
    }
    else if (animations.target && animations.to) {
      const tween = this._initSingleTween(animations, props);
      return tween;
    }
  }

  _initSingleTween(obj, props, onOptions = true) {
    const { target, to } = obj;

    const {
      time = 0,
      delay = 0,
      easing = 'linear',
      repeat = 0,
      autoStart = false,
      onStart = () => {},
      onComplete = () => {},
      onUpdate = () => {},
    } = props;

    const ease = this.parseEasing(easing);

    const tween = new Tween(target);
    tween.to(to, time);
    tween.delay(delay);
    tween.easing(ease);
    tween.repeat(repeat === -1 ? Infinity : repeat);

    if (onOptions) {
      tween.onStart(onStart);
      tween.onComplete(onComplete);
      tween.onUpdate(onUpdate);
    }

    autoStart && tween.start();

    return tween;
  }

  next(animations = null, props = {}) {
    const { tweens } = this;
    if (tweens.length === 0) return;
    const newTween = this._createTween(animations, props);
    newTween.nameID = Math.random() * 100;
    const last = tweens.slice(-1)[0];
    last.chain(newTween);
    tweens.push(newTween);

    return this;
  }

  start() {
    this.tweens[0].start();
  }

  parseEasing(str) {
    if (typeof str !== "string") {
      return Easing.Linear.None;
    }
    let func;
    const arr = str.replace(/([A-Z])/g, ':$1').split(':');
    const name = arr[0];
    switch (name) {
      case 'linear':
        return Easing.Linear.None;

      case 'cubic' || 'cub':
        func = Easing.Cubic;
        break;

      case 'sin' || 'sine' || 'sinusoidal':
        func = Easing.Sinusoidal;
        break;

      case 'bounce':
        func = Easing.Bounce;
        break;

      case 'quad' || 'quadratic':
        func = Easing.Quadratic;
        break;

      case 'quartic':
        func = Easing.Quartic;
        break;

      case 'quintic':
        func = Easing.Quintic;
        break;

      case 'elastic':
        func = Easing.Elastic;
        break;

      case 'exponential' || 'expo':
        func = Easing.Exponential;
        break;

      case 'circular' || 'circ':
        func = Easing.Circular;
        break;

      case 'back':
        func = Easing.Back;
        break;

      default:
        return Easing.Linear.None;
    }

    const end = arr.slice(1, 3).join('');
    if (func[end]) {
      return func[end];
    } else {
      return func.InOut;
    }
  }
}

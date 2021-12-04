import {Container, Sprite} from "pixi.js/dist/browser/pixi.min.mjs";
import {EventBus} from "../utils/events";

export class BalloonLetter extends Container {
  constructor(game, letter = 'b') {
    super();
    this.game = game;
    this.letter = letter.toLowerCase() + '_letter';
    this.time = 0;
    this.init();
  }

  init() {
    this.addSprite();
    this.setMovementParams();
    this.addEvents();
  }

  addEvents() {
    EventBus.on('update', (n, dt) => this.update(dt));
  }

  addSprite() {
    let tex = this.game.RES[this.letter];
    if (!tex) {
      tex = this.game.RES['b_letter'];
    }
    const sprite = this.sprite = new Sprite(tex);
    sprite.anchor.set(0.5);
    this.addChild(sprite);
  }

  setMovementParams() {
    this.moveParams = {
      yVelocity: 0.05 + Math.random() * 0.1,
      angVelocity: 0.02 + Math.random() * 0.02,
      ySpeed: 2000 + Math.random() * 100,
      timeOffset: Math.random() * Math.PI,
    }
  }

  update(dt) {
    this.time += dt;
    const {yVelocity, ySpeed, timeOffset, angVelocity} = this.moveParams;
    this.position.y += Math.sin(this.time / ySpeed + timeOffset) * yVelocity;
    this.angle += Math.sin((this.time - 0.1) / ySpeed + timeOffset) * angVelocity;
  }
}

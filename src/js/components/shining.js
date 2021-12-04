import {Container, Graphics, Sprite} from "pixi.js/dist/browser/pixi.mjs";
import {EventBus} from "../utils/events";

export class Shining extends Container {
  constructor(game) {
    super();
    this.game = game;
    this.init();
  }

  init() {
    this.addBigRays(15);
    this.addShimmer(20);
    this.addShine();
    EventBus.on('update', (name, time) => this.update(time), this);
  }

  addBigRays(num = 10) {
    const group = this.bigRaysGroup = new Container();
    this.addChild(group);
    const rayTex = this.game.RES['ray_big'].texture;
    for (let i = 0; i < num; i++) {
      const sprite = new Sprite(rayTex);
      sprite.anchor.set(0, 0.5);
      sprite.angle = 360 / num * i;
      sprite.alpha = 0.02;
      sprite.tint = 0xEDC35F;
      sprite.scale.set(0.5 + Math.random() * 0.2, 1);
      group.addChild(sprite);
    }
  }

  addShimmer(num = 10) {
    const group = this.shimmerGroup = new Container();
    this.addChild(group);
    const rayTex = this.game.RES['ray'].texture;
    for (let i = 0; i < num; i++) {
      const sprite = new Sprite(rayTex);
      sprite.anchor.set(0, 0.5);
      sprite.angle = 360 / num * i;
      sprite.tint = 0x72BCF2;
      sprite.alpha = 0.1;
      sprite.scale.set(0.4 + Math.random() * 0.2, 1);
      group.addChild(sprite);
    }
  }

  addShine() {
    const shineTex = this.game.RES['shine'].texture;
    const sprite = this.shine = new Sprite(shineTex);
    sprite.anchor.set(0.5);
    sprite.tint = 0xEDC35F;
    sprite.alpha = 0.6;
    this.addChild(sprite);
  }

  update(time) {
    this.bigRaysGroup.angle += 0.1;
    this.shimmerGroup.angle -= 0.13;

    this.bigRaysGroup.scale.set(1 + Math.sin(time / 50) * 0.1);
    this.shimmerGroup.scale.set(1 + Math.sin(time / 30) * 0.2);
    this.shine.scale.set(2 + Math.cos(time / 60) * 0.2);
  }
}

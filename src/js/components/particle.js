import {Sprite} from "pixi.js/dist/browser/pixi.min.mjs";
import Helper from '../utils/helper';

export class Particle extends Sprite {
  constructor(emitter, data) {
    super(data.texture);
    this.emitter = emitter;
    this.reset(data);
  }

  parseData(data) {
    const ptxData = this.ptxData = {
      startPosition: [0, 0],
      life: 0,
      lifeElapsed: 0,
      texture: null,
      animatedTexture: false,
      velocity: {
        vector: [0, 0],
        speed: 0,
        speedOverLife: null,
        spiralSpeed: [0, 0],
      },
      rotation: {
        start: 0,
        speed: 0,
        speedOverLife: null,
      }
    };

    Helper.deepAssign(ptxData, data)
  }

  kill() {
    this.emitter.removeChild(this);
    this.isAlive = false;
    this.visible = false;
  }

  reset(data) {
    this.parseData(data);
    const {
      startPosition: [x, y],
      rotation,
      scale,
      texture,
    } = this.ptxData;
    this.texture = texture;
    this.anchor.set(0.5);
    this.position.set(x, y);
    this.rotation = rotation.start;
    this.scale.set(scale.start);
    this.ptxData.lifeElapsed = 0;
    this.isAlive = true;
    this.visible = true;
  }

  updateLife(dt) {
    if (this.ptxData.lifeElapsed >= this.ptxData.life) {
      this.kill();
    }
    this.ptxData.lifeElapsed += dt;
    // console.log(this.ptxData)
  }

  updatePosition(dt) {
    this.updateVelocity();
    const {x, y} = this.position;
    const {gravity: {vector: gv, factor}} = this.emitter.emitterData.force;
    const {vector, speed} = this.ptxData.velocity;
    const newX = x + (vector[0]) * speed * dt + gv[0] * factor * dt;
    const newY = y + (vector[1]) * speed * dt + gv[1] * factor * dt;
    this.position.set(newX, newY);
  }

  updateScale() {
    const {life, scale: {scaleOverLife}} = this.ptxData;
    if (scaleOverLife && Array.isArray(scaleOverLife)) {
      const scale = Helper.interpolateArray(this.ptxData.lifeElapsed, 0, life, scaleOverLife);
      this.scale.set(scale);
    }
  }

  updateRotation() {
    const {life, rotation: {speed}} = this.ptxData;
    this.rotation += speed;
  }

  updateVelocity() {
    const {life, velocity} = this.ptxData;
    if (velocity.spiralSpeed && Array.isArray(velocity.spiralSpeed)) {
      const {vector: [x, y]} = velocity;
      const ang = Math.atan2(y, x);
      const speed = Helper.interpolateArray(this.ptxData.lifeElapsed, 0, life, velocity.spiralSpeed)
      velocity.vector[0] = Math.cos(ang + speed);
      velocity.vector[1] = Math.sin(ang + speed);
    }
    if (velocity.speedOverLife && Array.isArray(velocity.speedOverLife)) {
      this.ptxData.velocity.speed = Helper.interpolateArray(this.ptxData.lifeElapsed, 0, life, velocity.speedOverLife);
    }
  }

  updateParticle(dt) {
    if (!this.isAlive) return;

    this.updateLife(dt);
    this.updatePosition(dt);
    this.updateScale();
    this.updateRotation();
  }
}

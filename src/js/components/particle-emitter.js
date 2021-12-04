import {Container, Sprite, Ticker} from "pixi.js/dist/browser/pixi.min.mjs";
import {EventBus} from "../utils/events";
import {Particle} from './particle';
import {AnimatedParticle} from './animated-particle';
import Helper from '../utils/helper';
import {TWEEN} from "../utils/tween";

export class ParticleEmitter extends Container {
  constructor(game, data = {}) {
    super();
    this.game = game;
    this.parseEmitterData(data);
    this.ptxPool = [];
    this.durationTimer = null;
    this.burthrateTimer = null;

    EventBus.on('update', (n, dt) => this.update(dt));
  }

  parseEmitterData(data) {
    const emitterData = this.emitterData = {
      startPosition: [0, 0],
      birthrate: 0,
      duration: 0,
      amount: 20,
      width: 0,
      height: 0,
      life: 1000,
      lifeRandom: 0,
      texture: null,
      animatedTexture: false,
      behavior: {
        velocity: {
          angle: 0,
          random: 0,
          spread: Math.PI,
          speed: 0.1,
          speedOverLife: null,
          angleOverLife: null,
        },
        scale: {
          start: 1,
          random: 0,
          scaleOverLife: null,
        },
        rotation: {
          start: 0,
          random: 0,
          speed: 0,
          speedOverLife: null,
        }
      },
      force: {
        gravity: {
          vector: [0, 1],
          factor: 0,
        }
      },
    }

    this.enabled = true;

    Helper.deepAssign(emitterData, data);
  }

  setPosition(x = 0, y = 0) {
    this.emitterData.startPosition[0] = x;
    this.emitterData.startPosition[1] = y;
  }

  start() {
    if (!this.enabled) return;
    const {birthrate, amount, duration} = this.emitterData;
    for (let i = 0; i < amount; i++) {
      const data = this.setParticleData();
      const ptx = this.addParticle(data);
      this.addChild(ptx);
    }
    if (birthrate > 0 && this.enabled) {
      this.burthrateTimer = new TWEEN(null, {
        time: birthrate,
        onComplete: () => {
          this.start();
        }
      }).start();
      // this.burthrateTimer = setTimeout(() => this.start(), birthrate);
      if (duration > 0 && !this.durationTimer) {
        this.durationTimer = new TWEEN(null, {
          time: duration,
          onComplete: () => {
            this.stop();
          }
        }).start();
        // this.durationTimer = setTimeout(() => this.stop(), duration);
      }
    }
  }

  stop() {
    this.enabled = false;
    this.burthrateTimer && this.burthrateTimer.stop();
    this.durationTimer && this.durationTimer.stop();
    // clearTimeout(this.burthrateTimer);
    // clearTimeout(this.durationTimer);
    this.burthrateTimer = null;
    this.durationTimer = null;
  }

  setParticleData() {
    const {
      startPosition,
      width, height,
      life, lifeRandom,
      texture,
      animatedTexture,
      behavior: {velocity, scale, rotation},
      force
    } = this.emitterData;

    const pos = this.setPositionData(startPosition, width, height);
    const tex = animatedTexture ? texture : this.getTexture(texture);

    const data = {
      startPosition: pos,
      life: life + Math.random() * lifeRandom,
      texture: tex,
      animatedTexture,
      velocity: this.setVelocityData(velocity),
      scale: this.setScaleData(scale),
      rotation: this.setRotationData(rotation),
    }

    return data;
  }

  setPositionData(p, w, h) {
    const x = p[0] + Math.random() * w - w / 2;
    const y = p[1] + Math.random() * h - h / 2;
    return [x, y];
  }

  setVelocityData(data) {
    const {
      angle,
      random,
      spread,
      speed,
      speedOverLife,
      spiralSpeed,
    } = data;
    const sprd = Math.random() * spread - spread / 2;
    const rnd = Math.random() * random;
    let spd = speed + rnd;
    let spdOF = speedOverLife;
    if (Array.isArray(speedOverLife)) {
      spdOF = speedOverLife.map(el => el + rnd);
      spd = speedOverLife[0];
    }

    const x = Math.cos(angle + sprd);
    const y = Math.sin(angle + sprd);

    return  {
      vector: [x, y],
      speed: spd,
      speedOverLife: spdOF,
      spiralSpeed,
    }
  }

  setScaleData(data) {
    const {start, random, scaleOverLife} = data;
    const rnd = Math.random() * random;
    let sclArr = scaleOverLife;
    if (Array.isArray(scaleOverLife)) {
      sclArr = scaleOverLife.map(el => el + rnd);
    }
    return {
      start: start + Math.random() * random,
      scaleOverLife: sclArr,
    }
  }

  setRotationData(data) {
    const {start, random, speed, speedOverLife} = data;

    return {
      start: start + Math.random() * random,
      speed,
      speedOverLife
    }
  }

  getTexture(tex) {
    if (tex && Array.isArray(tex)) {
      return tex[parseInt(Math.floor(Math.random() * tex.length))];
    }
    return tex;
  }

  addParticle(data) {
    let ptx = this.getFistDead();
    if (!ptx) {
      if (data.animatedTexture) {
        ptx = new AnimatedParticle(this, data);
      } else {
        ptx = new Particle(this, data);
      }
      this.ptxPool.push(ptx);
    } else {
      ptx.reset(data);
    }

    return ptx;
  }

  getFistDead() {
    const l = this.ptxPool.length;
    for (let i = 0; i < l; i++) {
      if (!this.ptxPool[i].isAlive) {
        return this.ptxPool[i];
      }
    }
  }

  update(dt) {
    this.ptxPool.forEach(el => el.isAlive && el.updateParticle(dt));
  }
}


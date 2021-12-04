import {Container, Spritesheet, Texture} from "pixi.js/dist/browser/pixi.min.mjs";
import {BalloonLetter} from "./balloon-letter";
import {EventBus} from "../utils/events";
import {Shining} from "./shining";
import {Button} from "./button";
import {ParticleEmitter} from "./particle-emitter";
import {TWEEN} from "../utils/tween";

export class BonusScene extends Container{
  constructor(game) {
    super();
    this.game = game;

    this.init();
  }

  init() {
    this.addBalloons();
    this.addShine();
    this.addButton();
    this.addEmitter();
    this.addEvents();
  }

  intro() {
    this.emitters.twirl.enabled = true;
    this.emitters.fieldStars.enabled = true;
    this.emitters.twirl.start();
    this.emitters.fieldStars.start();
    this.playButton.enableButton();
    this.balloonsIntroAnimation();
  }

  addEvents() {
    EventBus.on('resize', (n, data) => this.resize(data));
  }

  addBalloons() {
    const lettersArr = 'bonus'.split('');
    const balloons = this.balloons = [];
    this.balloonBox = new Container();
    this.addChild(this.balloonBox);
    lettersArr.forEach((el, i) => {
      const balloon = new BalloonLetter(this.game, el);
      this.balloonBox.addChild(balloon);
      balloons.push(balloon);
    })
    this.balloonBox.zIndex = 1;
  }

  addShine() {
    const shine = this.shine = new Shining(this.game);

    this.shine.zIndex = 0;
    this.addChild(shine);
  }

  addButton() {
    this.playButton = new Button(this.game, 'CONFIRM', () => {
      EventBus.emit('loadScene', 'main');
      this.emitters.twirl.stop();
      this.emitters.fieldStars.stop();
    });
    this.playButton.zIndex = 1;
    this.addChild(this.playButton);
  }

  balloonsIntroAnimation() {
    const {height, centerY} = this.game.resizeData;
    this.balloonBox.visible = true;
    this.resize(this.game.resizeData);
    this.balloons.forEach((el) => {
      const fromY = - 200;
      const toY = el.position.y;
      const gap = 50 + Math.random() * 60;
      const randDuration = 1500 + Math.random() * 500;
      const randDelay = Math.random() * 200;
      el.visible = false;

      el.position.y = fromY;
      new TWEEN([{
        target: el.position,
        to: {
          y: [toY + gap, toY - gap * 0.4, toY + gap * 0.2, toY]
        }
      }], {
        time: randDuration,
        delay: randDelay,
        easing: 'sinInOut',
        onStart: () => {
          el.visible = true;
        }
      }).start();
    });
  }

  addEmitter() {

    const tex = this.emitterTextures = {
      line: this.game.RES['vline'],
      star: this.game.RES['star'],
      coins: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(el => this.game.RES[`coin_${el}`]),
    };
    const emitters = this.emitters = {
      fieldStars: new ParticleEmitter(this.game, {
        birthrate: 300,
        width: 400,
        height: 100,
        amount: 1,
        life: 500,
        lifeRandom: 100,
        texture: tex.star,
        behavior: {
          velocity: {
            speed: 0,
          },
          scale: {
            start: 0.1,
            random: 0.4,
            scaleOverLife: [0, 0.5, 0],
          }
        }
      }),
      twirl: new ParticleEmitter(this.game, {
        birthrate: 70,
        width: 0,
        height: 0,
        amount: 7,
        life: 2000,
        lifeRandom: 400,
        texture: tex.coins,
        animatedTexture: true,
        behavior: {
          velocity: {
            random: 0.05,
            spread: Math.PI * 2,
            speed: 0.3,
            speedOverLife: [0.1, 0.4],
            spiralSpeed: [0.04, 0],
          },
          scale: {
            start: 0.1,
            random: 0.4,
            scaleOverLife: [0, 0.3, 0.5, 0],
          },
          rotation: {
            random: Math.PI * 2,
            speed: 0.04
          }
        }
      }),
    };

    Object.values(emitters).forEach(emitter => {
    });

    this.emitters.fieldStars.zIndex = 2;
    this.emitters.twirl.zIndex = 0;

    this.addChild(this.emitters.fieldStars);
    this.addChild(this.emitters.twirl);
  }

  resize(data) {
    const {width, height, centerX, centerY} = data;
    const boxSize = width * 0.8;
    const cellWidth = boxSize / this.balloons.length;
    const spriteWidth = this.balloons[0].sprite.texture.orig.width
    const scale = (cellWidth * 1.4) / spriteWidth;
    const randomX = 10;
    const randomY = 30;
    const randomAng = 10;
    this.balloons.forEach((el, i) => {
      const x = centerX - boxSize / 2 + cellWidth * (i + 0.5);
      el.position.set(x + Math.random() * randomX - randomX / 2, centerY + Math.random() * randomY - randomY / 2);
      el.angle = Math.random() * randomAng - randomAng / 2;
      el.scale.set(scale);
    })
    this.balloonBox.children.sort((a, b) => b.position.y - a.position.y);

    this.children.sort((a, b) => a.zIndex - b.zIndex);

    this.shine.position.set(centerX, centerY);
    this.emitters.twirl.position.set(centerX, centerY);
    this.emitters.fieldStars.position.set(centerX, centerY);

    this.playButton.position.set(centerX, height);
    const pbScl = Math.min(height * 0.2, 100) / this.playButton.border.texture.orig.height
    this.playButton.scale.set(centerX, height);
    this.playButton.scale.set(pbScl);
  }
}

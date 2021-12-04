import {Container, Graphics} from "pixi.js/dist/browser/pixi.min.mjs";
import {Chest} from "./chest";
import {EventBus} from "../utils/events";
import {Button} from "./button";
import {TWEEN} from "../utils/tween";
import {ParticleEmitter} from "./particle-emitter";

export class MainScene extends Container {
  constructor(game) {
    super();
    this.game = game;
    this.chestCounter = 0;

    this.init();
  }

  init() {
    this.addPlayButton();
    this.addChests();
    this.addOverlay();
    this.addEmitter();
    this.initEvents();
    this.game.interactionEnabled = true;
  }

  initEvents() {
    EventBus.on('resize', (name, ...props) => this.resize(...props), this);
    EventBus.on('chestOpen', (name, ...props) => this.chestOpen(...props), this)
    EventBus.on('playButtonPressed', this.gameStart, this);
    EventBus.on('hideOverlay', (n, t) => this.hideOverlay(t), this);
    EventBus.on('emitParticles', (n, x, y, type) => this.emitParticles(x, y, type), this);
  }

  gameStart() {
    this.resetChests();
  }

  addChests() {
    const { numOfChests } = this.game.config;
    this.chests = [];
    const group = this.chestGroup = new Container();
    this.addChild(group);

    for (let i = 0; i < numOfChests; i++) {
      const chest = new Chest(this.game);
      group.addChild(chest);
      this.chests.push(chest);
      chest.zIndex = 0;
    }
  }

  addPlayButton() {
    this.playButton = new Button(this.game, 'PLAY', () => {
      EventBus.emit('playButtonPressed');
    });
    this.addChild(this.playButton);
  }

  addOverlay() {
    const gfx = this.overlay = new Graphics();
    gfx.beginFill(0x0, 1);
    gfx.drawRect(0, 0, 2000, 2000);
    gfx.endFill();
    gfx.alpha = 0;
    this.chestGroup.addChild(gfx);
    gfx.zIndex = 1;
  }

  chestOpen(obj) {
    obj.zIndex = 2;
    this.chestGroup.children.sort((a, b) => a.zIndex - b.zIndex)
    this.chestCounter++;
    let cb = null;
    if (this.chestCounter === this.chests.length) {
      cb = () => EventBus.emit('gameOver');
    }
    obj.addOpenTween(cb);
    EventBus.emit('emitParticles', obj.position.x, obj.position.y);
    this.showOverlay(500);
  }

  resetChests() {
    const del = 50;
    this.chestCounter = 0;
    this.chests.forEach((el, i) => {
      el.resetChest(del * i);
    })
  }

  showOverlay(time = 500) {
    if (this.overlayTween && this.overlayTween.isPlaying) {
      this.overlayTween.stop();
      this.overlayTween = null;
    }

    this.overlayTween = new TWEEN({
      target: this.overlay,
      to: {
        alpha: 0.7
      }
    }, {
      time
    }).start();
  }

  hideOverlay(time = 600) {
    if (this.overlayTween && this.overlayTween.isPlaying) {
      this.overlayTween.stop();
      this.overlayTween = null;
    }

    this.overlayTween = new TWEEN({
      target: this.overlay,
      to: {
        alpha: 0
      }
    }, {
      time
    }).start();
  }

  addEmitter() {
    const tex = this.emitterTextures = {
      line: this.game.RES['vline'],
      star: this.game.RES['star'],
      coins: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(el => this.game.RES[`coin_${el}`]),
    };
    const emitters = this.emitters = {
      chestOpen: new ParticleEmitter(this.game, {
        birthrate: 0,
        width: 170,
        height: 60,
        amount: 30,
        life: 100,
        lifeRandom: 300,
        texture: [tex.line, tex.line, tex.star],
        behavior: {
          velocity: {
            random: 0.1,
            angle: -Math.PI / 2,
            spread: 0,
            speedOverLife: [0.4, 0.1],
          },
          scale: {
            start: 0.1,
            random: 0.3,
            scaleOverLife: [0.2, 0.4, 0],
          }
        }
      }),
      starsFlow: new ParticleEmitter(this.game, {
        birthrate: 50,
        duration: 1000,
        width: 80,
        height: 10,
        amount: 2,
        life: 300,
        lifeRandom: 900,
        texture: tex.coins,
        animatedTexture: true,
        behavior: {
          velocity: {
            random: 0.01,
            angle: -Math.PI / 2,
            spread: Math.PI / 8,
            speedOverLife: [0.6, 0.1, 0],
          },
          scale: {
            start: 0.1,
            random: 0.1,
            scaleOverLife: [0.1, 0.5, 0],
          },
          rotation: {
            random: Math.PI,
          }
        },
        force: {
          gravity: {
            vector: [0, 1],
            factor: 0.3
          }
        }
      }),
      chestRefresh: new ParticleEmitter(this.game, {
        birthrate: 0,
        width: 100,
        height: 80,
        amount: 10,
        life: 400,
        lifeRandom: 400,
        texture: tex.star,
        behavior: {
          velocity: {
            random: 0.05,
            angle: Math.PI / 2,
            spread: Math.PI * 2,
            speedOverLife: [0.1, 0.01],
          },
          scale: {
            start: 0.1,
            random: 0.4,
            scaleOverLife: [0.1, 0.5, 0],
          }
        }
      }),
    };

    Object.values(emitters).forEach(emitter => {
      this.addChild(emitter);
    })
  }

  emitParticles(x = 0, y = 0, type = 'chestOpen') {
    const tex = this.emitterTextures;
    let data = {};
    switch (type) {
      case 'chestOpen':
        this.emitters.chestOpen.setPosition(x, y + 70);
        this.emitters.chestOpen.enabled = true;
        this.emitters.chestOpen.start();
        break;
      case 'starsFlow':
        this.emitters.starsFlow.setPosition(x, y + 15);
        this.emitters.starsFlow.enabled = true;
        this.emitters.starsFlow.start();
        break;
      case 'chestRefresh':
        this.emitters.chestRefresh.setPosition(x, y + 15);
        this.emitters.chestRefresh.enabled = true;
        this.emitters.chestRefresh.start();
        break;
      case 'twirl':
        this.emitters.twirl.setPosition(x, y + 15);
        this.emitters.twirl.enabled = true;
        this.emitters.twirl.start();
        break;
    }
  }

  reorganizeChests(data) {
    const {width, height, landscape, centerX, centerY} = data;
    const workWidth = width - 60;
    const workHeight = height * 0.8;
    const rows = landscape ? 3 : 2;
    const cols = this.chests.length / rows;
    const chestScale = Math.min(
      ((workWidth) / rows) / this.chests[0].bounds.width,
      ((workHeight) / cols) / this.chests[0].bounds.height);
    this.chests.forEach((el, i) => {
      const vOffset = landscape ? (1 - (i % rows % cols)) * height * 0.02 : 0;
      const rowIndex = i % rows;
      const colIndex = Math.floor(i / rows);
      const x = centerX + workWidth / rows * (rowIndex - rows / 2 + 0.5);
      const y = centerY * 0.8 + workHeight / cols * (colIndex - cols / 2 + 0.5);
      el.scale.set(chestScale);
      el.position.set(x, y + vOffset);
    })
  }

  resize(data) {
    const {width, height, landscape, centerX, centerY} = data;
    this.reorganizeChests(data);
    this.playButton.position.set(centerX, height);
    const pbScl = Math.min(height * 0.2, 100) / this.playButton.border.texture.orig.height
    this.playButton.scale.set(centerX, height);
    this.playButton.scale.set(pbScl);
    this.overlay.clear();
    this.overlay.beginFill(0x0, 1);
    this.overlay.drawRect(0, 0, width, height);
  }

  update() {
    // const dt = this.game.ticker.deltaTime;
    // this.emitter.update(dt);
  }
}

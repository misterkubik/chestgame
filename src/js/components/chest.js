import {
  Container,
  AnimatedSprite,
  Loader,
  Texture,
  Spritesheet,
  Sprite,
  filters,
  Text
} from "pixi.js/dist/browser/pixi.min.mjs";
import {EventBus} from "../utils/events";
import {Shining} from "./shining";
import {TWEEN} from "../utils/tween";

export class Chest extends Container {
  constructor(game) {
    super();
    this.game = game;
    this.isOpen = false;
    this.enabled = false;
    this.init()
  }

  init() {
    this.addShining();
    this.addChest();
    this.addInsideTitle();
  }

  addChest() {
    this.extractFrames();
    this.setBounds();
    this.setFilters();
  }

  addInsideTitle() {
    const text = this.insideTitle = new Text('empty', {
      align: 'center',
      fontSize: 30,
      fontFamily: 'gamefont',
      fill: '#ffffff'
    });
    text.anchor.set(0.5);
    text.visible = false;
    this.addChild(text);
  }

  randomizeWin() {
    const config = this.game.config;
    if (!config.chestWinChancesCurrent) {
      config.chestWinChancesCurrent = [].concat(config.chestWinChances);
    }
    const arr = config.chestWinChancesCurrent;
    const win = arr[parseInt(Math.floor(Math.random() * arr.length))];
    let winType = '';
    switch (win) {
      case 0: {
        const addWinType = Math.random() > 0.2 ? 1 : 2;
        config.chestWinChancesCurrent.push(addWinType);
        winType = 'none';
        break;
      }
      case 1: {
        config.chestWinChancesCurrent = null;
        winType = 'win';
        break;
      }
      case 2: {
        config.chestWinChancesCurrent = null;
        winType = 'bonus';
        break;
      }
    }

    this.statusWin = win;
    this.isWin = !!win;

    const chancesArr = config.chestWinChancesCurrent ? config.chestWinChancesCurrent : config.chestWinChances;
    const winChanceArr = chancesArr.filter(el => (el === 1)).length;
    const bonusWinChanceArr = chancesArr.filter(el => (el === 2)).length;

    const winChanceText = '1:' + Math.floor(chancesArr.length / winChanceArr);
    const bonusWinChanceText = '1:' + Math.floor(chancesArr.length / bonusWinChanceArr);

    console.log(winType + ' | Win Chance: ' + winChanceText + ' | Bonus Win Chance: ' + bonusWinChanceText);
  }

  extractFrames() {
    const frames = this.chestFrames = [];
    for (let i = 0; i < 7; i++) {
      const texture = Texture.from(`chest_${i}`);
      frames.push(texture);
    }
    const sprite = this.sprite = new AnimatedSprite(frames);
    sprite.anchor.set(0.5);
    sprite.scale.set(0.9);
    sprite.animationSpeed = 0.4;
    sprite.loop = false;
    sprite.interactive = true;
    sprite.buttonMode = true;
    sprite.on('pointertap', this.openChest.bind(this));

    this.addChild(sprite);
  }

  setAnimation(name = 'open') {
    let frameOrder = [];
    switch(name) {
      case 'open': {
        frameOrder = frameOrder.concat(this.chestFrames);
        break;
      }
      case 'close': {
        frameOrder = frameOrder.concat(this.chestFrames).reverse();
        break;
      }
    }
    // console.log(frameOrder)
    this.sprite.textures = frameOrder;
  }

  setFilters() {
    const colorMatrix = this.grayFilter = new filters.ColorMatrixFilter();
    colorMatrix.contrast(0.2);
    colorMatrix.greyscale(0.2);
    colorMatrix.alpha = 1;
    this.filters = [colorMatrix];
  }

  addShining() {
    const shining = this.shining = new Shining(this.game);
    shining.position.y = 20;
    shining.visible = false;
    this.addChild(shining);
  }

  openChest() {
    if (!this.isOpen && this.enabled && this.game.interactionEnabled) {
      this.isOpen = true;
      EventBus.emit('chestOpen', this);
    }
  }

  stopCurrentTween() {
    if (this.currentTween && this.currentTween.isPlaying) {
      this.currentTween.stop();
    }
    this.currentTween = null;
  }

  addOpenTween(cb) {
    this.randomizeWin();
    this.stopCurrentTween();
    this.shining.scale.set(0);
    this.setAnimation('open');
    this.game.interactionEnabled = false;
    this.currentTween = new TWEEN([{
      target: this.sprite.scale,
      to: {
        x: [0.8, 1.1, 1],
        y: [1.2, 0.9, 1],
      }
    }, {
      target: this.sprite.position,
      to: {
        y: [-5, 10, -2, 0],
      }
    }, {
      target: this.sprite,
      to: {
        angle: [-2, 1, -0.4, 0],
      }
    }, {
      target: this.shining.scale,
      to: {
        x: [0, 1.5, 1],
        y: [0, 1.5, 1],
      }
    }], {
      time: 500,
      easing: 'cubicOut',
      onComplete: () => {
        this.sprite.play();
        this.checkOutWin();
      },
      onStart: () => {
        this.shining.visible = true;
      }
    });

    if (this.statusWin >= 1) {
      this.currentTween.next({
        target: this.sprite.position,
        to: {
          y: [-15, 5, 0],
          angle: [-3, 2, -1, 0],
        }
      }, {
        time: 400,
        easing: 'cubicOut',
      });
    }

    this.currentTween.next([{
      target: this.shining.scale,
      to: {
        x: [1.2, 0],
        y: [1.2, 0],
      }
    }, {
      target: this.sprite.scale,
      to: {
        x: [1, 1.05, 0.9],
        y: [1, 1.05, 0.9],
      }
    }, {
      target: this.grayFilter,
      to: {
        alpha: 1,
      }
    }], {
      delay: 500,
      time: 600,
      easing: 'sineInOut',
      onStart: () => {
        EventBus.emit('hideOverlay', 500);
      },
      onComplete: () => {
        this.shining.visible = false;
        this.game.interactionEnabled = true;
        this.zIndex = 0;
        cb && cb();
      }
    });
    this.currentTween.start();
  }

  resetChest(delay = 0) {
    this.stopCurrentTween();

    this.currentTween = new TWEEN([{
      target: this.sprite.scale,
      to: {
        x: [1.1, 0.9, 1],
        y: [1.2, 0.8, 1],
      }
    }, {
      target: this.grayFilter,
      to: {
        alpha: [1, 0],
      }
    }], {
      delay,
      time: 1000,
      easing: 'cubicOut',
      onStart: () => {
        EventBus.emit('emitParticles', this.position.x, this.position.y, 'chestRefresh');
        if (this.isOpen) {
          this.setAnimation('close');
          this.sprite.play();
        }
      },
      onComplete: () => {
        this.isOpen = false;
        this.enabled = true;
      }
    })

    this.currentTween.start();
  }

  setFlyingTitleText() {
    switch (this.statusWin) {
      case 0: {
        const arr = this.game.config.emptyChestPhrases;
        this.insideTitle.text = arr[Math.floor(Math.random() * arr.length)].toUpperCase();
        this.insideTitle.style.fill = '#fff';
        this.insideTitle.style.dropShadow = true;
        this.insideTitle.style.dropShadowDistance = 2;
        this.insideTitle.style.dropShadowColor = '#502512';
        this.insideTitle.style.dropShadowAlpha = 0.5;
        // this.insideTitle.style.dropShadowBlur = 3;
        break
      }
      case 1: {
        this.insideTitle.text = 'WIN';
        this.insideTitle.style.fill = '#F9DFBD';
        this.insideTitle.style.dropShadow = true;
        this.insideTitle.style.dropShadowDistance = 4;
        this.insideTitle.style.dropShadowColor = '#AD631E';
        this.insideTitle.style.dropShadowAlpha = 1;
        break;
      }
      case 2: {
        this.insideTitle.text = 'BONUS';
        this.insideTitle.style.fill = '#FED092';
        this.insideTitle.style.fill = '#F9DFBD';
        this.insideTitle.style.dropShadow = true;
        this.insideTitle.style.dropShadowDistance = 4;
        this.insideTitle.style.dropShadowColor = '#AD631E';
        this.insideTitle.style.dropShadowAlpha = 1;
        break;
      }
    }
  }

  spawnFlyingTitle(delay = 0) {
    this.setFlyingTitleText();
    const title = this.insideTitle;
    title.alpha = 0;
    title.position.y = 0;
    title.visible = true;
    new TWEEN([{
      target: title.position,
      to: {
        y: -80,
      }
    }, {
      target: title,
      to: {
        alpha: 1,
      }
    }], {
      delay,
      time: 700,
      easing: 'cubicOut',
    }).next([{
      target: title,
      to: {
        alpha: [0.3, 0.7, 0.2, 0.6, 0],
      }
    }], {
      time: 500,
      easing: 'none',
      onComplete: () => {
        title.visible = false;
      }
    }).start();
  }

  checkOutWin() {
    this.spawnFlyingTitle(50);
    if (this.isWin) {
      EventBus.emit('emitParticles', this.position.x, this.position.y, 'starsFlow');
    }
    if (this.statusWin === 2) {
      setTimeout(() => {
        EventBus.emit('loadScene', 'bonus', (el) => { el.intro() });
      }, 500);
    }
  }

  emptyChestAnimation() {

  }

  setBounds() {
    const { width, height } = this.chestFrames[0].orig;
    this.bounds = {
      width,
      height
    }
  }
}

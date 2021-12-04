import {Container, Sprite, Text} from "pixi.js/dist/browser/pixi.min.mjs";
import {EventBus} from "../utils/events";

export class Button extends Container {
  constructor(game, text = 'PLAY', onTap = () => {}) {
    super();
    this.game = game;
    this.titleText = text;
    this.onTapCB = onTap;
    this.init();
  }

  init() {
    this.addButton();
    this.addBorder();
    this.addTitle();
    this.addEvents();
  }

  addBorder() {
    const tex = this.game.RES['button_border'].texture;
    const sprite = this.border = new Sprite(tex);
    sprite.anchor.set(0.5, 1);
    this.addChild(sprite);
  }

  addButton() {
    this.buttonStates = {
      idle: this.game.RES['button_inner'].texture,
      hover: this.game.RES['button_inner_hover'].texture,
      pressed: this.game.RES['button_inner_pressed'].texture,
      disable: this.game.RES['button_inner_disable'].texture,
    };
    const sprite = this.button = new Sprite(this.buttonStates.idle);
    sprite.anchor.set(0.5, 1);
    sprite.interactive = true;
    sprite.buttonMode = true;
    this.addChild(sprite);
  }

  addTitle() {
    const {width, height} = this.buttonStates.idle.orig;
    const title = this.title = new Text(this.titleText, {
      fontFamily: 'gamefont',
      fontSize: 70,
      fill : 0xffffff,
      align : 'center',
      dropShadow: true,
      dropShadowDistance: 4,
      dropShadowAngle: Math.PI / 2,
      dropShadowAlpha: 0.4,
      dropShadowBlur: 10,

    });
    title.anchor.set(0.5);
    const scale = Math.min((height * 0.4) / title.height, (width * 0.6) / title.width)
    title.scale.set(scale);
    title.position.y = - height / 2 - 5;
    title.alpha = 0.75;
    this.addChild(title);
  }

  addEvents() {
    const {button} = this;

    button.on('pointerdown', this.onDown.bind(this));
    button.on('pointerup', this.onUp.bind(this));
    button.on('pointerupoutside', this.onOut.bind(this));
    button.on('pointerover', this.onOver.bind(this));
    button.on('pointerout', this.onOut.bind(this));

    EventBus.on('gameOver', this.enableButton, this);
  }

  onDown() {
    this.isHold = true;
    this.button.texture = this.buttonStates.pressed;
  }

  onUp() {
    this.isHold = false;
    this.button.texture = this.buttonStates.idle;
    this.disableButton();
    this.onTapCB();
  }

  onOver() {
    this.button.texture = this.buttonStates.hover;
  }

  onOut() {
    this.button.texture = this.buttonStates.idle;
  }

  enableButton() {
    this.button.interactive = true;
    this.button.buttonMode = true;
    this.button.texture = this.buttonStates.idle;
    this.title.style.fill = '#ffffff';
  }

  disableButton() {
    this.button.interactive = false;
    this.button.buttonMode = false;
    this.button.texture = this.buttonStates.disable;
    this.title.style.fill = '#424846';
  }
}

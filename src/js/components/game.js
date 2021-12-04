import {Application, Ticker} from "pixi.js/dist/browser/pixi.min.mjs";
import {MainScene} from "./main-scene";
import {BonusScene} from "./bonus-scene";
import {config} from "../../config";
import {EventBus} from "../utils/events";
import {AssetsLoader} from "./assets-loader";
import { update } from '@tweenjs/tween.js';
import {TWEEN} from "../utils/tween";


export class Game {
  constructor() {
    this.app = new Application({
      backgroundColor: 0x0E2D41,
    });

    this.interactionEnabled = false;
    this.config = config;
    this.ticker = Ticker.shared;
    this.ticker.autoStart = false;
    this.init();
  }

  init() {
    this.loader = new AssetsLoader();
    this.loader.load();
    this.initEvents();
  }

  addScene() {
    this.scenes = {
      main: new MainScene(this),
      bonus: new BonusScene(this),
    };
    this.currentScene = this.scenes.main;
    this.app.stage.addChild(this.currentScene);
    this.update();
    this.resize();
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());
    EventBus.on('assetsLoaded', this.onLoad, this);
    EventBus.on('loadScene', (n, type, cb) => this.loadScene(type, cb), this);
  }

  onLoad() {
    this.RES = this.loader.loader.resources;
    this.ticker.start();
    this.addScene();
    document.getElementById('loading-screen').style.display = 'none';
  }

  loadScene(type = 'main', cb = () => {}) {
    const newScene = this.scenes[type];
    if (!newScene || newScene === this.currentScene) {
      return
    }
    const oldScene = this.currentScene;
    newScene.resize(this.resizeData);
    newScene.position.y = -this.resizeData.height;
    this.app.stage.addChild(newScene);
    new TWEEN([{
      target: this.currentScene.position,
      to: {
        y: this.resizeData.height,
      }
    }, {
      target: newScene.position,
      to: {
        y: 0,
      }
    }, {
      target: newScene,
      to: {
        alpha: 1,
      }
    }, {
      target: this.currentScene,
      to: {
        alpha: 0,
      }
    }], {
      time: 500,
      easing: 'cubicInOut',
      onStart: () => {
        cb(newScene);
      },
      onComplete: () => {
        this.app.stage.removeChild(oldScene);
        this.currentScene = newScene;
      }
    }).start();
  }

  resize() {
    const {innerWidth: width = 600, innerHeight: height = 900} = window;
    const resizeData = this.resizeData = {
      width,
      height,
      landscape: width > height,
      centerX: width / 2,
      centerY: height / 2,
      ratio: width / height,
    };
    this.app.renderer.resize(width, height);
    EventBus.emit('resize', resizeData);
  }

  update() {
    requestAnimationFrame(this.update.bind(this));
    this.app.renderer.render(this.app.stage);
    EventBus.emit('update', this.ticker.deltaMS);
    update();
  }
}

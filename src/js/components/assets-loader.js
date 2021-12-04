import {BaseTexture, Loader, Spritesheet, SpritesheetLoader} from "pixi.js/dist/browser/pixi.min.mjs";
import {EventBus} from "../utils/events";

import assets from '../../assets/spritesheets/assets.json';
import assets_image from '../../assets/spritesheets/assets.png';
import gamefont from '../../assets/fonts/gamefont.ttf';
import button_border from '../../assets/images/button_border.png';
import button_inner from '../../assets/images/button_inner.png';
import button_inner_disable from '../../assets/images/button_inner_disable.png';
import button_inner_hover from '../../assets/images/button_inner_hover.png';
import button_inner_pressed from '../../assets/images/button_inner_pressed.png';
import shine from '../../assets/images/shine.png';
import ray from '../../assets/images/ray.png';
import ray_big from '../../assets/images/ray_big.png';

export class AssetsLoader {
  constructor() {
    this.loader = Loader.shared;
    this.init();
  }

  init() {
    this.addFonts();
    this.addImages();
    this.addSpritesheet();
  }

  addFonts() {
    const fonts = [
      { name: 'gamefont', url: gamefont },
    ];
    const style = document.createElement('style');
    const preload = document.createElement('div');
    let styleText = ``;
    let preloadText = ``;
    fonts.forEach((el) => {
      styleText += `@font-face { font-family: '${el.name}'; src: url('${el.url}'); format('truetype'); \n`;
      preloadText += `<div style="font-family: ${el.name}">abcdefghijklmnopqrstuvwxyz0123456789</div>`
    })

    style.innerText = styleText;
    preload.innerHTML = preloadText;
    preload.style = 'position: absolute; opacity: 0;';
    document.body.appendChild(style);
    document.body.appendChild(preload);
  }

  addImages() {
    const images = [
      {name: 'button_border', url: button_border},
      { name: 'button_inner', url: button_inner },
      { name: 'button_inner_disable', url: button_inner_disable },
      { name: 'button_inner_hover', url: button_inner_hover },
      { name: 'button_inner_pressed', url: button_inner_pressed },
      { name: 'shine', url: shine },
      { name: 'ray', url: ray },
      { name: 'ray_big', url: ray_big },
    ];
    this.loader.add(images);
  }

  addSpritesheet() {
    const spritesheets = [
      {name: 'assets_image', url: assets_image},
      { name: 'assets', url: assets },
    ];
    this.loader.add(spritesheets);
  }

  load() {
    this.loader.load(() => this.parseSpriteseet());
  }

  parseSpriteseet() {
    const res = this.loader.resources;
    const sheet = res.spritesheetData = new Spritesheet(res['assets_image'].texture, res.assets.data);
    sheet.parse(() => {
      Object.assign(res, sheet.textures);
      this.onLoad()
    })
  }

  onLoad() {
    EventBus.emit('assetsLoaded', true);
  }
}

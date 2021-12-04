import {Game} from "./js/components/game";


import './css/style.css';

const css = `
  // text-shadow: 2px 1px rgba(255, 0, 0, 0.4),1px -2px rgba(0, 255, 0, 0.4), -1px -1px rgba(0, 0, 255, 0.4);
  font-size: 12px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.8);
  background: rgba(248, 218, 16, 0.8);
  padding: 2px 8px;
  border: 2px solid rgba(248, 218, 16, 1);
`;
// eslint-disable-next-line no-console
console.log('%c[K]ubik', css);

function init() {

  const game = new Game();
  document.body.appendChild(game.app.view);
}

init();

 import Boot from './states/boot';
 import Game from './states/game';
 import Gameover from './states/gameover';
 import Menu from './states/menu';
 import Preloader from './states/preloader';
 import Running from './states/running';

let w = window.innerWidth;
let h = window.innerHeight;
if (w > 900) w = 900;
if (h > 600) h = 600;

const game = new Phaser.Game(w, h, Phaser.AUTO, 'runner-game');

 game.state.add('boot', new Boot());
 game.state.add('game', new Game());
 game.state.add('gameover', new Gameover());
 game.state.add('menu', new Menu());
 game.state.add('preloader', new Preloader());
 game.state.add('running', new Running());

game.state.start('boot');

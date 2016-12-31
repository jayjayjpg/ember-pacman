import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';
import Pac from '../models/pac';
import Ghost from '../models/ghost';
import Level from '../models/level';
import Level2 from '../models/level2';
import Level3 from '../models/level3';
import SharedStuff from '../mixins/shared-stuff';

export default Ember.Component.extend(KeyboardShortcuts, SharedStuff, {

  score: 0,
  levelNumber: 1,
  lives: 3,
  levels: [Level3, Level2, Level],

  didInsertElement(){
    this.startNewLevel();
    this.loop();
  },

  loadNewLevel(){
    let levelIndex = (this.get('levelNumber') - 1) % this.get('levels.length');
    let levelClass = this.get('levels')[levelIndex];
    return levelClass.create();
  },

  startNewLevel(){
    let level = this.loadNewLevel();
    level.restart();
    this.set('level', level);
    let pac = Pac.create({level: level, x: level.get('startingPac.x'), y: level.get('startingPac.y') });
    let ghosts = level.get('startingGhosts').map((startPosition) => {
      return Ghost.create({
        level: level,
        x: startPosition.x,
        y: startPosition.y,
        direction: 'down',
        pac: pac
      });
    });
    this.set('pac', pac);
    this.set('ghosts', ghosts);
  },

  drawGrid(){
    let grid = this.get('level.grid');
    grid.forEach((row, rIndex) => {
      row.forEach((cell, cIndex) => {
        if (cell === 1){
          this.drawWall(cIndex, rIndex);
        }

        if (cell === 2){
          this.drawPellet(cIndex, rIndex);
        }
        if (cell === 3){
          this.drawPowerPellet(cIndex, rIndex);
        }
      });
    });
  },
  drawWall(x, y){
    let squareSize = this.get('level.squareSize');
    let ctx = this.get('ctx');
    ctx.fillStyle = '#000';

    ctx.fillRect(
        x * squareSize,
        y * squareSize,
        squareSize,
        squareSize
    );
  },
  drawPellet(x, y){
    let radiusDivisor = 6;
    this.drawCircle(x, y, radiusDivisor, 'stopped');
  },
  drawPowerPellet(x, y){
    let radiusDivisor = 4;
    this.drawCircle(x, y, radiusDivisor, 'stopped', 'green');
  },
  clearScreen(){
    let ctx = this.get('ctx');
    ctx.clearRect(0, 0, this.get('level.pixelWidth'), this.get('level.pixelHeight'));
  },

  processAnyPellets(){
    let x = this.get('pac.x');
    let y = this.get('pac.y');
    let grid = this.get('level.grid');


    if (grid[y][x] === 2){
      grid[y][x] = 0;
      this.incrementProperty('score');
     // this.set('grid', grid);
      if(this.get('level').levelComplete()){
        this.incrementProperty('levelNumber');
        this.startNewLevel();
      }
    }
    else if(grid[y][x] === 3){
      grid[y][x] = 0;
      this.set('pac.powerModeTime', this.get('pac.maxPowerModeTime'));
    }
  },

  detectGhostCollisions(){
    return this.get('ghosts').filter(ghost => {
      return this.get('pac.x') === ghost.get('x') &&
             this.get('pac.y') === ghost.get('y');
    });
  },

  restart(){
    
    if(this.get('lives') <= 0){
      this.set('lives', 3);
      this.set('score', 0);
      this.get('levelNumber', 1);
      this.startNewLevel();
    }
    
    this.get('pac').restart();
    this.get('ghosts').forEach(ghost => ghost.restart());

  },

  loop(){
    this.get('pac').move();
    this.get('ghosts').forEach(ghost => ghost.move());
    this.processAnyPellets();
    this.clearScreen();
    this.drawGrid();
    this.get('pac').draw();
    this.get('ghosts').forEach(ghost =>  ghost.draw());

    let ghostCollisions = this.detectGhostCollisions();
    if (ghostCollisions.length > 0){
      if (this.get('pac.powerMode')){
        ghostCollisions.forEach( ghost => ghost.retreat() );
      }
      else {
        this.decrementProperty('lives');
        this.restart();
      }
    }

    Ember.run.later(this, this.loop, 1000/60);
  },

  keyboardShortcuts: {
    up(){ 
      this.set('pac.intent','up');
    },
    down(){ 
      this.set('pac.intent','down');
    },
    left(){ 
      this.set('pac.intent','left');
    },
    right(){ 
      this.set('pac.intent','right');
    },
  }
});

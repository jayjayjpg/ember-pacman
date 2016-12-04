import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';
import Pac from '../models/pac';
import Level from '../models/level';
import SharedStuff from '../mixins/shared-stuff';

export default Ember.Component.extend(KeyboardShortcuts, SharedStuff, {

  score: 0,
  levelNumber: 1,

  didInsertElement(){
    let level = Level.create();
    this.set('level', level);
    let pac = Pac.create({level: level});
    this.set('pac', pac);
    this.loop();
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
        this.get('level').restart();
      }
    }
  },

  restart(){
    this.get('pac').restart();
    this.get('level').restart();
  },

  loop(){
    this.get('pac').move();
    this.processAnyPellets();
    this.clearScreen();
    this.drawGrid();
    this.get('pac').draw();
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

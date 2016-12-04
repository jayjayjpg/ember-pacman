import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';
import Pac from '../models/pac';
import SharedStuff from '../mixins/shared-stuff';

export default Ember.Component.extend(KeyboardShortcuts, SharedStuff, {

  score: 0,
  levelNumber: 1,


  screenWidth: Ember.computed(function(){
    return this.get('grid.firstObject.length');
  }),
  screenHeight: Ember.computed(function(){
    return this.get('grid.length');
  }),
  screenPixelWidth: Ember.computed(function(){
    return this.get('screenWidth') * this.get('squareSize');
  }),
  screenPixelHeight: Ember.computed(function(){
    return this.get('screenHeight') * this.get('squareSize');
  }),

  didInsertElement(){
    let pac = Pac.create();
    this.set('pac', pac);
    this.loop();
  },

  drawGrid(){
    let grid = this.get('grid');
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
    let squareSize = this.get('squareSize');
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
    ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
  },

  processAnyPellets(){
    let x = this.get('pac.x');
    let y = this.get('pac.y');
    let grid = this.get('grid');


    if (grid[y][x] === 2){
      grid[y][x] = 0;
      this.incrementProperty('score');
     // this.set('grid', grid);
      if(this.levelComplete()){
        this.incrementProperty('levelNumber');
        this.restartLevel();
      }
    }
  },
  levelComplete(){
    let anyPelletsLeft = false;
    let grid = this.get('grid');

    grid.forEach((row)=> {
      row.forEach((cell) =>{
        if(cell === 2){
          anyPelletsLeft = true;
        }
      });
    });
    
    return !anyPelletsLeft;
  },
  restartLevel(){
    this.set('pac.x',0);
    this.set('pac.y',0);
    this.set('pac.frameCycle', 0);
    this.set('pac.direction', 'stopped');

    let grid = this.get('grid');
    grid.forEach((row, rIndex)=>{
      row.forEach((cell, cIndex)=>{
        if(cell === 0){
          grid[rIndex][cIndex] = 2;
        }
      });
    });
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

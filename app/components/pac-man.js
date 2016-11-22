import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, {
  x: 1,
  y: 2,
  squareSize: 40,
  score: 0,
  levelNumber: 1,
  frameCycle: 1,
  framesPerMovement: 30,
  isMoving: false,
  direction: 'stopped',
  screenWidth: Ember.computed(function(){
    return this.get('grid.firstObject.length');
  }),
  screenHeight: Ember.computed(function(){
    return this.get('grid.length');
  }),
  grid: [
    [2, 2, 2, 2, 2, 2, 2, 1],
    [2, 1, 2, 1, 2, 2, 2, 1],
    [2, 2, 1, 2, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
  ],
  directions: {
    'up': {x: 0, y: -1},
    'down': {x: 0, y: 1},
    'left': {x: -1, y: 0},
    'right': {x: 1, y: 0},
    'stopped': {x: 0, y: 0}
  },
  screenPixelWidth: Ember.computed(function(){
    return this.get('screenWidth') * this.get('squareSize');
  }),
  screenPixelHeight: Ember.computed(function(){
    return this.get('screenHeight') * this.get('squareSize');
  }),
  ctx: Ember.computed(function(){
    let canvas = document.getElementById('myCanvas');
    let ctx = canvas.getContext("2d");
    return ctx;
  }),
  didInsertElement(){
    this.drawPac();
    this.drawGrid();
  },
  drawPac(){
    let x = this.get('x');
    let y = this.get('y');
    let radiusDivisor = 2;
    this.drawCircle(x, y, radiusDivisor);
  },
  drawCircle(x, y, radiusDivisor){
    let ctx =  this.get('ctx');
    let squareSize = this.get('squareSize');
    let radius = squareSize/radiusDivisor;
    
    let pixelX = (x+1/2) * squareSize;
    let pixelY = (y+1/2) * squareSize;

    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
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
    let squareSize = this.get('squareSize');
    let ctx = this.get('ctx'); 
    ctx.fillStyle = '#000';

    let pixelX = (x + 1/2) * squareSize;
    let pixelY = (y + 1/2) * squareSize;

    ctx.beginPath();
    ctx.arc(pixelX, pixelY, squareSize/6, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  },
  clearScreen(){
    let ctx = this.get('ctx');
    ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
  },
  collidedWithBorder(){
    let x = this.get('x');
    let y = this.get('y');
    let screenHeight = this.get('screenHeight');
    let screenWidth = this.get('screenWidth');

    let pacOutOfBounds = x < 0 || y < 0 || x >= screenWidth || y >= screenHeight;
    return pacOutOfBounds;
  },
  collidedWithWall(){
    let x = this.get('x');
    let y = this.get('y');
    let grid = this.get('grid');
    
    return grid[y][x] === 1;

  },
  processAnyPellets(){
    let x = this.get('x');
    let y = this.get('y');
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
    this.set('x',0);
    this.set('y',0);

    let grid = this.get('grid');
    grid.forEach((row, rIndex)=>{
      row.forEach((cell, cIndex)=>{
        if(cell === 0){
          grid[rIndex][cIndex] = 2;
        }
      });
    });
  },
  movePacMan(direction, amount){
    let inputBlocked = this.get('isMoving') || this.pathBlockedInDirection(direction);
      // do moving magic
    if (!inputBlocked) {
      this.set('direction', direction);
      this.set('isMoving', true);
      this.movementLoop();
    }
  },
  movementLoop(){
    if(this.get('frameCycle') === this.get('framesPerMovement')){
      let direction = this.get('direction');
      this.set('x', this.nextCoordinate('x', direction));
      this.set('y', this.nextCoordinate('y', direction));
      
      this.set('isMoving', false);
      this.set('frameCycle', 1);
      this.processAnyPellets();
    }
    else {
      this.incrementProperty('frameCycle');
      Ember.run.later(this, this.movementLoop, 1000/60);
    }
 
    this.clearScreen();
    this.drawGrid();
    this.drawPac();
  },
  nextCoordinate(coordinate, direction){
    return this.get(coordinate) + this.get(`directions.${direction}.${coordinate}`);
  },
  pathBlockedInDirection(direction){
    let cellTypeInDirection = this.cellTypeInDirection(direction);
    return Ember.isEmpty(cellTypeInDirection) || cellTypeInDirection === 1;
  },
  cellTypeInDirection(direction){
    let nextX = this.nextCoordinate('x', direction);
    let nextY = this.nextCoordinate('y', direction);

    return this.get(`grid.${nextY}.${nextX}`);
  },
  keyboardShortcuts: {
    up(){ 
      this.movePacMan('up');
    },
    down(){ 
      this.movePacMan('down');
    },
    left(){ 
      this.movePacMan('left');
    },
    right(){ 
      this.movePacMan('right');
    },
  }
});

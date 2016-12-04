import Ember from 'ember';

export default Ember.Object.extend({
  grid: [
    [2, 2, 2, 2, 2, 2, 2, 1],
    [2, 1, 2, 1, 2, 2, 2, 1],
    [2, 2, 1, 2, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1]
  ],
  squareSize: 40,
  startingPac: {
    x: 0,
    y: 0
  },
  width: Ember.computed(function(){
    return this.get('grid.firstObject.length');
  }),
  height: Ember.computed(function(){
    return this.get('grid.length');
  }),
  pixelWidth: Ember.computed(function(){
    return this.get('width') * this.get('squareSize');
  }),
  pixelHeight: Ember.computed(function(){
    return this.get('height') * this.get('squareSize');
  }),
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
  restart(){
    let grid = this.get('grid');
    grid.forEach((row, rIndex) => {
      row.forEach((cell, cIndex) => {
        if (cell === 0){
          grid[rIndex][cIndex] = 2;
        }
      });
    });
  }
});

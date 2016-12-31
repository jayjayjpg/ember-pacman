import Ember from 'ember';

export default Ember.Mixin.create({
  x: null,
  y: null,
  level: null,
  timers: [],
  direction: 'down',
  move(){
    if (this.get('removed')){
      // nothing to do
    }
    else if(this.animationCompleted()){
      this.finalizeMove();
      this.changeDirection();
    }
    else if (this.get('direction') === 'stopped') {
      this.changeDirection();
    }
    else {
      this.incrementProperty('frameCycle');
    }

    this.tickTimers();
  },

  animationCompleted(){
    return this.get('frameCycle') === this.get('framesPerMovement');
  },

  finalizeMove(){
    let direction = this.get('direction');
    this.set('x', this.nextCoordinate('x', direction));
    this.set('y', this.nextCoordinate('y', direction));

    this.set('frameCycle', 1);
  },
  pathBlockedInDirection(direction){
    let cellTypeInDirection = this.cellTypeInDirection(direction);

    return Ember.isEmpty(cellTypeInDirection) || cellTypeInDirection === 1;
  },

  cellTypeInDirection(direction){
    let nextX = this.nextCoordinate('x', direction);
    let nextY = this.nextCoordinate('y', direction);

    // another 15mins to find out that the grid is now defined on the level model 
    return this.get(`level.grid.${nextY}.${nextX}`);
  },
 
  nextCoordinate(coordinate, direction){
    let next = this.get(coordinate) + this.get(`directions.${direction}.${coordinate}`);
    if (this.get('level.teleport')){
      if(direction === 'up' || direction === 'down'){
        return this.modulo(next, this.get('level.height'));
        }
        else {
          return this.modulo(next, this.get('level.width'));
        }
    }
    else {
      return next;
    }
  },

  tickTimers(){
    this.get('timers').forEach((timerName)=> {
      if (this.get(timerName) > 0){
        this.decrementProperty(timerName);
      }
    });
  },

  modulo(num, mod){
    return ((num + mod) % mod);
  }
});

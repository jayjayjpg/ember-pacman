import Ember from 'ember';
import SharedStuff from '../mixins/shared-stuff';
import Movement from '../mixins/movement';

export default Ember.Object.extend(SharedStuff, Movement, {
  direction: null,
  intent: null,
  x: null,
  y: null,
  retreatTime: 0,
  maxRetreatTime: 500,
  timers: ['retreatTime'],
  level: null,
  removed: false,
  init(){
    this.set('startingX', this.get('x'));
    this.set('startingY', this.get('y'));
    return this._super(...arguments);
  },
  draw(){
    let x = this.get('x');
    let y = this.get('y');
    let radiusDivisor = 2;
    this.drawCircle(x, y, radiusDivisor, this.get('direction'), this.get('color'));
  },
  restart(){
    this.set('retreatTime', this.get('maxRetreatTime'));
    this.set('x', this.get('startingX'));
    this.set('y', this.get('startingY'));
    this.set('frameCycle', 0);
    this.set('direction', 'stopped');
  },
  changeDirection(){
    let directions = ['left', 'right', 'up', 'down'];
    let directionWeights = directions.map((direction)=> {
      return this.chanceOfPacmanIfInDirection(direction);
    });

    let bestDirection = this.getRandomItem(directions, directionWeights);
    this.set('direction', bestDirection);
  },
  chanceOfPacmanIfInDirection(direction){
    if (this.pathBlockedInDirection(direction)){
      return 0;
    }
    else {
        let attractionRate = ((this.get('pac.y') - this.get('y')) * this.get(`directions.${direction}.y`)) + ((this.get('pac.x') - this.get('x')) * this.get(`directions.${direction}.x`));
        if (this.get('pac.powerMode')){
          attractionRate *= -1; 
        }
      return Math.max(attractionRate, 0) + 0.2;
    }
  },
  getRandomItem(list, weight){
    var totalWeight = weight.reduce(function(prev, curr) {
      return prev + curr;
    });
    var randomNum = Math.random() * totalWeight;
    var weightSum = 0;

    for (var i = 0; i < list.length; i += 1){
      weightSum += weight[i];
      weightSum = Number(weightSum.toFixed(2));

      if (randomNum < weightSum){
        return list[i];
      }
      
    }
  },
  retreat(){
    this.set('removed', true);
    this.set('frameCycle', 0);
    this.set('x', this.get('level.ghostRetreat.x'));
    this.set('y', this.get('level.ghostRetreat.y'));
  },
  color: Ember.computed('retreatTime', function(){
    let timerPercentage = this.get('retreatTime') / this.get('maxRetreatTime');
    let retreated = {r: 20, g: 20, b: 20};
    let normal = {r: 100, g: 40, b: 40};
    let [r,g,b] = ['r','g','b'].map(function(rgbSelector){
      let color = retreated[rgbSelector] * timerPercentage + normal[rgbSelector] * (1 - timerPercentage);
      return Math.round(color);
    });
    return `rgb(${r}%,${g}%,${b}%)`;
  })
});

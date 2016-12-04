import Level from './level';

export default Level.extend({
  squareSize: 60,
  startingPac: {
    x: 0,
    y: 3
  },
  grid: [
    [2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 1, 1, 2, 1, 2, 1, 1, 2],
    [2, 1, 2, 2, 2, 2, 2, 1, 2],
    [2, 2, 2, 1, 1, 1, 2, 2, 2],
    [2, 1, 2, 2 ,2, 2, 2, 1, 2],
    [2, 1, 1, 2, 1, 2, 1, 1, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2],
  ]
});
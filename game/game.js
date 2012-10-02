(function() {
  var detect_move, move_down, move_up;

  move_down = function(position) {
    return position - 10;
  };

  move_up = function(position) {
    return position + 10;
  };

  detect_move = function(state_messages, racket_positions) {
    var side;
    for (side = 0; side <= 1; side++) {
      if (state_messages[side] === -1) {
        racket_positions[side] = move_down(racket_positions[side]);
      } else if (state_messages[side] === 1) {
        racket_positions[side] = move_up(racket_positions[side]);
      }
      if (racket_positions[0] < 0) racket_positions[0] = 0;
      if (racket_positions[1] < 0) racket_positions[1] = 0;
      if (racket_positions[0] > 440 - 55) racket_positions[0] = 440 - 55;
      if (racket_positions[1] > 440 - 55) racket_positions[1] = 440 - 55;
    }
    console.log(racket_positions);
    return racket_positions;
  };

  module.exports = detect_move;

}).call(this);

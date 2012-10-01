move_down = (position) ->
  position - 10

move_up = (position) ->
  position + 10

detect_move = (state_messages, racket_positions) ->
  for side in [0..1]
    if (state_messages[side]) == -1
      racket_positions[side] = move_down(racket_positions[side])
    else if (state_messages[side]) == 1
      racket_positions[side] = move_up(racket_positions[side])
    racket_positions[0] = 0 if racket_positions[0] < 0
    racket_positions[1] = 0 if racket_positions[1] < 0
    racket_positions[0] = 440 - 55 if racket_positions[0] > 440 - 55
    racket_positions[1] = 440 - 55 if racket_positions[1] > 440 - 55
  console.log racket_positions
  racket_positions

module.exports = detect_move
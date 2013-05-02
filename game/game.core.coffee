class GameCore

  constructor: ->
    @canvasWidth = 780
    @canvasHeight = 440
    @xOffset = 20 # inner side x offset of the racket from the border 

    @racketHeight = 55
    @racketWidth = 10
    @ballSize = 8
    @racketV = 0.15 # px per ms

    @dirUp = -1
    @dirIdle = 0
    @dirDown = 1

    @gs = [{pos: 10, dir: @dirIdle, updates: []}, {pos: 10, dir: @dirIdle, updates: []}]

    @maxBallV = 0.4
    @initBallV = 0.2
    @minBallV = 0.1
    @speedUp = 0.9 # ball speed up coefficient, should be lte than 1

    @ball =
      pos:
        x: (@canvasWidth / 2 - @ballSize / 2)
        y: (@canvasHeight / 2 - @ballSize / 2)
      angle: ((20 + Math.random()*50)*Math.PI/180)
      v: 0.2 # speed in px per ms
      t: 0

    @updateTime = null
    @dt = 20 # FIXME that's not a delta time anymore
    @lastProcessedSeq = -1

  time: ->
    new Date().getTime()

  moveRacket: (dir, dirUpdates, pos, currentTime, beforeTime) ->
    for upd in dirUpdates
      continue if upd.t <= beforeTime or upd.t > currentTime
      pos = @moveRacketBit pos, dir, (upd.t - beforeTime)
      beforeTime = upd.t
      dir = upd.dir
      @lastProcessedSeq = upd.seq
    return @moveRacketBit pos, dir, (currentTime - beforeTime)

  moveRacketBit: (pos, dir, dt) ->
    newPos =
      if dir == @dirUp
        pos - @racketV * dt
      else if dir == @dirDown
        pos + @racketV * dt
      else pos
    newPos = 0 if newPos < 0
    newPos = @canvasHeight - @racketHeight if newPos > @canvasHeight - @racketHeight
    newPos

  moveBall: (ballUpdates, currentTime, dt) ->
    beforeTime = currentTime - dt
    # Find last ball update in this time interval and move it delta time
    for b in ballUpdates by -1
      ball = b
      (found = true; break) if b.t >= beforeTime and b.t <= currentTime
    ball = ballUpdates[ballUpdates.length-1] unless found
    return @moveBallBit ball, (currentTime - ball.t)

  moveBallBit: (ball, dt) ->
    ds = ball.v * dt
    ball.pos.x += ds * Math.cos(ball.angle)
    ball.pos.y += ds * Math.sin(ball.angle)
    ball.t += dt
    return @checkBallCollision ball

  checkBallCollision: (ball) ->
    if ball.pos.y < 0
      ball.pos.y = 0
      ball.angle = - ball.angle
    else if ball.pos.y > @canvasHeight - @ballSize
      ball.pos.y = @canvasHeight - @ballSize
      ball.angle = - ball.angle
    else if ball.pos.x <= @xOffset
      if ball.pos.y >= @gs[0].pos && ball.pos.y <= @gs[0].pos + @racketHeight - @ballSize
        ball.pos.x = @xOffset
        ball.angle = Math.PI - ball.angle
        ball.v = ball.v * (@speedUp + Math.abs(ball.pos.y - @gs[0].pos + @racketHeight / 2) / (@gs[0].pos + @racketHeight / 2))
        if ball.v >= @maxBallV
          ball.v = @maxBallV
        else if ball.v <= @minBallV
          ball.v = @minBallV
        else
          ball.v = ball.v * (@speedUp + Math.abs(ball.pos.y - @gs[0].pos + @racketHeight / 2) / (@gs[0].pos + @racketHeight / 2))
    else if ball.pos.x >= @canvasWidth - @xOffset - @ballSize
      if ball.pos.y >= @gs[1].pos && ball.pos.y <= @gs[1].pos + @racketHeight - @ballSize
        ball.pos.x = @canvasWidth - @xOffset - @ballSize
        ball.angle = Math.PI - ball.angle
        ball.v = ball.v * (@speedUp + Math.abs(ball.pos.y - @gs[0].pos + @racketHeight / 2) / (@gs[0].pos + @racketHeight / 2))
        if ball.v >= @maxBallV
          ball.v = @maxBallV
        else if ball.v <= @minBallV
          ball.v = @minBallV
    return ball


if typeof(module) == 'undefined'
  window.GameCore = GameCore
else
  module.exports = GameCore

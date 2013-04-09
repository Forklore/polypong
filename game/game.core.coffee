class GameCore

  constructor: ->
    @canvasWidth = 780
    @canvasHeight = 440
    @xOffset = 20 # inner side x offset of the racket from the border 

    @racketHeight = 55
    @racketWidth = 10
    @racketStep = 10

    @dirUp = -1
    @dirIdle = 0
    @dirDown = 1

    @ballSize = 8

    @gs = [{pos: 10, dir: @dirIdle}, {pos: 10, dir: @dirIdle}]
    @ballPosition = [@canvasWidth / 2 - @ballSize / 2, @canvasHeight / 2 - @ballSize / 2]

    @angle = (20 + Math.random()*50)*Math.PI/180
    @ballV = 200 # pixels per second
    @dt = 20
    @dtInSec = @dt/1000

  moveRacket: (dirUpdates, pos) ->
    newPos = pos
    if dirUpdates.length
      # FIXME just take last update for now
      dir = dirUpdates[dirUpdates.length-1].dir
      newPos =
        if dir == @dirUp
          pos - @racketStep
        else if dir == @dirDown
          pos + @racketStep
        else pos
      newPos = 0 if newPos < 0
      newPos = @canvasHeight - @racketHeight if newPos > @canvasHeight - @racketHeight
    newPos

  moveBall: ->
    ds = @ballV * @dtInSec
    @ballPosition[0] += Math.round( ds * Math.cos(@angle) )
    @ballPosition[1] += Math.round( ds * Math.sin(@angle) )
    @checkBallCollision()

  checkBallCollision: ->
    if @ballPosition[1] < 0
      @ballPosition[1] = 0
      @angle = - @angle
      return
    if @ballPosition[1] > @canvasHeight - @ballSize
      @ballPosition[1] = @canvasHeight - @ballSize
      @angle = - @angle
      return
    if @ballPosition[0] <= @xOffset
      if @ballPosition[1] >= @gs[0].pos && @ballPosition[1] <= @gs[0].pos + @racketHeight - @ballSize
        @ballPosition[0] = @xOffset
        @angle = Math.PI - @angle
        return
    if @ballPosition[0] >= @canvasWidth - @xOffset - @ballSize
      if @ballPosition[1] >= @gs[1].pos && @ballPosition[1] <= @gs[1].pos + @racketHeight - @ballSize
        @ballPosition[0] = @canvasWidth - @xOffset - @ballSize
        @angle = Math.PI - @angle
        return


if typeof(module) == 'undefined'
  window.GameCore = GameCore
else
  module.exports = GameCore

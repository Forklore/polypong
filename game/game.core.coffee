class GameCore

  constructor: ->
    @canvasWidth = 780
    @canvasHeight = 440
    @xOffset = 20 # inner side x offset of the racket from the border 

    @racketHeight = 55
    @racketWidth = 10
    @racketStep = 10

    @ballSize = 8
    @ballPosition = [@canvasWidth / 2 - @ballSize / 2, @canvasHeight / 2 - @ballSize / 2]

    @angle = (20 + Math.random()*50)*Math.PI/180
    @ballV = 200 # pixels per second
    @dt = 20
    @dtInSec = @dt/1000

    @dirUp = -1
    @dirIdle = 0
    @dirDown = 1

  moveRacket: (state, pos) ->
    newPos =
      if state == @dirUp
        pos - @racketStep
      else if state == @dirDown
        pos + @racketStep
      else pos
    newPos = 0 if newPos < 0
    newPos = @canvasHeight - @racketHeight if newPos > @canvasHeight - @racketHeight
    newPos

  moveBall: ->
    ds = @ballV * @dtInSec
    @ballPosition[0] += Math.round( ds * Math.cos(@angle) )
    @ballPosition[1] += Math.round( ds * Math.sin(@angle) )

  checkBallCollision: ->
    console.log "Ball collision: #{@ballPosition}"
    if @ballPosition[1] < 0
      @ballPosition[1] = 0
      @angle = - @angle
      console.log "Ball collision <0: #{@ballPosition}"
      return
    if @ballPosition[1] > @canvasHeight - @ballSize
      @ballPosition[1] = @canvasHeight - @ballSize
      @angle = - @angle
      console.log "Ball collision >height: #{@ballPosition}"
      return
    if @ballPosition[0] <= @xOffset
      if @ballPosition[1] >= @yPositions[0] && @ballPosition[1] <= @yPositions[0] + @racketHeight - @ballSize
        @ballPosition[0] = @xOffset
        @angle = Math.PI - @angle
        console.log "Ball collision <xoffset: #{@ballPosition}"
        return
    if @ballPosition[0] >= @canvasWidth - @xOffset - @ballSize
      if @ballPosition[1] >= @yPositions[1] && @ballPosition[1] <= @yPositions[1] + @racketHeight - @ballSize
        @ballPosition[0] = @canvasWidth - @xOffset - @ballSize
        @angle = Math.PI - @angle
        console.log "Ball collision >width: #{@ballPosition}"
        return


if typeof(module) == 'undefined'
  window.GameCore = GameCore
else
  module.exports = GameCore

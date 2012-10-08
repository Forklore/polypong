window.Game = class Game

  constructor: ->
    # Vars
    @upPressed = false
    @downPressed = false
    @yPositions = [10, 10]
    @side = 0
    @enemySide = 1
    @ballPos = [100, 100]
    @angle = (20 + Math.random()*50)*Math.PI/180

    # Constants
    @canvasWidth = 780
    @canvasHeight = 440
    @racketHeight = 55
    @racketWidth = 10
    @ballSize = 8

    @dy = 5
    @dt = 20
    @dtInSec = @dt/1000
    @ballV = 200 # pixels per second

    @keyLeft = 37
    @keyUp = 38
    @keyRight = 39
    @keyDown = 40
    @keySpace = 32

    @dirUp = -1
    @dirIdle = 0
    @dirDown = 1
    @playersStartPos = [[10, 80], [760, @canvasHeight - 80 - @racketHeight]]
    @racketColor = '#fff'


  # Drawing functions

  drawRacket: (x, y, color) ->
    @ctx.fillStyle = color
    @ctx.fillRect x, y, @racketWidth, @racketHeight

  drawBall: (x, y) ->
    @ctx.fillStyle = "rgb(200, 200, 200)"
    @ctx.fillRect x, y, @ballSize, @ballSize

  drawBoard: ->
    @ctx.clearRect 0, 0, @canvasWidth, @canvasHeight
    @ctx.fillStyle = "rgb(200, 200, 200)"
    @ctx.fillRect 389, 5, 1, 430
    @drawRacket @playersStartPos[@side][0], @yPositions[@side], @racketColor
    @drawRacket @playersStartPos[@enemySide][0], @yPositions[@enemySide], @racketColor
    @drawBall @ballPos[0], @ballPos[1]
    console.log "#{@yPositions[self.side]}, #{@yPositions[self.enemySide]}, ball: #{@ballPos}"

  # Game logic

  gameLoop: ->
    # @updateState()
    @drawBoard()

  updateState: ->
    @updateBall()

  updateBall: (ballPos) ->
    console.log(ballPos)
    @ballPos = ballPos
    # ds = @ballV * @dtInSec
    # @ballPos[0] += ds * Math.cos(@angle)
    # @ballPos[1] += ds * Math.sin(@angle)
    #
    # if @ballPos[0] < 0
    #   @ballPos[0] = 0
    #   @angle = Math.PI - @angle
    #   return
    # if @ballPos[0] > @canvasWidth - @ballSize
    #   @ballPos[0] = @canvasWidth - @ballSize
    #   @angle = Math.PI - @angle
    #   return
    # if @ballPos[1] < 0
    #   @ballPos[1] = 0
    #   @angle = - @angle
    #   return
    # if @ballPos[1] > @canvasHeight - @ballSize
    #   @ballPos[1] = @canvasHeight - @ballSize
    #   @angle = - @angle
    #   return
    #
    # ball_in_racket = @ballPos[1] >= @yPositions[0] && @ballPos[1] <= @yPositions[0] + @racketHeight
    # if @ballPos[0] < 20 && ball_in_racket
    #   @ballPos[0] = 20
    #   @angle = Math.PI - @angle
    #   return
    # ball_in_racket = @ballPos[1] >= @yPositions[1] && @ballPos[1] <= @yPositions[1] + @racketHeight
    # if @ballPos[0] > @canvasWidth - 20 && ball_in_racket
    #   @ballPos[0] = @canvasWidth - 20 - @ballSize
    #   @angle = Math.PI - @angle
    #   return


  # Keyboard functions

  keyboardDown: (evt) ->
    switch evt.which
      when @keyDown then @downPressed = true; @upPressed = false; @sendState @dirDown
      when @keyUp   then @upPressed = true; @downPressed = false; @sendState @dirUp

  keyboardUp: (evt) ->
    switch evt.which
      when @keyDown then @downPressed = false; @sendState @dirIdle unless @upPressed
      when @keyUp   then @upPressed = false; @sendState @dirIdle unless @downPressed

  sendState: (dir) ->
    @socket.emit 'state', {side: @side, state: dir}


  # Game control functions

  startGame: ->
    canvas = document.getElementById('game_board_canvas')
    @ctx = canvas.getContext '2d'
    self = @
    setInterval (-> self.gameLoop()), @dt

  start: (socket) ->
    self = @
    @socket = socket

    socket.on 'connect', ->
      console.log "Socket opened, Master!"

    socket.on 'joined', (side) ->
      self.side = side
      self.enemySide = if side == 0 then 1 else 0
      # Can't move while not joined
      $(window).on 'keydown', (e) -> self.keyboardDown e
      $(window).on 'keyup', (e) -> self.keyboardUp e

    socket.on 'move', (data) ->
      self.yPositions = data.positions
      self.ballPos = data.ballPosition
      # console.log "#{self.y_positions[self.side]}, #{self.y_positions[self.enemy_side]}, ball: #{data.ballPosition}"

    socket.on 'busy', (data) ->

    socket.emit 'join'


    @startGame()
window.Game = class Game extends GameCore

  constructor: ->
    super()

    # Vars
    @upPressed = false
    @downPressed = false
    @side = 0
    @enemySide = 1
    @scores = [0, 0]

    # Game flags
    @updateScoreFlag = true

    # Constants
    @keyLeft = 37
    @keyUp = 38
    @keyRight = 39
    @keyDown = 40
    @keySpace = 32

    @startPos = [[10, 80], [760, @canvasHeight - 80 - @racketHeight]]
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
    @drawRacket @startPos[@side][0], @gs[@side].pos, @racketColor
    @drawRacket @startPos[@enemySide][0], @gs[@enemySide].pos, @racketColor
    @drawBall @ballPosition[0], @ballPosition[1]

  # Game logic

  gameLoop: ->
    @updateState()
    @drawBoard()
    @updateScores() if @updateScoreFlag

  updateState: ->
    @updateBall()
    enemy = @gs[@enemySide]
    # Interpolate enemy moves
    enemy.pos = @moveRacket enemy.state, enemy.pos
    me = @gs[@side]
    me.pos = @moveRacket @dir(), me.pos

  dir: ->
    if @upPressed then @dirUp else if @downPressed then @dirDown else @dirIdle

  updateBall: ->
    @moveBall()
    @checkBallCollision()

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
    @socket.emit 'state', {state: dir}

  # Game view update

  updateScores: ->
    $('#score_' + @side).text @scores[@side]
    $('#score_' + @enemySide).text @scores[@enemySide]
    @updateScoreFlag = false
  
  # Game control functions

  startGame: ->
    canvas = document.getElementById('game_board_canvas')
    @ctx = canvas.getContext '2d'
    setInterval (=> @gameLoop()), @dt

  start: (socket) ->
    @socket = socket

    socket.on 'connect', =>
      console.log "Socket opened, Master!"

    socket.on 'joined', (side) =>
      @side = side
      @enemySide = if side == 0 then 1 else 0
      # Can't move while not joined
      $(window).on 'keydown', (e) => @keyboardDown e
      $(window).on 'keyup', (e) => @keyboardUp e

    socket.on 'move', (data) =>
      @gs = data.gamers
      @ballPosition = data.ball.pos
      @ballV = data.ball.v
      @angle = data.ball.angle

    socket.on 'score', (data) =>
      @scores = data.scores
      @updateScoreFlag = true

    socket.on 'busy', (data) =>

    socket.emit 'join'

    @startGame()

window.Game = class Game extends GameCore

  constructor: ->
    super()

    # Vars
    @upPressed = false
    @downPressed = false
    @dir = @dirIdle
    @side = 0
    @enemySide = 1
    @scores = [0, 0]
    @dirUpdates = [] # arrays of games inputs
    @seq = -1        # sequence number for acknowledgements

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

  updateState: ->
    lastTime = new Date(@updateTime)
    @updateTime = @time()
    @moveBall()
    enemy = @gs[@enemySide]
    # FIXME Interpolate enemy moves
    enemy.pos = @moveRacket enemy.dir, enemy.updates, enemy.pos, @updateTime, lastTime
    me = @gs[@side]
    me.pos = @moveRacket me.dir, @dirUpdates, me.pos, @updateTime, lastTime #FIXME

  # Keyboard functions

  keyboardDown: (evt) ->
    switch evt.which
      when @keyDown then @downPressed = true; @upPressed = false; @dir = @dirDown
      when @keyUp   then @upPressed = true; @downPressed = false; @dir = @dirUp
    @sendState @dir

  keyboardUp: (evt) ->
    switch evt.which
      when @keyDown 
        @downPressed = false
        unless @upPressed
          @dir = @dirIdle
          @sendState @dirIdle
      when @keyUp
        @upPressed = false
        unless @downPressed
          @dir = @dirIdle
          @sendState @dirIdle

  sendState: (dir) ->
    @dirUpdates.push { dir: dir, seq: ++@seq, t: @time() }
    @socket.emit 'state', {dir: dir, side: @side, seq: @seq}

  # Game view update

  updateScore: (scores) ->
    for scr, ind in scores
      $('#score_' + ind).text scr
  
  # Game control functions

  startGame: ->
    canvas = document.getElementById 'game_board_canvas'
    @ctx = canvas.getContext '2d'
    @updateTime = @time()
    setInterval (=> @gameLoop()), @dt

  seq2index: (seq) ->
    for upd, ind in @dirUpdates
      return ind if upd.seq == seq
    -1

  start: (socket) ->
    @socket = socket

    socket.on 'connect', =>
      @info "Socket opened, Master!"

    socket.on 'joined', (side) =>
      @side = side
      @enemySide = if side == 0 then 1 else 0
      # Can't move while not joined
      $(window).on 'keydown', (e) => @keyboardDown e
      $(window).on 'keyup', (e) => @keyboardUp e

    socket.on 'move', (data) =>
      @gs = data.gamers
      ind = @seq2index @gs[@side].lastSeq
      @dirUpdates.splice 0, (ind + 1)
      @debug "Splices upto #{ind + 1}, now there is updates:" if @dirUpdates.length
      for upd in @dirUpdates
        @debug "\tseq: #{upd.seq}"
      @ballPosition = data.ball.pos
      @ballV = data.ball.v
      @angle = data.ball.angle

    socket.on 'score', (data) =>
      @updateScore data.scores

    socket.on 'busy', (data) =>

    socket.on 'disconnect', =>
      # TODO @stopGame()
      $(window).off 'keydown'
      $(window).off 'keyup'

    socket.emit 'join'

    @startGame()

window.Game = class Game extends GameCore

  constructor: ->
    super()

    # Vars
    @loopHandle
    @upPressed = false
    @downPressed = false
    @dir = @dirIdle # Current moving direction on the moment of updateState function (or last moving direction after update, if you prefer)
    @side = 0
    @enemySide = 1
    @scores = [0, 0]
    @dirUpdates = [] # arrays of games inputs
    @seq = -1        # sequence number for acknowledgements
    @pos
    @serverTime = 0
    @ballUpdates = []
    @ghostBall

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

  drawBall: (ball, color) ->
    @ctx.fillStyle = color
    @ctx.fillRect ball.pos.x, ball.pos.y, @ballSize, @ballSize

  drawBoard: ->
    @ctx.clearRect 0, 0, @canvasWidth, @canvasHeight
    @ctx.fillStyle = 'rgb(200,200,200)'
    @ctx.fillRect 389, 5, 1, 430
    @drawRacket @startPos[@side][0], @gs[@side].pos, @racketColor
    @drawRacket @startPos[@enemySide][0], @gs[@enemySide].pos, @racketColor
    @drawBall @ball, 'rgb(200,200,200)'
    @drawBall @ghost, '#0f0' if @ghost?

  # Game logic

  gameLoop: ->
    @updateState()
    @drawBoard()

  # FIXME what a mess
  updateState: ->
    time = @time()
    dt = time - @updateTime
    if @serverTime > 0
      @serverTime += dt
      @ball = @moveBall @ballUpdates, @serverTime, dt
    else
      @ball.t = @updateTime
      @ball = @moveBall [@ball], time, dt
    enemy = @gs[@enemySide]
    # FIXME Interpolate enemy moves
    enemy.pos = @moveRacket enemy.dir, enemy.updates, enemy.pos, time, @updateTime # FIXME no need to save current @dir, store only previous update
    me = @gs[@side]
    @pos = @moveRacket @dir, @dirUpdates, @pos, time, @updateTime
    me.pos = @pos # FIXME from gs shoulg go, just don't replace it from the server
    @dir = @dirUpdates[@dirUpdates.length-1].dir if @dirUpdates.length # FIXME: this can go in @gs structure, but shouldn't be rewritten by server
    console.log "server time #{@serverTime}"
    @updateTime = time

  # Keyboard functions

  keyboardDown: (evt) ->
    switch evt.which
      when @keyDown then @downPressed = true; @upPressed = false; @sendState @dirDown
      when @keyUp   then @upPressed = true; @downPressed = false; @sendState @dirUp

  keyboardUp: (evt) ->
    switch evt.which
      when @keyDown
        @downPressed = false
        unless @upPressed
          @sendState @dirIdle
      when @keyUp
        @upPressed = false
        unless @downPressed
          @sendState @dirIdle

  sendState: (dir) ->
    @dirUpdates.push { dir: dir, seq: ++@seq, t: @time() }
    @socket.emit 'state', { dir: dir, side: @side, seq: @seq }

  # Game view update

  updateScore: (scores) ->
    for scr, ind in scores
      $('#score_' + ind).text scr

  # Game control functions

  startGame: ->
    canvas = document.getElementById 'game_board_canvas'
    @ctx = canvas.getContext '2d'
    @updateTime = @time()
    @loopHandle = requestInterval (=> @gameLoop()), @dt

  stopGame: ->
    $(window).off 'keydown'
    $(window).off 'keyup'
    clearRequestInterval @loopHandle

  seq2index: (seq) ->
    for upd, ind in @dirUpdates
      return ind if upd.seq == seq
    -1

  time2index: (leaveTime) ->
    ind = -1
    for b in @ballUpdates
      break if b.t >= leaveTime # Leave a second worth of updates
      ind += 1
    ind

  start: (socket) ->
    @socket = socket

    socket.on 'connect', =>
      console.log "Socket opened, Master!"

    socket.on 'joined', (data) =>
      @serverTime = data.t# + 100 # FIXME net delay
      @side = data.side
      @enemySide = if @side == 0 then 1 else 0
      @ballUpdates = []
      @dirUpdates = []
      # Can't move while not joined
      $(window).on 'keydown', (e) => @keyboardDown e
      $(window).on 'keyup', (e) => @keyboardUp e

    socket.on 'move', (data) =>
      @gs = data.gamers
      howmany = 1 + @time2index (@serverTime - 1000)
      @ballUpdates.splice 0, howmany # FIXME splice is slow
      @ballUpdates.push data.ball
      @ghost = data.ball

      @pos = @gs[@side].pos if @pos == undefined
      if @gs[@side].lastSeq <= @lastProcessedSeq
        howmany = 1 + @seq2index(@gs[@side].lastSeq)
        @dirUpdates.splice 0, howmany # FIXME splice is slow

    socket.on 'score', (data) =>
      @updateScore data.scores

    socket.on 'busy', (data) =>

    socket.on 'disconnect', =>
      console.log 'Server disconnect'
      @stopGame()

    socket.emit 'join'

    @startGame()

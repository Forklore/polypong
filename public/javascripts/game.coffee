window.Game = class Game

  @canvas_width = 700
  @canvas_height = 400
  @racket_height = 55
  @racket_width = 10

  @dy = 5

  @key_left = 37
  @key_up = 38
  @key_right = 39
  @key_down = 40

  @players_pos = [10, 680]
  @players_colors = ['rgb(200,0,0)', 'rgb(0,0,200)']
  @players_states = [0, 0]

  constructor: ->
    @up_pressed = false
    @down_pressed = false
    @y_positions = [10, 10]
    @side = 0
    @enemy_side = 1

  # Drawing functions

  drawRacket: (x, y, color) ->
    @ctx.fillStyle = color
    @ctx.fillRect x, y, Game.racket_width, Game.racket_height

  drawBall: (x, y) ->
    @ctx.fillStyle = "rgb(100, 100, 0)"
    @ctx.arc x, y, 5, 0, Math.PI*2, true
    @ctx.fill()

  drawBoard: ->
    @processInputs()
    @ctx.clearRect 0, 0, Game.canvas_width, Game.canvas_height
    @drawRacket Game.players_pos[@side], @y_positions[@side], Game.players_colors[@side]
    @drawRacket Game.players_pos[@enemy_side], @y_positions[@enemy_side], Game.players_colors[@enemy_side]
    @drawBall 100, 100
    this.sendState()

  # Keyboard functions

  keyboardDown: (evt) ->
    switch evt.which
      when Game.key_down then @down_pressed = true; @up_pressed = false
      when Game.key_up   then @up_pressed = true; @down_pressed = false

#  keyboardUp: (evt) ->
#    switch evt.which
#      when Game.key_down then @down_pressed = false
#      when Game.key_up   then @up_pressed = false

  processInputs: ->
    if @up_pressed
      #@y_positions -= Game.dy
      Game.players_states[@side] = -1
    else if @down_pressed
      #@y_positions += Game.dy
      Game.players_states[@side] = 1
    else
      Game.players_states[@side] = 0
    console.log Game.players_states[@side]

  sendState: ->
    @socket.emit 'state', {side: @side, state: Game.players_states[@side]}

  # Game control functions

  startGame: ->
    canvas = document.getElementById('game_board_canvas')
    @ctx = canvas.getContext '2d'
    @drawBoard()
    self = @
    setInterval (-> self.drawBoard()), 500

  start: (socket) ->
    self = @
    @socket = socket

    socket.on 'connect', ->
      console.log "Socket opened, Master!"

    socket.on 'joined', (side) ->
      self.side = side
      self.enemy_side = if side == 0 then 1 else 0
      # Can't move while not joined
      $(window).on 'keydown', (e) -> self.keyboardDown e
      #$(window).on 'keyup', (e) -> self.keyboardUp e
      console.log 'Joined'

    socket.on 'move', (data) ->
      self.y_positions[self.side] = data.positions[self.side]
      self.y_positions[self.enemy_side] = data.positions[self.enemy_side]
      console.log "#{self.y_positions[self.side]}, #{self.y_positions[self.enemy_side]}"
      @down_pressed = false
      @up_pressed = false
      @players_states = [0, 0]
      self.drawBoard()

    socket.emit 'join'



    @startGame()

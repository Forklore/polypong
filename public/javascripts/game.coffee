window.Game = class Game

  canvas_width = 700
  canvas_height = 400
  height = 55
  width = 10

  @key_left = 37
  @key_up = 38
  @key_right = 39
  @key_down = 40

  up_pressed = false
  down_pressed = false

  my_y = 10
  @dy = 5

  constructor: ->

  # drawing functions

  drawRacket: (x, y, color) ->
    @ctx.fillStyle = color
    @ctx.fillRect x, y, width, height

  drawBall: (x, y) ->
    @ctx.fillStyle = "rgb(100, 100, 0)"
    @ctx.arc x, y, 5, 0, Math.PI*2, true
    @ctx.fill()

  drawBoard: ->
    @processInputs()
    @ctx.clearRect 0, 0, canvas_width, canvas_height
    @drawRacket 10, my_y, "rgb(200,0,0)"
    @drawRacket 680, 10, "rgb(0,0,200)"
    @drawBall 100, 100

  # Keyboard functions

  keyboardDown: (evt) ->
    switch evt.which
      when Game.key_down then down_pressed = true; up_pressed = false
      when Game.key_up   then up_pressed = true; down_pressed = false

  keyboardUp: (evt) ->
    switch evt.which
      when Game.key_down then down_pressed = false
      when Game.key_up   then up_pressed = false

  processInputs: ->
    if up_pressed
      my_y -= Game.dy
    else if down_pressed
      my_y += Game.dy

  startGame: ->
    canvas = document.getElementById('game_board_canvas')
    @ctx = canvas.getContext '2d'
    @drawBoard()
    $(window).on 'keydown', @keyboardDown
    $(window).on 'keyup', @keyboardUp
    self = @
    setInterval (-> self.drawBoard()), 20

  start: (socket) ->
    socket.on 'connect', ->
      console.log "Socket opened, Master!"

    socket.on 'state', (data) ->
      console.log "Whoa, he moved"

    socket.on 'joined', (side) ->
      console.log "I'm at #{side} side"

    socket.emit 'join'
    socket.emit 'state', moved: Math.random()

    @startGame()

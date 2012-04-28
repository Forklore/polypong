@canvas_width = 700
@canvas_height = 400
@height = 55
@width = 10

# drawing functions
drawRacket = (ctx, x, y, color) ->
  ctx.fillStyle = color
  ctx.fillRect x, y, @width, @height

drawBall = (ctx, x, y) ->
  ctx.fillStyle = "rgb(100, 100, 0)"
  ctx.arc x, y, 5, 0, Math.PI*2, true  
  ctx.fill()

game = ->
  canvas = document.getElementById('game_board_canvas')
  ctx = canvas.getContext '2d'
  drawRacket ctx, 10, 10, "rgb(200,0,0)"
  drawRacket ctx, 680, 10, "rgb(0,0,200)"
  drawBall ctx, 100, 100

$ ->
  game()
express = require 'express'
routes = require './routes'
io = require 'socket.io'
http = require 'http'

# classes
Game = require './game/game'

# functions
# still no functions imported here...

app = express()
app.configure ->
  app.set "views", __dirname + "/views"
  app.set "view engine", "jade"
  app.use express.bodyParser()
  app.use express.cookieParser()
  app.use express.session {secret: 'thisisasecretnobodyshouldseehoweverthisisdevwhowantstohackponggameanyway?' }
  app.use express.methodOverride()
  app.use app.router
  app.use '/public', express.static(__dirname + '/public')

app.configure 'development', ->
  app.use express.errorHandler(
    dumpExceptions: true, showStack: true
  )

app.configure 'production', ->
  app.use express.errorHandler()

app.get '/', routes.index
app.get '/about', routes.about

port = process.env['app_port'] || 3000

srv = http.createServer(app)

game = new Game

# Comment log:false to see sockets debug messages
io = io.listen srv, log:false
io.sockets.on 'connection', (socket) ->
  game.connect socket

srv.listen(port)

console.log "Express server listening on port %d in %s mode", port, app.settings.env

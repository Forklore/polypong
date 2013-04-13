// Generated by CoffeeScript 1.6.1
(function() {
  var Game, app, detect_move, express, game, io, port, routes;

  express = require('express');

  routes = require('./routes');

  io = require('socket.io');

  Game = require('./game/game');

  detect_move = require('./game/game');

  app = module.exports = express.createServer();

  app.configure(function() {
    app.set("views", __dirname + "/views");
    app.set("view engine", "jade");
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
      secret: 'thisisasecretnobodyshouldseehoweverthisisdevwhowantstohackponggameanyway?'
    }));
    app.use(express.methodOverride());
    app.use(app.router);
    return app.use(express["static"](__dirname + "/public"));
  });

  app.configure('development', function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  port = process.env['app_port'] || 3000;

  app.configure('production', function() {
    return app.use(express.errorHandler());
  });

  app.get('/', routes.index);

  app.get('/game.core.js', express["static"](__dirname + "/game"));

  app.get('/about', routes.about);

  app.get('/login', routes.loginPage);

  app.post('/login', routes.loginAction);

  app.listen(port);

  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

  game = new Game;

  io = io.listen(app, {
    log: false
  });

  io.sockets.on('connection', function(socket) {
    return game.connect(socket);
  });

}).call(this);

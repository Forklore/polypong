(function() {
  var Game, PongServer, app, express, gameServer, http, io, port, routes, srv;

  express = require('express');

  routes = require('./routes');

  io = require('socket.io');

  http = require('http');

  Game = require('./game/game');

  PongServer = require('./game/pongServer');

  app = express();

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
    return app.use('/public', express.static(__dirname + '/public'));
  });

  app.configure('development', function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.configure('production', function() {
    return app.use(express.errorHandler());
  });

  app.locals({
    production: app.settings.env === 'production'
  });

  app.get('/', routes.index);

  app.get('/about', routes.about);

  port = process.env['app_port'] || 3000;

  srv = http.createServer(app);

  gameServer = new PongServer;

  io = io.listen(srv, {
    log: false
  });

  io.sockets.on('connection', function(socket) {
    return gameServer.game.connect(socket);
  });

  srv.listen(port);

  console.log("Express server listening on port %d in %s mode", port, app.settings.env);

}).call(this);

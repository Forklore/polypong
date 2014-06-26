(function() {
  var Game, app, bodyParser, cookieParser, env, errorHandler, express, game, http, io, methodOverride, port, routes, session, srv;

  express = require('express');

  routes = require('./routes');

  io = require('socket.io');

  http = require('http');

  bodyParser = require('body-parser');

  cookieParser = require('cookie-parser');

  session = require('express-session');

  methodOverride = require('method-override');

  errorHandler = require('errorhandler');

  Game = require('./game/game');

  app = express();

  app.set("views", __dirname + "/views");

  app.set("view engine", "jade");

  app.use(bodyParser());

  app.use(cookieParser());

  app.use(session({
    secret: 'thisisasecretnobodyshouldseehoweverthisisdevwhowantstohackponggameanyway?'
  }));

  app.use(methodOverride());

  app.use('/public', express["static"](__dirname + '/public'));

  env = process.env.NODE_ENV || 'development';

  if ('development' === env) {
    app.use(errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  }

  if ('production' === env) {
    app.use(errorHandler());
  }

  app.locals = {
    production: 'production' === env
  };

  app.get('/', routes.index);

  app.get('/about', routes.about);

  port = process.env['PORT'] || 3000;

  srv = http.createServer(app);

  game = new Game;

  io = io.listen(srv, {
    log: false
  });

  io.sockets.on('connection', function(socket) {
    return game.connect(socket);
  });

  srv.listen(port);

  console.log("Express server listening on port %d in %s mode", port, app.settings.env);

}).call(this);

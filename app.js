(function() {
  var Gamer, app, cookie, count, detect_move, express, gamers, init_position, io, port, racket_positions, routes, state_messages, state_messages_counter;

  express = require('express');

  routes = require('./routes');

  io = require('socket.io');

  cookie = require('cookie');

  Gamer = require('./game/gamer');

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
    return app.use(express.static(__dirname + "/public"));
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

  app.get('/about', routes.about);

  app.get('/login', routes.loginPage);

  app.post('/login', routes.loginAction);

  app.listen(port);

  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

  gamers = {};

  count = 0;

  state_messages = [0, 0];

  init_position = 440 / 2 - 40;

  racket_positions = [init_position - 60, init_position + 60];

  state_messages_counter = 0;

  io = io.listen(app);

  io.sockets.on('connection', function(socket) {
    var sid;
    sid = cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
    console.log("Have a connection: " + sid + " (socket id: " + socket.id + ")");
    socket.on('join', function(data) {
      if (sid in gamers) {
        gamers[sid].yourSide(gamers[sid].side);
        socket.emit('move', {
          positions: racket_positions
        });
        return;
      }
      if (count === 2) {
        socket.emit('busy');
        return;
      }
      console.log("I can has join: " + sid);
      gamers[sid] = new Gamer(socket);
      gamers[sid].yourSide(count);
      socket.emit('move', {
        positions: racket_positions
      });
      return count++;
    });
    socket.on('state', function(data) {
      console.log("Player " + data.side + " moving " + data.state);
      console.log(racket_positions);
      state_messages[data.side] = data.state;
      state_messages_counter++;
      if (state_messages_counter === 2) {
        console.log('sending data');
        racket_positions = detect_move(state_messages, racket_positions);
        state_messages = [0, 0];
        state_messages_counter = 0;
        return socket.emit('move', {
          positions: racket_positions
        });
      }
    });
    return socket.on('disconnect', function() {
      var gamer, id, _results;
      if (!(sid in gamers && gamers[sid].socket.id === socket.id)) return;
      console.log("Disconnecting: " + sid);
      delete gamers[sid];
      count--;
      _results = [];
      for (id in gamers) {
        gamer = gamers[id];
        if (id !== sid) {
          _results.push(gamer.heQuitted(sid));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
  });

}).call(this);

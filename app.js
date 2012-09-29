(function() {
  var Gamer, app, cookie, count, detect_move, express, gamers, init_position, io, move_down, move_up, port, racket_positions, routes, state_messages, state_messages_counter;

  express = require('express');

  routes = require('./routes');

  io = require('socket.io');

  cookie = require('cookie');

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

  Gamer = (function() {

    function Gamer(socket) {
      this.socket = socket;
    }

    Gamer.prototype.yourSide = function(side) {
      this.side = side != null ? side : 0;
      return this.socket.emit('joined', this.side);
    };

    Gamer.prototype.heMoved = function(who, where) {
      return this.socket.emit('state', where);
    };

    Gamer.prototype.heQuitted = function(who) {
      console.log('who=' + who);
      return this.socket.emit('quit', who);
    };

    return Gamer;

  })();

  gamers = {};

  count = 0;

  state_messages = [0, 0];

  init_position = 440 / 2 - 40;

  racket_positions = [init_position, init_position];

  state_messages_counter = 0;

  move_down = function(position) {
    return position - 10;
  };

  move_up = function(position) {
    return position + 10;
  };

  detect_move = function(side) {
    if (state_messages[side] === 1) {
      return racket_positions[side] = move_down(racket_positions[side]);
    } else if (state_messages[side] === -1) {
      return racket_positions[side] = move_up(racket_positions[side]);
    }
  };

  io = io.listen(app);

  io.sockets.on('connection', function(socket) {
    var sid;
    sid = cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
    console.log("Have a connection: '" + socket.id + "' with sid: '" + sid + "'");
    socket.on('join', function(data) {
      console.log("I can has join: " + socket.id);
      gamers[socket.id] = new Gamer(socket);
      gamers[socket.id].yourSide(count);
      return count++;
    });
    socket.on('state', function(data) {
      console.log("He told me that his state is " + data.state);
      state_messages_counter++;
      console.log(racket_positions);
      if (state_messages_counter === 2) {
        detect_move();
        state_messages = [0, 0];
        state_messages_counter = 0;
        return socket.emit('move', {
          positions: racket_positions
        });
      }
    });
    return socket.on('disconnect', function() {
      var gamer, id, _results;
      console.log("Disconnected: " + socket.id);
      if (gamers[socket.id]) {
        delete gamers[socket.id];
        count--;
      }
      _results = [];
      for (id in gamers) {
        gamer = gamers[id];
        if (id !== socket.id) {
          _results.push(gamer.heQuitted(socket.id));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
  });

}).call(this);

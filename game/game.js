(function() {
  var Game, cookie, timers;

  cookie = require('cookie');

  timers = require('timers');

  module.exports = Game = (function() {

    function Game() {
      var initPos;
      this.gamers = {};
      initPos = 440 / 2 - 40;
      this.positions = [initPos - 60, initPos + 60];
      this.count = 0;
      this.gameLoopTimeout = 50;
      this.gameLoop();
    }

    Game.prototype.addGamer = function(sid, socket, side) {
      this.gamers[sid] = {
        socket: socket,
        state: 0,
        side: side,
        pos: this.positions[side]
      };
      return this.tellSide(sid);
    };

    Game.prototype.tellSide = function(sid) {
      return this.gamers[sid].socket.emit('joined', this.gamers[sid].side);
    };

    Game.prototype.sendMove = function(sid) {
      return this.gamers[sid].socket.emit('move', {
        positions: this.positions
      });
    };

    Game.prototype.sendMoveAll = function() {
      var sid, _results;
      _results = [];
      for (sid in this.gamers) {
        _results.push(this.sendMove(sid));
      }
      return _results;
    };

    Game.prototype.setState = function(sid, state) {
      return this.gamers[sid].state = state;
    };

    Game.prototype.detectMove = function() {
      var gamer, sid, _ref, _results;
      _ref = this.gamers;
      _results = [];
      for (sid in _ref) {
        gamer = _ref[sid];
        if (gamer.state === -1) {
          gamer.pos -= 10;
        } else if (gamer.state === 1) {
          gamer.pos += 10;
        }
        if (gamer.pos < 0) gamer.pos = 0;
        if (gamer.pos > 440 - 55) gamer.pos = 440 - 55;
        _results.push(this.positions[gamer.side] = gamer.pos);
      }
      return _results;
    };

    Game.prototype.gameLoop = function() {
      var _this = this;
      console.log('loop started');
      return timers.setInterval(function() {
        return _this.gameStep();
      }, this.gameLoopTimeout, this);
    };

    Game.prototype.gameStep = function() {
      this.detectMove();
      return this.sendMoveAll();
    };

    Game.prototype.oneQuitted = function(sidQuit) {
      var gamer, sid, _ref, _results;
      delete this.gamers[sidQuit];
      _ref = this.gamers;
      _results = [];
      for (sid in _ref) {
        gamer = _ref[sid];
        if (sidQuit !== sid) {
          _results.push(gamer.socket.emit('quit', sid));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Game.prototype.connect = function(socket) {
      var self, sid;
      sid = cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
      console.log("Have a connection: " + sid + " (socket id: " + socket.id + ")");
      self = this;
      socket.on('join', function(data) {
        if (sid in self.gamers) {
          self.tellSide(sid);
          self.sendMove(sid);
          return;
        }
        if (self.count === 2) {
          socket.emit('busy');
          return;
        }
        console.log("I can has join: " + sid);
        self.addGamer(sid, socket, self.count);
        self.sendMove(sid);
        return self.count++;
      });
      socket.on('state', function(data) {
        console.log("Player " + data.side + " moving " + data.state);
        return self.setState(sid, data.state);
      });
      return socket.on('disconnect', function() {
        if (!(sid in self.gamers && self.gamers[sid].socket.id === socket.id)) {
          return;
        }
        console.log("Disconnecting: " + sid);
        self.oneQuitted(sid);
        return self.count--;
      });
    };

    return Game;

  })();

}).call(this);

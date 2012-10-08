(function() {
  var Game, cookie, timers;

  cookie = require('cookie');

  timers = require('timers');

  module.exports = Game = (function() {

    function Game() {
      var initPos;
      this.fieldHeight = 440;
      this.fieldWidth = 780;
      this.racketStep = 10;
      this.racketHeight = 55;
      this.racketWidth = 10;
      this.ballSize = 8;
      this.ballPosition = [this.fieldWidth / 2, this.fieldHeight / 2];
      this.ball_v = 200;
      this.dt = 20;
      this.dt_in_sec = this.dt / 1000;
      this.angle = (20 + Math.random() * 50) * Math.PI / 180;
      this.gamers = {};
      initPos = this.fieldHeight / 2 - 40;
      this.yPositions = [initPos - this.racketHeight, initPos + this.racketHeight];
      this.xOffset = 20;
      this.count = 0;
      this.gameLoop();
    }

    Game.prototype.addGamer = function(sid, socket, side) {
      this.gamers[sid] = {
        socket: socket,
        state: 0,
        side: side,
        pos: this.yPositions[side]
      };
      return this.tellSide(sid);
    };

    Game.prototype.tellSide = function(sid) {
      return this.gamers[sid].socket.emit('joined', this.gamers[sid].side);
    };

    Game.prototype.sendMove = function(sid) {
      return this.gamers[sid].socket.emit('move', {
        positions: this.yPositions
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
          gamer.pos -= this.racketStep;
        } else if (gamer.state === 1) {
          gamer.pos += this.racketStep;
        }
        if (gamer.pos < 0) gamer.pos = 0;
        if (gamer.pos > this.fieldHeight - this.racketHeight) {
          gamer.pos = this.fieldHeight - this.racketHeight;
        }
        _results.push(this.yPositions[gamer.side] = gamer.pos);
      }
      return _results;
    };

    Game.prototype.detectBallMove = function() {
      var ballInRacket, ds;
      ds = this.ball_v * this.dt_in_sec;
      this.ballPosition[0] += ds * Math.cos(this.angle);
      this.ballPosition[1] += ds * Math.sin(this.angle);
      if (this.ballPosition[0] < 0) {
        this.ballPosition[0] = 0;
        this.angle = Math.PI - this.angle;
        return;
      }
      if (this.ballPosition[0] > this.fieldWidth - this.ballSize) {
        this.ballPosition[0] = this.fieldWidth - this.ballSize;
        this.angle = Math.PI - this.angle;
        return;
      }
      if (this.ballPosition[1] < 0) {
        this.ballPosition[1] = 0;
        this.angle = -this.angle;
        return;
      }
      if (this.ballPosition[1] > this.fieldHeight - this.ballSize) {
        this.ballPosition[1] = this.fieldHeight - this.ballSize;
        this.angle = -this.angle;
        return;
      }
      ballInRacket = this.ballPosition[1] >= this.yPositions[0] && this.ballPosition[1] <= this.ballPosition[0] + this.racketHeight;
      if (this.ballPosition[0] < this.xOffset && ballInRacket) {
        this.ballPosition[0] = this.xOffset;
        this.angle = Math.PI - this.angle;
        return;
      }
      ballInRacket = this.ballPosition[1] >= this.yPositions[1] && this.ballPosition[1] <= this.yPositions[1] + this.racketHeight;
      if (this.ballPosition[0] > this.fieldWidth - this.xOffset && ballInRacket) {
        this.ballPosition[0] = this.fieldWidth - this.xOffset - this.ballSize;
        this.angle = Math.PI - this.angle;
      }
    };

    Game.prototype.gameLoop = function() {
      var _this = this;
      console.log('loop started');
      return timers.setInterval(function() {
        return _this.gameStep();
      }, this.dt);
    };

    Game.prototype.gameStep = function() {
      this.detectMove();
      this.detectBallMove();
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

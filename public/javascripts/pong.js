(function() {
  var clearRequestInterval, requestAnimFrame, requestInterval;

  requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
      return window.setTimeout(callback, 1000 / 60);
    };
  })();

  requestInterval = function(fn, delay) {
    var handle, loopy, start;
    if (!window.requestAnimationFrame && !window.webkitRequestAnimationFrame && !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && !window.oRequestAnimationFrame && !window.msRequestAnimationFrame) {
      return window.setInterval(fn, delay);
    }
    start = new Date().getTime();
    handle = new Object();
    loopy = function() {
      var current, delta;
      current = new Date().getTime();
      delta = current - start;
      if (delta >= delay) {
        start = new Date().getTime();
        fn.call();
      }
      return handle.value = requestAnimFrame(loopy);
    };
    handle.value = requestAnimFrame(loopy);
    return handle;
  };

  clearRequestInterval = function(handle) {
    if (window.cancelAnimationFrame) {
      return window.cancelAnimationFrame(handle.value);
    } else if (window.webkitCancelAnimationFrame) {
      return window.webkitCancelAnimationFrame(handle.value);
    } else if (window.webkitCancelRequestAnimationFrame) {
      return window.webkitCancelRequestAnimationFrame(handle.value);
    } else if (window.mozCancelRequestAnimationFrame) {
      return window.mozCancelRequestAnimationFrame(handle.value);
    } else if (window.oCancelRequestAnimationFrame) {
      return window.oCancelRequestAnimationFrame(handle.value);
    } else if (window.msCancelRequestAnimationFrame) {
      return window.msCancelRequestAnimationFrame(handle.value);
    } else {
      return clearInterval(handle);
    }
  };

  window.requestAnimFrame = requestAnimFrame;

  window.requestInterval = requestInterval;

  window.clearRequestInterval = clearRequestInterval;

}).call(this);

(function() {
  var Game,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.Game = Game = (function(_super) {
    __extends(Game, _super);

    function Game() {
      Game.__super__.constructor.call(this);
      this.loopHandle;
      this.upPressed = false;
      this.downPressed = false;
      this.dir = this.dirIdle;
      this.side = 0;
      this.enemySide = 1;
      this.dirUpdates = [];
      this.seq = -1;
      this.pos = null;
      this.ballUpdates = [];
      this.timeDiff = null;
      this.ghost = null;
      Game.debug = false;
      this.keyLeft = 37;
      this.keyUp = 38;
      this.keyRight = 39;
      this.keyDown = 40;
      this.keySpace = 32;
      this.startPos = [[10, 80], [760, this.canvasHeight - 80 - this.racketHeight]];
      this.racketColor = '#fff';
    }

    Game.prototype.drawRacket = function(x, y, color) {
      this.ctx.fillStyle = color;
      return this.ctx.fillRect(x, y, this.racketWidth, this.racketHeight);
    };

    Game.prototype.drawBall = function(ball, color) {
      this.ctx.fillStyle = color;
      return this.ctx.fillRect(ball.x, ball.y, this.ballSize, this.ballSize);
    };

    Game.prototype.drawBoard = function() {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.fillStyle = 'rgb(200,200,200)';
      this.ctx.fillRect(389, 5, 1, 430);
      this.drawRacket(this.startPos[this.side][0], this.gs[this.side].pos, this.racketColor);
      this.drawRacket(this.startPos[this.enemySide][0], this.gs[this.enemySide].pos, this.racketColor);
      this.drawBall(this.ball, 'rgb(200,200,200)');
      if (Game.debug && (this.ghost != null)) {
        return this.drawBall(this.ghost, 'rgb(0,200,0)');
      }
    };

    Game.prototype.gameLoop = function() {
      this.updateState();
      return this.drawBoard();
    };

    Game.prototype.updateState = function() {
      var dt, enemy, me, serverTime, time;
      time = this.time();
      dt = time - this.updateTime;
      if (this.timeDiff != null) {
        serverTime = time - this.timeDiff;
        if (this.ballUpdates.length) {
          this.ball = this.moveBall(this.ballUpdates, serverTime, dt);
        }
      } else {
        this.ball.t = this.updateTime;
        this.ball = this.moveBall([this.ball], time, dt);
      }
      enemy = this.gs[this.enemySide];
      enemy.pos = this.moveRacket(enemy.dir, enemy.updates, enemy.pos, time, this.updateTime);
      me = this.gs[this.side];
      this.pos = this.moveRacket(this.dir, this.dirUpdates, this.pos, time, this.updateTime);
      me.pos = this.pos;
      if (this.dirUpdates.length) {
        this.dir = this.dirUpdates[this.dirUpdates.length - 1].dir;
      }
      return this.updateTime = time;
    };

    Game.prototype.keyboardDown = function(evt) {
      switch (evt.which) {
        case this.keyDown:
          this.downPressed = true;
          this.upPressed = false;
          return this.sendState(this.dirDown);
        case this.keyUp:
          this.upPressed = true;
          this.downPressed = false;
          return this.sendState(this.dirUp);
      }
    };

    Game.prototype.keyboardUp = function(evt) {
      switch (evt.which) {
        case this.keyDown:
          this.downPressed = false;
          if (!this.upPressed) {
            return this.sendState(this.dirIdle);
          }
          break;
        case this.keyUp:
          this.upPressed = false;
          if (!this.downPressed) {
            return this.sendState(this.dirIdle);
          }
      }
    };

    Game.prototype.sendState = function(dir) {
      this.dirUpdates.push({
        dir: dir,
        seq: ++this.seq,
        t: this.time()
      });
      return this.socket.emit('state', {
        dir: dir,
        side: this.side,
        seq: this.seq
      });
    };

    Game.prototype.updateScore = function(scores) {
      var ind, scr, _i, _len, _results;
      _results = [];
      for (ind = _i = 0, _len = scores.length; _i < _len; ind = ++_i) {
        scr = scores[ind];
        _results.push($('#score_' + ind).text(scr));
      }
      return _results;
    };

    Game.prototype.startGame = function() {
      var canvas;
      canvas = document.getElementById('game_board_canvas');
      this.ctx = canvas.getContext('2d');
      this.updateTime = this.time();
      return this.loopHandle = requestInterval(((function(_this) {
        return function() {
          return _this.gameLoop();
        };
      })(this)), this.dt);
    };

    Game.prototype.stopGame = function() {
      $(window).off('keydown');
      $(window).off('keyup');
      return clearRequestInterval(this.loopHandle);
    };

    Game.prototype.seq2index = function(seq) {
      var ind, upd, _i, _len, _ref;
      _ref = this.dirUpdates;
      for (ind = _i = 0, _len = _ref.length; _i < _len; ind = ++_i) {
        upd = _ref[ind];
        if (upd.seq === seq) {
          return ind;
        }
      }
      return -1;
    };

    Game.prototype.time2index = function(keepTime) {
      var b, indFromEnd, _i, _ref;
      indFromEnd = -1;
      _ref = this.ballUpdates;
      for (_i = _ref.length - 1; _i >= 0; _i += -1) {
        b = _ref[_i];
        if (b.t < keepTime) {
          break;
        }
        indFromEnd += 1;
      }
      return this.ballUpdates.length - 2 - indFromEnd;
    };

    Game.prototype.start = function(socket) {
      this.socket = socket;
      socket.on('connect', (function(_this) {
        return function() {
          return console.log("Socket opened, Master!");
        };
      })(this));
      socket.on('joined', (function(_this) {
        return function(data) {
          _this.timeDiff = _this.time() - data.t + 100;
          _this.side = data.side;
          _this.enemySide = _this.side === 0 ? 1 : 0;
          _this.ballUpdates = [];
          _this.dirUpdates = [];
          $(window).on('keydown', function(e) {
            return _this.keyboardDown(e);
          });
          return $(window).on('keyup', function(e) {
            return _this.keyboardUp(e);
          });
        };
      })(this));
      socket.on('move', (function(_this) {
        return function(data) {
          var howmany;
          _this.gs = data.gamers;
          howmany = 1 + _this.time2index(_this.time() - _this.timeDiff - 1000);
          _this.ballUpdates.splice(0, howmany);
          _this.ballUpdates.push(data.ball);
          _this.ghost = data.ball;
          if (_this.pos == null) {
            _this.pos = _this.gs[_this.side].pos;
          }
          if (_this.gs[_this.side].lastSeq <= _this.lastProcessedSeq) {
            howmany = 1 + _this.seq2index(_this.gs[_this.side].lastSeq);
            return _this.dirUpdates.splice(0, howmany);
          }
        };
      })(this));
      socket.on('score', (function(_this) {
        return function(data) {
          return _this.updateScore(data.scores);
        };
      })(this));
      socket.on('busy', (function(_this) {
        return function(data) {};
      })(this));
      socket.on('disconnect', (function(_this) {
        return function() {
          console.log('Server disconnect');
          return _this.stopGame();
        };
      })(this));
      socket.emit('join');
      return this.startGame();
    };

    return Game;

  })(GameCore);

}).call(this);

(function() {
  var Game, GameCore, cookie, timers,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  GameCore = require('./game.core');

  cookie = require('cookie');

  timers = require('timers');

  module.exports = Game = (function(_super) {
    __extends(Game, _super);

    function Game() {
      var initPos;
      Game.__super__.constructor.call(this);
      this.gamers = {};
      initPos = this.canvasHeight / 2 - 40;
      this.gs = [
        {
          pos: initPos - this.racketHeight,
          dir: this.dirIdle,
          updates: [],
          lastSeq: -1
        }, {
          pos: initPos + this.racketHeight,
          dir: this.dirIdle,
          updates: [],
          lastSeq: -1
        }
      ];
      this.ballResetOffset = 50;
      this.scores = [0, 0];
      this.count = 0;
      this.inDaLoop = false;
    }

    Game.prototype.addGamer = function(sid, socket, side) {
      this.gamers[sid] = {
        socket: socket,
        updates: [],
        side: side,
        pos: this.gs[side].pos
      };
      return this.sendJoined(sid);
    };

    Game.prototype.sendJoined = function(sid) {
      return this.gamers[sid].socket.emit('joined', {
        side: this.gamers[sid].side,
        t: this.time()
      });
    };

    Game.prototype.sendMove = function(sid) {
      var g;
      g = this.gamers[sid];
      this.gs[g.side].updates = g.updates;
      return g.socket.emit('move', {
        gamers: this.gs,
        ball: this.ball
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

    Game.prototype.sendScore = function(sid) {
      return this.gamers[sid].socket.emit('score', {
        scores: this.scores
      });
    };

    Game.prototype.sendScoreAll = function() {
      var sid, _results;
      _results = [];
      for (sid in this.gamers) {
        _results.push(this.sendScore(sid));
      }
      return _results;
    };

    Game.prototype.updateState = function(sid, dir, seq) {
      return this.gamers[sid].updates.push({
        dir: dir,
        seq: seq,
        t: this.time()
      });
    };

    Game.prototype.placeBall = function(side) {
      this.ball.y = this.gs[side].pos + this.racketHeight / 2 - this.ballSize / 2;
      if (side === 0) {
        this.ball.x = this.ballResetOffset;
        this.ball.angle = Math.asin((this.gs[1].pos - this.gs[0].pos) / (this.canvasWidth - 2 * this.xOffset));
      } else {
        this.ball.x = this.canvasWidth - this.ballResetOffset - this.ballSize;
        this.ball.angle = Math.PI + Math.asin((this.gs[1].pos - this.gs[0].pos) / (this.canvasWidth - 2 * this.xOffset));
      }
      return this.ball.v = this.initBallV;
    };

    Game.prototype.moveRackets = function(currentTime) {
      var gamer, lastUpdate, sid, _ref, _results;
      _ref = this.gamers;
      _results = [];
      for (sid in _ref) {
        gamer = _ref[sid];
        gamer.pos = this.moveRacket(gamer.dir, gamer.updates, gamer.pos, currentTime, this.updateTime);
        this.gs[gamer.side].pos = gamer.pos;
        if (gamer.updates.length) {
          lastUpdate = gamer.updates[gamer.updates.length - 1];
          gamer.dir = lastUpdate.dir;
          this.gs[gamer.side].lastSeq = lastUpdate.seq;
        }
        gamer.updates = [];
        _results.push(this.gs[gamer.side].updates = []);
      }
      return _results;
    };

    Game.prototype.checkScoreUpdate = function() {
      var side;
      if (this.ball.x < 0 || this.ball.x > this.canvasWidth - this.ballSize) {
        side = -1;
        if (this.ball.x < 0) {
          this.scores[1] += 1;
          side = 0;
        }
        if (this.ball.x > this.canvasWidth - this.ballSize) {
          this.scores[0] += 1;
          side = 1;
        }
        this.placeBall(side);
        return this.sendScoreAll();
      }
    };

    Game.prototype.startLoop = function() {
      if (this.inDaLoop) {
        return;
      }
      this.gameLoop = timers.setInterval((function(_this) {
        return function() {
          return _this.gameStep();
        };
      })(this), this.dt);
      return this.inDaLoop = true;
    };

    Game.prototype.endLoop = function() {
      if (!this.inDaLoop) {
        return;
      }
      timers.clearInterval(this.gameLoop);
      this.inDaLoop = false;
      return this.scores = [0, 0];
    };

    Game.prototype.gameStep = function() {
      var time;
      time = this.time();
      this.moveRackets(time);
      this.ball.t = this.updateTime;
      this.ball = this.moveBall([this.ball], time, time - this.updateTime);
      this.ball.t = time;
      this.checkScoreUpdate();
      this.sendMoveAll();
      return this.updateTime = time;
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
      var sid;
      sid = cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
      console.log("Have a connection: " + sid + " (socket id: " + socket.id + ")");
      socket.on('join', (function(_this) {
        return function(data) {
          if (sid in _this.gamers) {
            _this.sendJoined(sid);
            _this.sendMove(sid);
            return;
          }
          if (_this.count === 2) {
            socket.emit('busy');
            return;
          }
          console.log("I can has join: " + sid);
          _this.addGamer(sid, socket, _this.count);
          _this.count++;
          if (_this.count > 0) {
            _this.startLoop();
          }
          _this.sendMove(sid);
          return _this.sendScore(sid);
        };
      })(this));
      socket.on('state', (function(_this) {
        return function(data) {
          return _this.updateState(sid, data.dir, data.seq);
        };
      })(this));
      return socket.on('disconnect', (function(_this) {
        return function() {
          if (!(sid in _this.gamers && _this.gamers[sid].socket.id === socket.id)) {
            return;
          }
          console.log("Disconnecting: " + sid);
          _this.oneQuitted(sid);
          _this.count--;
          if (_this.count === 0) {
            return _this.endLoop();
          }
        };
      })(this));
    };

    return Game;

  })(GameCore);

}).call(this);

(function() {
  var Game, GameCore, requestAnimFrame, requestInterval,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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
        fn.call();
        start = new Date().getTime();
      }
      return handle.value = requestAnimFrame(loopy);
    };
    handle.value = requestAnimFrame(loopy);
    return handle;
  };

  window.requestAnimFrame = requestAnimFrame;

  window.requestInterval = requestInterval;

  GameCore = (function() {

    function GameCore() {
      this.canvasWidth = 780;
      this.canvasHeight = 440;
      this.xOffset = 20;
      this.racketHeight = 55;
      this.racketWidth = 10;
      this.ballSize = 8;
      this.dirUp = -1;
      this.dirIdle = 0;
      this.dirDown = 1;
      this.gs = [
        {
          pos: 10,
          dir: this.dirIdle,
          updates: []
        }, {
          pos: 10,
          dir: this.dirIdle,
          updates: []
        }
      ];
      this.ballPosition = [this.canvasWidth / 2 - this.ballSize / 2, this.canvasHeight / 2 - this.ballSize / 2];
      this.angle = (20 + Math.random() * 50) * Math.PI / 180;
      this.ballV = 200;
      this.maxBallV = 400;
      this.initBallV = 200;
      this.minBallV = 100;
      this.racketV = 0.15;
      this.speedUp = 0.9;
      this.updateTime = null;
      this.dt = 20;
      this.dtInSec = this.dt / 1000;
      this.lastProcessedSeq = -1;
    }

    GameCore.prototype.time = function() {
      return new Date().getTime();
    };

    GameCore.prototype.moveRacket = function(dir, dirUpdates, pos, currentTime, lastTime) {
      var upd, _i, _len;
      for (_i = 0, _len = dirUpdates.length; _i < _len; _i++) {
        upd = dirUpdates[_i];
        if (upd.t <= lastTime || upd.t > currentTime) continue;
        pos = this.moveRacketBit(pos, dir, upd.t - lastTime, currentTime, lastTime);
        lastTime = upd.t;
        dir = upd.dir;
        this.lastProcessedSeq = upd.seq;
      }
      return this.moveRacketBit(pos, dir, currentTime - lastTime, currentTime, lastTime);
    };

    GameCore.prototype.moveRacketBit = function(pos, dir, dt, currentTime, lastTime) {
      var newPos;
      newPos = dir === this.dirUp ? pos - this.racketV * dt : dir === this.dirDown ? pos + this.racketV * dt : pos;
      if (newPos < 0) newPos = 0;
      if (newPos > this.canvasHeight - this.racketHeight) {
        newPos = this.canvasHeight - this.racketHeight;
      }
      return newPos;
    };

    GameCore.prototype.moveBall = function() {
      var ds;
      ds = this.ballV * this.dtInSec;
      console.log("1: " + this.ballPosition[0] + ", " + this.ballPosition[1]);
      this.ballPosition[0] += Math.round(ds * Math.cos(this.angle));
      this.ballPosition[1] += Math.round(ds * Math.sin(this.angle));
      return this.checkBallCollision();
    };

    GameCore.prototype.checkBallCollision = function() {
      if (this.ballPosition[1] < 0) {
        this.ballPosition[1] = 0;
        this.angle = -this.angle;
        return;
      }
      if (this.ballPosition[1] > this.canvasHeight - this.ballSize) {
        this.ballPosition[1] = this.canvasHeight - this.ballSize;
        this.angle = -this.angle;
        return;
      }
      if (this.ballPosition[0] <= this.xOffset) {
        if (this.ballPosition[1] >= this.gs[0].pos && this.ballPosition[1] <= this.gs[0].pos + this.racketHeight - this.ballSize) {
          this.ballPosition[0] = this.xOffset;
          this.angle = Math.PI - this.angle;
          this.ballV = this.ballV * (this.speedUp + Math.abs(this.ballPosition[1] - this.gs[0].pos + this.racketHeight / 2) / (this.gs[0].pos + this.racketHeight / 2));
          if (this.ballV >= this.maxBallV) {
            this.ballV = this.maxBallV;
          } else if (this.ballV <= this.minBallV) {
            this.ballV = this.minBallV;
          } else {
            this.ballV = this.ballV * (this.speedUp + Math.abs(this.ballPosition[1] - this.gs[0].pos + this.racketHeight / 2) / (this.gs[0].pos + this.racketHeight / 2));
          }
          return;
        }
      }
      if (this.ballPosition[0] >= this.canvasWidth - this.xOffset - this.ballSize) {
        if (this.ballPosition[1] >= this.gs[1].pos && this.ballPosition[1] <= this.gs[1].pos + this.racketHeight - this.ballSize) {
          this.ballPosition[0] = this.canvasWidth - this.xOffset - this.ballSize;
          this.angle = Math.PI - this.angle;
          if (this.ballV >= this.maxBallV) {
            this.ballV = this.maxBallV;
          } else if (this.ballV <= this.minBallV) {
            this.ballV = this.minBallV;
          } else {
            this.ballV = this.ballV * (this.speedUp + Math.abs(this.ballPosition[1] - this.gs[0].pos + this.racketHeight / 2) / (this.gs[0].pos + this.racketHeight / 2));
          }
        }
      }
    };

    return GameCore;

  })();

  if (typeof module === 'undefined') {
    window.GameCore = GameCore;
  } else {
    module.exports = GameCore;
  }

  window.Game = Game = (function(_super) {

    __extends(Game, _super);

    function Game() {
      Game.__super__.constructor.call(this);
      this.upPressed = false;
      this.downPressed = false;
      this.dir = this.dirIdle;
      this.side = 0;
      this.enemySide = 1;
      this.scores = [0, 0];
      this.dirUpdates = [];
      this.seq = -1;
      this.pos;
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

    Game.prototype.drawBall = function(x, y) {
      this.ctx.fillStyle = "rgb(200, 200, 200)";
      return this.ctx.fillRect(x, y, this.ballSize, this.ballSize);
    };

    Game.prototype.drawBoard = function() {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.fillStyle = "rgb(200, 200, 200)";
      this.ctx.fillRect(389, 5, 1, 430);
      this.drawRacket(this.startPos[this.side][0], this.gs[this.side].pos, this.racketColor);
      this.drawRacket(this.startPos[this.enemySide][0], this.gs[this.enemySide].pos, this.racketColor);
      return this.drawBall(this.ballPosition[0], this.ballPosition[1]);
    };

    Game.prototype.gameLoop = function() {
      this.updateState();
      return this.drawBoard();
    };

    Game.prototype.updateState = function() {
      var enemy, lastTime, me;
      lastTime = this.updateTime;
      this.updateTime = this.time();
      this.moveBall();
      enemy = this.gs[this.enemySide];
      enemy.pos = this.moveRacket(enemy.dir, enemy.updates, enemy.pos, this.updateTime, lastTime);
      me = this.gs[this.side];
      this.pos = this.moveRacket(this.dir, this.dirUpdates, this.pos, this.updateTime, lastTime);
      me.pos = this.pos;
      if (this.dirUpdates.length) {
        return this.dir = this.dirUpdates[this.dirUpdates.length - 1].dir;
      }
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
          if (!this.upPressed) return this.sendState(this.dirIdle);
          break;
        case this.keyUp:
          this.upPressed = false;
          if (!this.downPressed) return this.sendState(this.dirIdle);
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
      var ind, scr, _len, _results;
      _results = [];
      for (ind = 0, _len = scores.length; ind < _len; ind++) {
        scr = scores[ind];
        _results.push($('#score_' + ind).text(scr));
      }
      return _results;
    };

    Game.prototype.startGame = function() {
      var canvas,
        _this = this;
      canvas = document.getElementById('game_board_canvas');
      this.ctx = canvas.getContext('2d');
      this.updateTime = this.time();
      return requestInterval((function() {
        return _this.gameLoop();
      }), this.dt);
    };

    Game.prototype.seq2index = function(seq) {
      var ind, upd, _len, _ref;
      _ref = this.dirUpdates;
      for (ind = 0, _len = _ref.length; ind < _len; ind++) {
        upd = _ref[ind];
        if (upd.seq === seq) return ind;
      }
      return -1;
    };

    Game.prototype.start = function(socket) {
      var _this = this;
      this.socket = socket;
      socket.on('connect', function() {
        return console.log("Socket opened, Master!");
      });
      socket.on('joined', function(side) {
        _this.side = side;
        _this.enemySide = side === 0 ? 1 : 0;
        $(window).on('keydown', function(e) {
          return _this.keyboardDown(e);
        });
        return $(window).on('keyup', function(e) {
          return _this.keyboardUp(e);
        });
      });
      socket.on('move', function(data) {
        var howmany;
        _this.gs = data.gamers;
        if (_this.pos === void 0) _this.pos = _this.gs[_this.side].pos;
        if (_this.gs[_this.side].lastSeq <= _this.lastProcessedSeq) {
          howmany = _this.seq2index(_this.gs[_this.side].lastSeq) + 1;
          _this.dirUpdates.splice(0, howmany);
        }
        _this.ballPosition = data.ball.pos;
        _this.ballV = data.ball.v;
        return _this.angle = data.ball.angle;
      });
      socket.on('score', function(data) {
        return _this.updateScore(data.scores);
      });
      socket.on('busy', function(data) {});
      socket.on('disconnect', function() {
        $(window).off('keydown');
        return $(window).off('keyup');
      });
      socket.emit('join');
      return this.startGame();
    };

    return Game;

  })(GameCore);

}).call(this);

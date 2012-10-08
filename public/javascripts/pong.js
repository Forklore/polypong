(function() {
  var Game;

  window.Game = Game = (function() {

    function Game() {
      this.upPressed = false;
      this.downPressed = false;
      this.yPositions = [10, 10];
      this.side = 0;
      this.enemySide = 1;
      this.ballPos = [100, 100];
      this.angle = (20 + Math.random() * 50) * Math.PI / 180;
      this.canvasWidth = 780;
      this.canvasHeight = 440;
      this.racketHeight = 55;
      this.racketWidth = 10;
      this.ballSize = 8;
      this.dy = 5;
      this.dt = 20;
      this.dtInSec = this.dt / 1000;
      this.ballV = 200;
      this.keyLeft = 37;
      this.keyUp = 38;
      this.keyRight = 39;
      this.keyDown = 40;
      this.keySpace = 32;
      this.dirUp = -1;
      this.dirIdle = 0;
      this.dirDown = 1;
      this.playersStartPos = [[10, 80], [760, this.canvasHeight - 80 - this.racketHeight]];
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
      this.drawRacket(this.playersStartPos[this.side][0], this.yPositions[this.side], this.racketColor);
      this.drawRacket(this.playersStartPos[this.enemySide][0], this.yPositions[this.enemySide], this.racketColor);
      this.drawBall(this.ballPos[0], this.ballPos[1]);
      return console.log("" + this.yPositions[self.side] + ", " + this.yPositions[self.enemySide] + ", ball: " + this.ballPos);
    };

    Game.prototype.gameLoop = function() {
      return this.drawBoard();
    };

    Game.prototype.updateState = function() {
      return this.updateBall();
    };

    Game.prototype.updateBall = function(ballPos) {
      console.log(ballPos);
      return this.ballPos = ballPos;
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
      return this.socket.emit('state', {
        side: this.side,
        state: dir
      });
    };

    Game.prototype.startGame = function() {
      var canvas, self;
      canvas = document.getElementById('game_board_canvas');
      this.ctx = canvas.getContext('2d');
      self = this;
      return setInterval((function() {
        return self.gameLoop();
      }), this.dt);
    };

    Game.prototype.start = function(socket) {
      var self;
      self = this;
      this.socket = socket;
      socket.on('connect', function() {
        return console.log("Socket opened, Master!");
      });
      socket.on('joined', function(side) {
        self.side = side;
        self.enemySide = side === 0 ? 1 : 0;
        $(window).on('keydown', function(e) {
          return self.keyboardDown(e);
        });
        return $(window).on('keyup', function(e) {
          return self.keyboardUp(e);
        });
      });
      socket.on('move', function(data) {
        self.yPositions = data.positions;
        return self.ballPos = data.ballPosition;
      });
      socket.on('busy', function(data) {});
      socket.emit('join');
      return this.startGame();
    };

    return Game;

  })();

}).call(this);

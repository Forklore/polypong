(function() {
  var Game;

  window.Game = Game = (function() {

    Game.canvas_width = 700;

    Game.canvas_height = 400;

    Game.racket_height = 55;

    Game.racket_width = 10;

    Game.dy = 5;

    Game.key_left = 37;

    Game.key_up = 38;

    Game.key_right = 39;

    Game.key_down = 40;

    Game.players_pos = [10, 680];

    Game.players_colors = ['rgb(200,0,0)', 'rgb(0,0,200)'];

    Game.players_states = [0, 0];

    function Game() {
      this.up_pressed = false;
      this.down_pressed = false;
      this.y_positions = [10, 10];
      this.side = 0;
      this.enemy_side = 1;
    }

    Game.prototype.drawRacket = function(x, y, color) {
      this.ctx.fillStyle = color;
      return this.ctx.fillRect(x, y, Game.racket_width, Game.racket_height);
    };

    Game.prototype.drawBall = function(x, y) {
      this.ctx.fillStyle = "rgb(100, 100, 0)";
      this.ctx.arc(x, y, 5, 0, Math.PI * 2, true);
      return this.ctx.fill();
    };

    Game.prototype.drawBoard = function() {
      this.processInputs();
      this.ctx.clearRect(0, 0, Game.canvas_width, Game.canvas_height);
      this.drawRacket(Game.players_pos[this.side], this.y_positions[this.side], Game.players_colors[this.side]);
      this.drawRacket(Game.players_pos[this.enemy_side], this.y_positions[this.enemy_side], Game.players_colors[this.enemy_side]);
      this.drawBall(100, 100);
      return this.sendState();
    };

    Game.prototype.keyboardDown = function(evt) {
      switch (evt.which) {
        case Game.key_down:
          this.down_pressed = true;
          return this.up_pressed = false;
        case Game.key_up:
          this.up_pressed = true;
          return this.down_pressed = false;
      }
    };

    Game.prototype.processInputs = function() {
      if (this.up_pressed) {
        Game.players_states[this.side] = -1;
      } else if (this.down_pressed) {
        Game.players_states[this.side] = 1;
      } else {
        Game.players_states[this.side] = 0;
      }
      return console.log(Game.players_states[this.side]);
    };

    Game.prototype.sendState = function() {
      return this.socket.emit('state', {
        side: this.side,
        state: Game.players_states[this.side]
      });
    };

    Game.prototype.startGame = function() {
      var canvas, self;
      canvas = document.getElementById('game_board_canvas');
      this.ctx = canvas.getContext('2d');
      this.drawBoard();
      self = this;
      return setInterval((function() {
        return self.drawBoard();
      }), 500);
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
        self.enemy_side = side === 0 ? 1 : 0;
        $(window).on('keydown', function(e) {
          return self.keyboardDown(e);
        });
        return console.log('Joined');
      });
      socket.on('move', function(data) {
        self.y_positions[self.side] = data.positions[self.side];
        self.y_positions[self.enemy_side] = data.positions[self.enemy_side];
        console.log("" + self.y_positions[self.side] + ", " + self.y_positions[self.enemy_side]);
        this.down_pressed = false;
        this.up_pressed = false;
        this.players_states = [0, 0];
        return self.drawBoard();
      });
      socket.emit('join');
      return this.startGame();
    };

    return Game;

  })();

}).call(this);
